-- Reduce privilegios por defecto y fija el search_path del trigger de hitos.
ALTER FUNCTION public.marcar_hito_licitacion() SET search_path = public, pg_temp;

REVOKE ALL ON TABLE public.roles, public.usuarios_roles, public.alertas_parametros,
  public.alertas_registradas, public.notificaciones_usuario, public.bases_tipo_versiones
  FROM anon;

REVOKE INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.roles,
  public.usuarios_roles, public.alertas_parametros, public.alertas_registradas,
  public.notificaciones_usuario, public.bases_tipo_versiones FROM authenticated;

GRANT SELECT ON TABLE public.roles, public.usuarios_roles, public.alertas_parametros,
  public.alertas_registradas, public.notificaciones_usuario, public.bases_tipo_versiones TO authenticated;
GRANT UPDATE ON TABLE public.alertas_parametros, public.alertas_registradas,
  public.notificaciones_usuario, public.bases_tipo_versiones TO authenticated;
GRANT INSERT ON TABLE public.bases_tipo_versiones TO authenticated;

-- La Unidad de Compra puede solicitar versiones, pero solo jefatura/jurídico
-- o administración pueden aprobarlas y activarlas.
DROP POLICY IF EXISTS bases_tipo_versiones_update ON public.bases_tipo_versiones;
CREATE POLICY bases_tipo_versiones_update ON public.bases_tipo_versiones FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'JEFE_COMPRAS', 'JURIDICO') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'JEFE_COMPRAS', 'JURIDICO') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)));
