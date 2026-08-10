-- Security hardening: Re-enable RLS and restrict access

-- 1. Re-habilitar RLS en bases_generadas
ALTER TABLE public.bases_generadas ENABLE ROW LEVEL SECURITY;

-- 2. Políticas RLS para bases_generadas - solo usuarios autenticados
DROP POLICY IF EXISTS "bases_generadas_select" ON public.bases_generadas;
DROP POLICY IF EXISTS "bases_generadas_insert" ON public.bases_generadas;
DROP POLICY IF EXISTS "bases_generadas_update" ON public.bases_generadas;

CREATE POLICY "bases_generadas_select"
  ON public.bases_generadas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "bases_generadas_insert"
  ON public.bases_generadas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "bases_generadas_update"
  ON public.bases_generadas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Re-habilitar RLS en bases_tipos
ALTER TABLE public.bases_tipos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para bases_tipos (lectura para autenticados)
DROP POLICY IF EXISTS "bases_tipos_select" ON public.bases_tipos;

CREATE POLICY "bases_tipos_select"
  ON public.bases_tipos FOR SELECT
  USING (auth.role() = 'authenticated');

-- 5. Seguridad: Restringir función generar_bases_rpc a usuarios autenticados
REVOKE EXECUTE ON FUNCTION public.generar_bases_rpc FROM anon;
GRANT EXECUTE ON FUNCTION public.generar_bases_rpc TO authenticated;

-- 6. Comentario de auditoría
COMMENT ON TABLE public.bases_generadas IS 'Propuestas de bases generadas con IA. RLS habilitado para usuarios autenticados.';
COMMENT ON TABLE public.bases_tipos IS 'Plantillas de bases por tipo de compra. RLS habilitado, lectura solo autenticados.';
