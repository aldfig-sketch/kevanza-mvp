/**
 * Reglas de dominio KEVANZA — Ley 19.886 / DS 661/2024
 * Fuente: docs/ESPEC_BASES_LICITACIONES.md
 *
 * - Clasificación por UTM (L1/LE/LP/LQ/LR) y obligaciones de garantía.
 * - Campos específicos por tipo de compra.
 * - Validaciones estándar.
 */

// Valor UTM referencial (CLP). Actualizar mensualmente (SII).
// TODO: mover a configuración / tabla de parámetros.
export const UTM_CLP = 68000

export type TipoCompra = 'Infraestructura' | 'Suministros' | 'Servicios' | 'Consultoría'
export type EstadoRequerimiento =
  | 'BORRADOR'
  | 'ENVIADA_COMPRA'
  | 'RECHAZADA_COMPRA'
  | 'APROBADA_COMPRA'
  | 'BASES_GENERADAS'
  | 'ENVIADA_JURIDICO'
  | 'EN_REVISION'
  | 'OBSERVADO'
  | 'RECHAZADA_JURIDICO'
  | 'APROBADO_JURIDICO'
  | 'DECRETO_GENERADO'
  | 'PENDIENTE_FIRMA'
  | 'LISTO_PUBLICACION'
  | 'PUBLICADA_MP'
  | 'LISTO_MERCADO_PUBLICO'
  | 'ARCHIVADO'

export const ESTADO_REQUERIMIENTO_LABELS: Record<EstadoRequerimiento, string> = {
  BORRADOR: 'Borrador',
  ENVIADA_COMPRA: 'En revisión de compras',
  RECHAZADA_COMPRA: 'Observada por compras',
  APROBADA_COMPRA: 'Aprobada por compras',
  BASES_GENERADAS: 'Bases generadas',
  ENVIADA_JURIDICO: 'Enviada a jurídico',
  EN_REVISION: 'En revisión interna',
  OBSERVADO: 'Observado',
  RECHAZADA_JURIDICO: 'Observada por jurídico',
  APROBADO_JURIDICO: 'Aprobado jurídico',
  DECRETO_GENERADO: 'Decreto generado',
  PENDIENTE_FIRMA: 'Pendiente de firma',
  LISTO_PUBLICACION: 'Lista para publicar',
  PUBLICADA_MP: 'Publicada en Mercado Público',
  LISTO_MERCADO_PUBLICO: 'Listo para Mercado Público',
  ARCHIVADO: 'Archivado',
}

export const ESTADO_REQUERIMIENTO_TRANSITIONS: Record<EstadoRequerimiento, EstadoRequerimiento[]> = {
  BORRADOR: ['ENVIADA_COMPRA'],
  ENVIADA_COMPRA: ['RECHAZADA_COMPRA', 'APROBADA_COMPRA'],
  RECHAZADA_COMPRA: ['ENVIADA_COMPRA'],
  APROBADA_COMPRA: ['BASES_GENERADAS'],
  BASES_GENERADAS: ['ENVIADA_JURIDICO', 'OBSERVADO'],
  ENVIADA_JURIDICO: ['EN_REVISION', 'RECHAZADA_JURIDICO'],
  EN_REVISION: ['OBSERVADO', 'APROBADO_JURIDICO', 'RECHAZADA_JURIDICO'],
  OBSERVADO: ['EN_REVISION', 'BASES_GENERADAS'],
  RECHAZADA_JURIDICO: ['BASES_GENERADAS'],
  APROBADO_JURIDICO: ['DECRETO_GENERADO'],
  DECRETO_GENERADO: ['PENDIENTE_FIRMA'],
  PENDIENTE_FIRMA: ['LISTO_PUBLICACION'],
  LISTO_PUBLICACION: ['PUBLICADA_MP'],
  PUBLICADA_MP: ['ARCHIVADO'],
  LISTO_MERCADO_PUBLICO: ['ARCHIVADO'],
  ARCHIVADO: [],
}

export const ESTADOS_EDITABLES: EstadoRequerimiento[] = ['BORRADOR', 'RECHAZADA_COMPRA', 'OBSERVADO', 'RECHAZADA_JURIDICO']
export const ESTADOS_DOCUMENTOS_EDITABLES: EstadoRequerimiento[] = [
  'BORRADOR',
  'OBSERVADO',
  'EN_REVISION',
  'APROBADO_JURIDICO',
  'DECRETO_GENERADO',
]

export interface Clasificacion {
  codigo: 'L1' | 'LE' | 'LP' | 'LQ' | 'LR'
  nombre: string
  montoUTM: number
  garantiaSeriedadObligatoria: boolean
  garantiaCumplimientoObligatoria: boolean
  nota: string
}

/**
 * Clasifica la licitación por monto (CLP) según tramos en UTM.
 */
export function clasificarPorMonto(montoCLP: number): Clasificacion | null {
  if (!montoCLP || montoCLP <= 0) return null
  const utm = montoCLP / UTM_CLP

  if (utm < 100) {
    return {
      codigo: 'L1',
      nombre: 'L1 — Menor a 100 UTM',
      montoUTM: utm,
      garantiaSeriedadObligatoria: false,
      garantiaCumplimientoObligatoria: false,
      nota: 'Proceso simplificado. Garantías generalmente opcionales.',
    }
  }
  if (utm < 1000) {
    return {
      codigo: 'LE',
      nombre: 'LE — 100 a 1.000 UTM',
      montoUTM: utm,
      garantiaSeriedadObligatoria: false,
      garantiaCumplimientoObligatoria: false,
      nota: 'Garantía de seriedad opcional; fiel cumplimiento recomendada.',
    }
  }
  if (utm < 2000) {
    return {
      codigo: 'LP',
      nombre: 'LP — 1.000 a 2.000 UTM',
      montoUTM: utm,
      garantiaSeriedadObligatoria: false,
      garantiaCumplimientoObligatoria: true,
      nota: 'Garantía de fiel cumplimiento OBLIGATORIA (rango 5% – 30%).',
    }
  }
  if (utm < 5000) {
    return {
      codigo: 'LQ',
      nombre: 'LQ — 2.000 a 5.000 UTM',
      montoUTM: utm,
      garantiaSeriedadObligatoria: false,
      garantiaCumplimientoObligatoria: true,
      nota: 'Garantía de fiel cumplimiento obligatoria.',
    }
  }
  return {
    codigo: 'LR',
    nombre: 'LR — 5.000 UTM o más',
    montoUTM: utm,
    garantiaSeriedadObligatoria: true,
    garantiaCumplimientoObligatoria: true,
    nota: 'Garantías de seriedad y de fiel cumplimiento OBLIGATORIAS.',
  }
}

export type CampoTipo = 'number' | 'text' | 'boolean'

export interface CampoDef {
  name: string
  label: string
  tipo: CampoTipo
  obligatorio: boolean
  min?: number
  max?: number
  help?: string
  /** Para boolean: valor exigido por ley (si aplica) */
  debeSer?: boolean
  unidad?: string
}

/**
 * Campos específicos por tipo de compra (secciones 3.2 y 5 del spec).
 */
export const CAMPOS_POR_TIPO: Record<TipoCompra, CampoDef[]> = {
  Infraestructura: [
    { name: 'p_experiencia_residente', label: 'Experiencia mínima del residente de obra', tipo: 'number', obligatorio: true, min: 0, unidad: 'años', help: 'Años de experiencia del profesional residente' },
    { name: 'monto_retencion_estado', label: 'Retención por estado de pago', tipo: 'number', obligatorio: false, min: 0, max: 10, unidad: '%', help: 'Usualmente 5% o 10%' },
    { name: 'clasificacion_registro_contratistas', label: 'Registro de contratistas requerido', tipo: 'text', obligatorio: true, help: 'Categoría MINVU/MOP u Obras Civiles' },
  ],
  Suministros: [
    { name: 'lugar_despacho', label: 'Lugar de despacho', tipo: 'text', obligatorio: true, help: 'Dirección física exacta de entrega/bodegaje' },
    { name: 'dias_garantia_tecnica', label: 'Garantía técnica mínima', tipo: 'number', obligatorio: true, min: 0, unidad: 'días', help: 'Ej: 365' },
    { name: 'plazo_reposicion_defectuosos', label: 'Plazo de reposición de defectuosos', tipo: 'number', obligatorio: false, min: 0, unidad: 'días' },
    { name: 'marcas_equivalentes', label: 'Se aceptan marcas equivalentes', tipo: 'boolean', obligatorio: true, debeSer: true, help: 'Obligatorio por ley: las marcas son referenciales' },
  ],
  Servicios: [
    { name: 'dotacion_minima', label: 'Dotación mínima de personal', tipo: 'number', obligatorio: true, min: 1, help: 'Personal mínimo por turno' },
    { name: 'sla_tiempo_respuesta', label: 'SLA — tiempo de respuesta', tipo: 'number', obligatorio: true, min: 0, unidad: 'horas', help: 'Horas máximas para atender un requerimiento' },
    { name: 'req_certificado_dt', label: 'Exige certificado F30-1 (Dir. del Trabajo)', tipo: 'boolean', obligatorio: true, debeSer: true, help: 'Obligatorio en servicios (Ley 20.123)' },
  ],
  Consultoría: [
    { name: 'anos_exp_jefe_proyecto', label: 'Experiencia mínima del jefe de proyecto', tipo: 'number', obligatorio: true, min: 0, unidad: 'años' },
    { name: 'req_presentacion_gantt', label: 'Exige Carta Gantt / Plan de trabajo', tipo: 'boolean', obligatorio: true, debeSer: true },
    { name: 'entregables_fases', label: 'Entregables por fase', tipo: 'text', obligatorio: true, help: 'Hitos y documentos a entregar en cada etapa' },
  ],
}

/**
 * Valida los campos específicos del tipo. Devuelve lista de errores (vacía si OK).
 */
export function validarCamposTipo(
  tipo: TipoCompra,
  valores: Record<string, any>
): string[] {
  const errores: string[] = []
  for (const campo of CAMPOS_POR_TIPO[tipo] || []) {
    const v = valores[campo.name]
    if (campo.tipo === 'boolean') {
      if (campo.debeSer === true && v !== true) {
        errores.push(`"${campo.label}" es obligatorio por normativa`)
      }
      continue
    }
    const vacio = v === undefined || v === null || v === ''
    if (campo.obligatorio && vacio) {
      errores.push(`Falta "${campo.label}"`)
      continue
    }
    if (!vacio && campo.tipo === 'number') {
      const n = Number(v)
      if (Number.isNaN(n)) errores.push(`"${campo.label}" debe ser numérico`)
      else {
        if (campo.min !== undefined && n < campo.min) errores.push(`"${campo.label}" no puede ser menor a ${campo.min}`)
        if (campo.max !== undefined && n > campo.max) errores.push(`"${campo.label}" no puede ser mayor a ${campo.max}`)
      }
    }
  }
  return errores
}

/**
 * Valida la garantía de fiel cumplimiento según clasificación (5% – 30% cuando es obligatoria).
 */
export function validarGarantiaCumplimiento(
  clasif: Clasificacion | null,
  porcentaje: number | null | undefined
): string | null {
  if (!clasif?.garantiaCumplimientoObligatoria) return null
  if (porcentaje == null || porcentaje === ('' as any)) {
    return 'La garantía de fiel cumplimiento es obligatoria para este monto (5% – 30%)'
  }
  const p = Number(porcentaje)
  if (Number.isNaN(p) || p < 5 || p > 30) {
    return 'La garantía de fiel cumplimiento debe estar entre 5% y 30%'
  }
  return null
}

/**
 * Valida la garantía de seriedad de la oferta cuando el tramo LR la exige.
 */
export function validarGarantiaSeriedad(
  clasif: Clasificacion | null,
  porcentaje: number | null | undefined
): string | null {
  if (!clasif?.garantiaSeriedadObligatoria) return null
  if (porcentaje == null || porcentaje === ('' as any)) {
    return 'La garantía de seriedad de la oferta es obligatoria para procesos LR'
  }
  const p = Number(porcentaje)
  if (Number.isNaN(p) || p < 2 || p > 5) {
    return 'La garantía de seriedad debe estar entre 2% y 5%'
  }
  return null
}

export function validarPonderaciones(
  precio: number,
  tecnica: number,
  plazo: number
): string | null {
  const total = precio + tecnica + plazo
  if (Math.abs(total - 100) > 0.01) {
    return `Las ponderaciones deben sumar 100%. Suma actual: ${total.toFixed(2)}%`
  }
  return null
}

export function formatUTM(utm: number): string {
  return utm.toLocaleString('es-CL', { maximumFractionDigits: 1 }) + ' UTM'
}
