/**
 * Centralized Error Handling
 * Consistent error responses across all API endpoints
 */

export class KevanzaError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public userMessage: string = 'Error en la operación'
  ) {
    super(message)
    this.name = 'KevanzaError'
  }
}

export const errors = {
  LICITACION_NOT_FOUND: () =>
    new KevanzaError(
      'LICITACION_NOT_FOUND',
      'Licitación no encontrada en BD',
      404,
      'La licitación que buscas no existe'
    ),

  OFERTA_NOT_FOUND: () =>
    new KevanzaError(
      'OFERTA_NOT_FOUND',
      'Oferta no encontrada en BD',
      404,
      'La oferta que buscas no existe'
    ),

  OFERTA_SAVE_FAILED: (err: any) =>
    new KevanzaError(
      'OFERTA_SAVE_FAILED',
      `Error guardando oferta: ${err.message}`,
      500,
      'Error al guardar la oferta. Intenta de nuevo.'
    ),

  PUNTAJE_UPDATE_FAILED: (err: any) =>
    new KevanzaError(
      'PUNTAJE_UPDATE_FAILED',
      `Error actualizando puntajes: ${err.message}`,
      500,
      'Error al guardar evaluación. Intenta de nuevo.'
    ),

  INVALID_PUNTAJES: () =>
    new KevanzaError(
      'INVALID_PUNTAJES',
      'Puntajes no suman 100%',
      400,
      'La suma de ponderaciones debe ser exactamente 100%'
    ),

  INVALID_STATE_TRANSITION: (from: string, to: string) =>
    new KevanzaError(
      'INVALID_STATE_TRANSITION',
      `No se puede pasar de ${from} a ${to}`,
      400,
      `Transición de estado inválida: ${from} → ${to}`
    ),

  UNAUTHORIZED: () =>
    new KevanzaError(
      'UNAUTHORIZED',
      'Usuario no autorizado para esta acción',
      401,
      'No tienes permiso para hacer esto'
    ),

  INVALID_EMAIL: () =>
    new KevanzaError(
      'INVALID_EMAIL',
      'Email inválido',
      400,
      'El email no es válido'
    ),

  INVALID_INPUT: (field: string, reason: string) =>
    new KevanzaError(
      'INVALID_INPUT',
      `Campo ${field} inválido: ${reason}`,
      400,
      `El campo "${field}" no es válido: ${reason}`
    ),

  AUTH_FAILED: () =>
    new KevanzaError(
      'AUTH_FAILED',
      'Autenticación fallida',
      401,
      'Email o contraseña incorrectos'
    ),

  SESSION_EXPIRED: () =>
    new KevanzaError(
      'SESSION_EXPIRED',
      'Sesión expirada',
      401,
      'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
    ),

  DATABASE_ERROR: (err: any) =>
    new KevanzaError(
      'DATABASE_ERROR',
      `Error de base de datos: ${err.message}`,
      500,
      'Error de base de datos. Intenta de nuevo más tarde.'
    ),

  VALIDATION_ERROR: (errors: any[]) =>
    new KevanzaError(
      'VALIDATION_ERROR',
      `Errores de validación: ${JSON.stringify(errors)}`,
      400,
      `Errores de validación: ${errors.map((e: any) => e.message).join(', ')}`
    ),

  FILE_TOO_LARGE: () =>
    new KevanzaError(
      'FILE_TOO_LARGE',
      'Archivo demasiado grande',
      413,
      'El archivo excede el tamaño máximo permitido'
    ),

  RATE_LIMITED: () =>
    new KevanzaError(
      'RATE_LIMITED',
      'Demasiadas solicitudes',
      429,
      'Estás haciendo demasiadas solicitudes. Intenta más tarde.'
    ),

  SERVER_ERROR: (err: any) =>
    new KevanzaError(
      'SERVER_ERROR',
      `Error del servidor: ${err.message}`,
      500,
      'Algo salió mal en el servidor. Intenta de nuevo en unos momentos.'
    ),
}

/**
 * Handle any error and return consistent response
 */
export function handleError(error: any) {
  console.error('[Error Handler]', error)

  if (error instanceof KevanzaError) {
    return {
      code: error.code,
      message: error.userMessage,
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }

  if (error.message?.includes('JWT')) {
    return {
      code: 'AUTH_ERROR',
      message: 'Error de autenticación',
      statusCode: 401,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Error desconocido en la plataforma',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  }
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data }
}

export function errorResponse(code: string, message: string): ApiResponse {
  return { success: false, error: { code, message } }
}
