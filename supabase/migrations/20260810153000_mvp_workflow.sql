-- KEVANZA MVP: revisión de compras y firma básica.
-- El nombre licitaciones se mantiene como requerimiento interno.

ALTER TABLE public.licitaciones
  DROP CONSTRAINT IF EXISTS chk_licitaciones_estado_pre_publicacion;

ALTER TABLE public.licitaciones
  ADD CONSTRAINT chk_licitaciones_estado_pre_publicacion
  CHECK (estado IN (
    'BORRADOR',
    'ENVIADA_COMPRA',
    'RECHAZADA_COMPRA',
    'APROBADA_COMPRA',
    'BASES_GENERADAS',
    'ENVIADA_JURIDICO',
    'EN_REVISION',
    'OBSERVADO',
    'RECHAZADA_JURIDICO',
    'APROBADO_JURIDICO',
    'DECRETO_GENERADO',
    'PENDIENTE_FIRMA',
    'LISTO_PUBLICACION',
    'PUBLICADA_MP',
    'LISTO_MERCADO_PUBLICO',
    'ARCHIVADO'
  ));

CREATE TABLE IF NOT EXISTS public.publicaciones_mercado_publico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bases_id uuid NOT NULL REFERENCES public.bases_generadas(id) ON DELETE CASCADE,
  licitacion_id uuid NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  numero_decreto varchar(100),
  fecha_decreto timestamptz,
  contenido_decreto text,
  estado_publicacion varchar(50) NOT NULL DEFAULT 'PENDIENTE',
  id_mercado_publico varchar(100),
  url_mercado_publico varchar(500),
  fecha_publicacion timestamptz,
  fecha_cierre timestamptz,
  ofertas_recibidas integer NOT NULL DEFAULT 0,
  publicado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publicaciones_bases ON public.publicaciones_mercado_publico(bases_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_licitacion ON public.publicaciones_mercado_publico(licitacion_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_estado ON public.publicaciones_mercado_publico(estado_publicacion);

ALTER TABLE public.publicaciones_mercado_publico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pub_read ON public.publicaciones_mercado_publico;
DROP POLICY IF EXISTS pub_insert ON public.publicaciones_mercado_publico;
DROP POLICY IF EXISTS pub_update ON public.publicaciones_mercado_publico;

CREATE POLICY pub_read ON public.publicaciones_mercado_publico
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
      AND l.id = publicaciones_mercado_publico.licitacion_id
  ));

CREATE POLICY pub_insert ON public.publicaciones_mercado_publico
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
      AND l.id = publicaciones_mercado_publico.licitacion_id
  ));

CREATE POLICY pub_update ON public.publicaciones_mercado_publico
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
      AND l.id = publicaciones_mercado_publico.licitacion_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
      AND l.id = publicaciones_mercado_publico.licitacion_id
  ));

CREATE TABLE IF NOT EXISTS public.revisiones_licitacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacion_id uuid NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  estado varchar(50) NOT NULL DEFAULT 'PENDIENTE',
  revisado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  observaciones text,
  fecha_revision timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revisiones_licitacion_estado_check CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA'))
);

CREATE INDEX IF NOT EXISTS idx_revisiones_licitacion_licitacion ON public.revisiones_licitacion(licitacion_id);
CREATE INDEX IF NOT EXISTS idx_revisiones_licitacion_estado ON public.revisiones_licitacion(estado);

CREATE TABLE IF NOT EXISTS public.revisiones_bases_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bases_id uuid NOT NULL REFERENCES public.bases_generadas(id) ON DELETE CASCADE,
  licitacion_id uuid NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  estado varchar(50) NOT NULL DEFAULT 'PENDIENTE',
  revisado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  observaciones text,
  fecha_revision timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revisiones_bases_compra_estado_check CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA'))
);

CREATE INDEX IF NOT EXISTS idx_revisiones_bases_compra_bases ON public.revisiones_bases_compra(bases_id);
CREATE INDEX IF NOT EXISTS idx_revisiones_bases_compra_estado ON public.revisiones_bases_compra(estado);

CREATE TABLE IF NOT EXISTS public.solicitudes_firma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id uuid NOT NULL REFERENCES public.publicaciones_mercado_publico(id) ON DELETE CASCADE,
  token_hash varchar(64) NOT NULL UNIQUE,
  token_expira timestamptz NOT NULL,
  autoridad_email varchar(255) NOT NULL,
  autoridad_nombre varchar(255) NOT NULL,
  estado varchar(50) NOT NULL DEFAULT 'PENDIENTE',
  firmado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  fecha_firma timestamptz,
  ip_firma inet,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT solicitudes_firma_estado_check CHECK (estado IN ('PENDIENTE', 'FIRMADA', 'EXPIRADA'))
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_firma_token ON public.solicitudes_firma(token_hash);
CREATE INDEX IF NOT EXISTS idx_solicitudes_firma_estado ON public.solicitudes_firma(estado);

ALTER TABLE public.revisiones_licitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisiones_bases_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_firma ENABLE ROW LEVEL SECURITY;

-- Las bases deben seguir el mismo aislamiento que el requerimiento padre.
DROP POLICY IF EXISTS bases_generadas_select ON public.bases_generadas;
DROP POLICY IF EXISTS bases_generadas_insert ON public.bases_generadas;
DROP POLICY IF EXISTS bases_generadas_update ON public.bases_generadas;
CREATE POLICY bases_generadas_select ON public.bases_generadas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licitaciones l
    JOIN public.usuarios u ON u.municipio_id = l.municipio_id
    WHERE l.id = bases_generadas.licitacion_id
      AND u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
  ));
CREATE POLICY bases_generadas_insert ON public.bases_generadas FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.licitaciones l
    JOIN public.usuarios u ON u.municipio_id = l.municipio_id
    WHERE l.id = bases_generadas.licitacion_id
      AND u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
  ));
CREATE POLICY bases_generadas_update ON public.bases_generadas FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licitaciones l
    JOIN public.usuarios u ON u.municipio_id = l.municipio_id
    WHERE l.id = bases_generadas.licitacion_id
      AND u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.licitaciones l
    JOIN public.usuarios u ON u.municipio_id = l.municipio_id
    WHERE l.id = bases_generadas.licitacion_id
      AND u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
  ));

DROP POLICY IF EXISTS rev_lic_select ON public.revisiones_licitacion;
DROP POLICY IF EXISTS rev_lic_insert ON public.revisiones_licitacion;
DROP POLICY IF EXISTS rev_lic_update ON public.revisiones_licitacion;
CREATE POLICY rev_lic_select ON public.revisiones_licitacion FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_licitacion.licitacion_id
  ));
CREATE POLICY rev_lic_insert ON public.revisiones_licitacion FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_licitacion.licitacion_id
  ));
CREATE POLICY rev_lic_update ON public.revisiones_licitacion FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_licitacion.licitacion_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_licitacion.licitacion_id
  ));

DROP POLICY IF EXISTS rev_bases_select ON public.revisiones_bases_compra;
DROP POLICY IF EXISTS rev_bases_insert ON public.revisiones_bases_compra;
DROP POLICY IF EXISTS rev_bases_update ON public.revisiones_bases_compra;
CREATE POLICY rev_bases_select ON public.revisiones_bases_compra FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_bases_compra.licitacion_id
  ));
CREATE POLICY rev_bases_insert ON public.revisiones_bases_compra FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_bases_compra.licitacion_id
  ));
CREATE POLICY rev_bases_update ON public.revisiones_bases_compra FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_bases_compra.licitacion_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = revisiones_bases_compra.licitacion_id
  ));

-- Las solicitudes de firma se modifican únicamente desde endpoints server-side.
-- No se expone el token ni la tabla al cliente anónimo.
DROP POLICY IF EXISTS solicitudes_firma_select ON public.solicitudes_firma;
DROP POLICY IF EXISTS solicitudes_firma_insert ON public.solicitudes_firma;
DROP POLICY IF EXISTS solicitudes_firma_update ON public.solicitudes_firma;
CREATE POLICY solicitudes_firma_select ON public.solicitudes_firma FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.publicaciones_mercado_publico p
    JOIN public.licitaciones l ON l.id = p.licitacion_id
    JOIN public.usuarios u ON u.municipio_id = l.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND p.id = solicitudes_firma.publicacion_id
  ));
CREATE POLICY solicitudes_firma_insert ON public.solicitudes_firma FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.publicaciones_mercado_publico p
    JOIN public.licitaciones l ON l.id = p.licitacion_id
    JOIN public.usuarios u ON u.municipio_id = l.municipio_id
    WHERE u.id = (SELECT auth.uid()) AND p.id = solicitudes_firma.publicacion_id
  ));

-- La generación se realiza desde /api/bases/generar con validación de sesión.
-- El RPC histórico no debe seguir expuesto al Data API.
REVOKE EXECUTE ON FUNCTION public.generar_bases_rpc(uuid, text, jsonb, text) FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.generar_bases_rpc(uuid, text, jsonb, text)
  SET search_path = public, pg_temp;
