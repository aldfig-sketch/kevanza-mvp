/**
 * Audit Logging System
 * Track all important actions for compliance and debugging
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'DOWNLOAD'

export interface AuditLogEntry {
  usuario_id: string
  accion: AuditAction
  tabla: string
  registro_id?: string
  cambios?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

/**
 * Log audit entry to database
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert([
      {
        usuario_id: entry.usuario_id,
        accion: entry.accion,
        tabla: entry.tabla,
        registro_id: entry.registro_id,
        cambios: entry.cambios || {},
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('[Audit] Error logging:', error)
      // No fallar la operación si audit falla
    }
  } catch (error) {
    console.error('[Audit] Error in logAudit:', error)
  }
}

/**
 * Get audit logs for a record
 */
export async function getAuditLogs(tabla: string, registro_id: string) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('tabla', tabla)
      .eq('registro_id', registro_id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Audit] Error getting logs:', error)
    return []
  }
}

/**
 * Get user activity
 */
export async function getUserActivity(usuario_id: string, days: number = 30) {
  try {
    const desde = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('usuario_id', usuario_id)
      .gte('created_at', desde.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Audit] Error getting user activity:', error)
    return []
  }
}

/**
 * Get activity by action type
 */
export async function getActivityByAction(accion: AuditAction, days: number = 30) {
  try {
    const desde = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('accion', accion)
      .gte('created_at', desde.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[Audit] Error getting activity by action:', error)
    return []
  }
}

/**
 * SQL para crear tabla de auditoría (ejecutar en Supabase)
 *
 * CREATE TABLE IF NOT EXISTS audit_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
 *   accion VARCHAR(50),
 *   tabla VARCHAR(100),
 *   registro_id UUID,
 *   cambios JSONB DEFAULT '{}',
 *   ip_address VARCHAR(45),
 *   user_agent TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_audit_logs_usuario ON audit_logs(usuario_id);
 * CREATE INDEX idx_audit_logs_tabla ON audit_logs(tabla);
 * CREATE INDEX idx_audit_logs_accion ON audit_logs(accion);
 * CREATE INDEX idx_audit_logs_fecha ON audit_logs(created_at DESC);
 * CREATE INDEX idx_audit_logs_registro ON audit_logs(tabla, registro_id);
 */

/**
 * Log helpers for common operations
 */
export const auditLog = {
  createdRecord: (userId: string, tabla: string, registroId: string, data: any) =>
    logAudit({
      usuario_id: userId,
      accion: 'CREATE',
      tabla,
      registro_id: registroId,
      cambios: data,
    }),

  updatedRecord: (userId: string, tabla: string, registroId: string, cambios: any) =>
    logAudit({
      usuario_id: userId,
      accion: 'UPDATE',
      tabla,
      registro_id: registroId,
      cambios,
    }),

  deletedRecord: (userId: string, tabla: string, registroId: string) =>
    logAudit({
      usuario_id: userId,
      accion: 'DELETE',
      tabla,
      registro_id: registroId,
    }),

  viewedRecord: (userId: string, tabla: string, registroId: string) =>
    logAudit({
      usuario_id: userId,
      accion: 'VIEW',
      tabla,
      registro_id: registroId,
    }),

  exportedData: (userId: string, tabla: string, filtros: any) =>
    logAudit({
      usuario_id: userId,
      accion: 'EXPORT',
      tabla,
      cambios: filtros,
    }),

  downloadedFile: (userId: string, tabla: string, registroId: string, tipo: string) =>
    logAudit({
      usuario_id: userId,
      accion: 'DOWNLOAD',
      tabla,
      registro_id: registroId,
      cambios: { tipo },
    }),
}
