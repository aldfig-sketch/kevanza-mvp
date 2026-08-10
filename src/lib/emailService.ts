import { Resend } from 'resend'
import { emailTemplates } from './emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function enviarEmail(payload: EmailPayload) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurada - email no enviado')
      return { success: false, message: 'API key no configurada' }
    }

    const response = await resend.emails.send({
      from: 'noreply@kevanza.cl',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })

    console.log('✅ Email enviado:', response)
    return response
  } catch (error) {
    console.error('❌ Error enviando email:', error)
    return { error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function notificarEnviadoAJuridico(
  emailUsuario: string,
  nombreUsuario: string,
  tituloRequerimiento: string
) {
  const template = emailTemplates.enviadoAJuridico(nombreUsuario, tituloRequerimiento)
  return enviarEmail({
    to: emailUsuario,
    subject: template.subject,
    html: template.html,
  })
}

export async function notificarObservacionesJuridicas(
  emailUsuario: string,
  nombreUsuario: string,
  tituloRequerimiento: string,
  observaciones: Record<string, any>
) {
  const obsString = JSON.stringify(observaciones, null, 2)
  const template = emailTemplates.observacionesJuridicas(
    nombreUsuario,
    tituloRequerimiento,
    obsString
  )
  return enviarEmail({
    to: emailUsuario,
    subject: template.subject,
    html: template.html,
  })
}

export async function notificarBasesAprobadas(
  emailUsuario: string,
  nombreUsuario: string,
  tituloRequerimiento: string
) {
  const template = emailTemplates.basesAprobadas(nombreUsuario, tituloRequerimiento)
  return enviarEmail({
    to: emailUsuario,
    subject: template.subject,
    html: template.html,
  })
}

export async function notificarNuevaRevision(
  emailJuridico: string,
  nombreJuridico: string,
  tituloRequerimiento: string,
  nombreUsuario: string
) {
  const template = emailTemplates.nuevaRevision(
    nombreJuridico,
    tituloRequerimiento,
    nombreUsuario
  )
  return enviarEmail({
    to: emailJuridico,
    subject: template.subject,
    html: template.html,
  })
}
