-- Campos para el formulario guiado de bases (Ley 19.886 / DS 661/2024)
-- Aplicada en producción vía Supabase MCP el 2026-08-08.

ALTER TABLE public.licitaciones
  ADD COLUMN IF NOT EXISTS clasificacion varchar(4),          -- L1 | LE | LP | LQ | LR (por UTM)
  ADD COLUMN IF NOT EXISTS porcentaje_cumplimiento numeric(5,2), -- garantía fiel cumplimiento
  ADD COLUMN IF NOT EXISTS plazo_ejecucion_dias integer,
  ADD COLUMN IF NOT EXISTS incluye_impuestos boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS datos_bases jsonb DEFAULT '{}'::jsonb; -- campos específicos por tipo
