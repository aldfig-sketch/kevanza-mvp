import { createServiceSupabaseClient } from './supabaseServer'
import { sendEmail } from './emailService'

type Requirement = {
  id: string
  numero: string | null
  titulo: string | null
  estado: string
  municipio_id: string
  created_at: string
  fecha_envio_compra: string | null
  fecha_envio_juridico: string | null
  fecha_decreto_generado: string | null
}

type AlertConfig = {
  plazo_compra_dias: number
  plazo_juridico_dias: number
  plazo_firma_dias: number
  horas_sin_actividad_alerta: number
  horas_sin_actividad_critica: number
  dias_antes_vencimiento_alerta: number
  alertar_correo: boolean
  alertas_a_comprador: boolean
  alertas_a_jefatura: boolean
  alertas_a_admin: boolean
}

const TERMINAL_STATES = ['PUBLICADA_MP', 'RECHAZADA_COMPRA', 'RECHAZADA_JURIDICO', 'ARCHIVADO']
const BUYER_ROLES = new Set(['UNIDAD_COMPRA'])
const HEAD_ROLES = new Set(['JEFE_COMPRAS'])
const ADMIN_ROLES = new Set(['ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'])

const DEFAULT_CONFIG: AlertConfig = {
  plazo_compra_dias: 3,
  plazo_juridico_dias: 5,
  plazo_firma_dias: 2,
  horas_sin_actividad_alerta: 24,
  horas_sin_actividad_critica: 48,
  dias_antes_vencimiento_alerta: 1,
  alertar_correo: true,
  alertas_a_comprador: true,
  alertas_a_jefatura: true,
  alertas_a_admin: true,
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }
  return value.replace(/[&<>'"]/g, (character) => entities[character] || character)
}

function stageFor(requirement: Requirement, config: AlertConfig) {
  const stages: Record<string, { code: string; start: string | null; days: number }> = {
    ENVIADA_COMPRA: { code: 'COMPRA', start: requirement.fecha_envio_compra, days: config.plazo_compra_dias },
    ENVIADA_JURIDICO: { code: 'JURIDICO', start: requirement.fecha_envio_juridico, days: config.plazo_juridico_dias },
    EN_REVISION: { code: 'JURIDICO', start: requirement.fecha_envio_juridico, days: config.plazo_juridico_dias },
    PENDIENTE_FIRMA: { code: 'FIRMA', start: requirement.fecha_decreto_generado, days: config.plazo_firma_dias },
  }
  return stages[requirement.estado] || null
}

async function notifyRecipients(
  client: ReturnType<typeof createServiceSupabaseClient>,
  requirement: Requirement,
  alertId: string,
  alertType: string,
  severity: string,
  description: string,
  config: AlertConfig
) {
  const [{ data: profiles }, { data: assignments }] = await Promise.all([
    client.from('usuarios').select('id,email,nombre,full_name,rol').eq('municipio_id', requirement.municipio_id).eq('activo', true),
    client.from('usuarios_roles').select('usuario_id,activo,roles(codigo)').eq('institucion_id', requirement.municipio_id).eq('activo', true),
  ])

  const assignedRoles = new Map<string, Set<string>>()
  for (const assignment of assignments || []) {
    const role = Array.isArray((assignment as any).roles) ? (assignment as any).roles[0] : (assignment as any).roles
    if (!role?.codigo) continue
    const set = assignedRoles.get((assignment as any).usuario_id) || new Set<string>()
    set.add(role.codigo)
    assignedRoles.set((assignment as any).usuario_id, set)
  }

  const recipients = (profiles || []).filter((profile: any) => {
    const roles = new Set<string>([profile.rol, ...(assignedRoles.get(profile.id) || [])].filter(Boolean))
    return (config.alertas_a_comprador && [...roles].some((role) => BUYER_ROLES.has(role)))
      || (config.alertas_a_jefatura && [...roles].some((role) => HEAD_ROLES.has(role)))
      || (config.alertas_a_admin && [...roles].some((role) => ADMIN_ROLES.has(role)))
  })

  const ids = recipients.map((recipient: any) => recipient.id)
  if (ids.length) {
    await client.from('notificaciones_usuario').insert(ids.map((usuario_id) => ({
      usuario_id,
      licitacion_id: requirement.id,
      tipo: alertType,
      mensaje: description,
    })))
  }

  let emailsSent = 0
  if (config.alertar_correo) {
    for (const recipient of recipients as any[]) {
      if (!recipient.email) continue
      const response = await sendEmail(
        recipient.email,
        `Alerta ${severity}: ${requirement.numero || requirement.titulo || 'Requerimiento'}`,
        `<p>Hola ${escapeHtml(recipient.nombre || recipient.full_name || 'usuario')},</p><p>${escapeHtml(description)}</p><p>Revisa el requerimiento en KEVANZA.</p>`
      )
      if ((response as any)?.success !== false && !(response as any)?.error) emailsSent += 1
    }
  }

  await client.from('alertas_registradas').update({
    enviado_a: ids,
    canales_enviados: emailsSent ? ['correo'] : [],
  }).eq('id', alertId)

  return { recipientCount: ids.length, emailsSent }
}

export async function verificarYGenerarAlertas() {
  const client = createServiceSupabaseClient()
  const { data: requirements, error: requirementsError } = await client
    .from('licitaciones')
    .select('id,numero,titulo,estado,municipio_id,created_at,fecha_envio_compra,fecha_envio_juridico,fecha_decreto_generado')
    .not('estado', 'in', `(${TERMINAL_STATES.join(',')})`)
  if (requirementsError) throw requirementsError

  const { data: configurations, error: configError } = await client.from('alertas_parametros').select('*')
  if (configError) throw configError
  const configByInstitution = new Map((configurations || []).map((config: AlertConfig & { institucion_id: string }) => [config.institucion_id, config]))
  let created = 0
  let notified = 0

  for (const requirement of (requirements || []) as Requirement[]) {
    const config = { ...DEFAULT_CONFIG, ...(configByInstitution.get(requirement.municipio_id) || {}) }
    const stage = stageFor(requirement, config)
    if (!stage?.start) continue

    const elapsedHours = (Date.now() - new Date(stage.start).getTime()) / 3_600_000
    const elapsedDays = elapsedHours / 24
    const overdue = elapsedDays > stage.days
    const nearDue = !overdue && stage.days - elapsedDays <= config.dias_antes_vencimiento_alerta
    const idleCritical = elapsedHours >= config.horas_sin_actividad_critica
    const idleWarning = elapsedHours >= config.horas_sin_actividad_alerta
    if (!overdue && !nearDue && !idleCritical && !idleWarning) continue

    const severity = idleCritical ? 'critica' : overdue ? 'roja' : 'amarilla'
    const type = idleCritical ? `${stage.code}_INACTIVIDAD_CRITICA` : overdue ? `${stage.code}_VENCIDA` : `${stage.code}_VENCIMIENTO`
    const remaining = Math.max(0, Math.ceil((stage.days - elapsedDays) * 24) / 24)
    const description = overdue || idleCritical
      ? `El requerimiento está ${idleCritical ? 'sin actividad crítica' : 'fuera de plazo'} en la etapa ${stage.code}.`
      : `El requerimiento vence próximamente en la etapa ${stage.code}; quedan aproximadamente ${remaining} días.`

    const { data: alert, error: insertError } = await client.from('alertas_registradas').insert({
      licitacion_id: requirement.id,
      tipo_alerta: type,
      descripcion: description,
      severidad: severity,
    }).select('id').single()
    if (insertError) {
      if (insertError.code === '23505') continue
      throw insertError
    }
    created += 1
    const result = await notifyRecipients(client, requirement, alert.id, type, severity, description, config)
    notified += result.recipientCount
  }

  return { processed: (requirements || []).length, created, notified }
}
