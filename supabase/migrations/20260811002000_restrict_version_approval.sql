-- La Unidad de Compra solicita versiones; no aprueba ni activa versiones.
DROP POLICY IF EXISTS bases_tipo_versiones_update ON public.bases_tipo_versiones;
CREATE POLICY bases_tipo_versiones_update ON public.bases_tipo_versiones FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'JEFE_COMPRAS', 'JURIDICO') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'JEFE_COMPRAS', 'JURIDICO') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)));
