/**
 * Zod Schemas for Server-Side Validation
 * Single source of truth for all data validation
 */

import { z } from 'zod'

/**
 * REQUERIMIENTO DE COMPRA VALIDATION
 */
export const LicitacionSchema = z
  .object({
    numero: z
      .string()
      .min(1, 'Número de requerimiento requerido')
      .max(50, 'Número máximo 50 caracteres'),
    titulo: z
      .string()
      .min(5, 'Título mínimo 5 caracteres')
      .max(500, 'Título máximo 500 caracteres'),
    descripcion: z
      .string()
      .max(5000, 'Descripción máximo 5000 caracteres')
      .optional()
      .nullable(),
    tipo_licita: z.enum(['Infraestructura', 'Suministros', 'Servicios', 'Consultoría']),
    presupuesto_total: z
      .number()
      .positive('Presupuesto debe ser positivo')
      .max(999999999999, 'Presupuesto muy alto'),
    porcentaje_seriedad: z.number().min(0).max(5).optional().nullable(),
    porcentaje_cumplimiento: z.number().min(0).max(30).optional().nullable(),
    plazo_ejecucion_dias: z.number().int().positive().optional().nullable(),
    datos_bases: z.record(z.string(), z.any()).default({}),
    ponderacion_precio: z
      .number()
      .min(0, 'Ponderación mínimo 0')
      .max(100, 'Ponderación máximo 100'),
    ponderacion_tecnica: z
      .number()
      .min(0, 'Ponderación mínimo 0')
      .max(100, 'Ponderación máximo 100'),
    ponderacion_plazo: z
      .number()
      .min(0, 'Ponderación mínimo 0')
      .max(100, 'Ponderación máximo 100'),
  })
  .refine(
    (data) =>
      Math.abs(
        data.ponderacion_precio +
          data.ponderacion_tecnica +
          data.ponderacion_plazo -
          100
      ) < 0.01,
    {
      message: 'Ponderaciones deben sumar exactamente 100%',
    }
  )

export type LicitacionInput = z.infer<typeof LicitacionSchema>

/**
 * LOGIN VALIDATION
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Email no es válido')
    .max(255, 'Email máximo 255 caracteres'),
  password: z
    .string()
    .min(6, 'Contraseña mínimo 6 caracteres')
    .max(255, 'Contraseña máximo 255 caracteres'),
})

export type LoginInput = z.infer<typeof LoginSchema>

/**
 * SIGNUP VALIDATION
 */
export const SignupSchema = z
  .object({
    email: z
      .string()
      .email('Email no es válido')
      .max(255, 'Email máximo 255 caracteres'),
    nombre: z
      .string()
      .min(3, 'Nombre mínimo 3 caracteres')
      .max(255, 'Nombre máximo 255 caracteres'),
    password: z
      .string()
      .min(8, 'Contraseña mínimo 8 caracteres')
      .max(255, 'Contraseña máximo 255 caracteres')
      .regex(/[A-Z]/, 'Debe incluir mayúscula')
      .regex(/[0-9]/, 'Debe incluir número')
      .regex(/[!@#$%^&*]/, 'Debe incluir carácter especial'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

export type SignupInput = z.infer<typeof SignupSchema>

/**
 * UTILITY: Validate and throw error
 */
export async function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
      throw new Error(`Validación falló: ${messages.join(', ')}`)
    }
    throw error
  }
}
