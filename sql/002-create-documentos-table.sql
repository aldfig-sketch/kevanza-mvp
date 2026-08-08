-- Gestión documental de procesos de adquisición (bases, anexos, decretos)
-- Aplicada en producción vía Supabase MCP el 2026-08-08.

CREATE TABLE IF NOT EXISTS public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacion_id uuid NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  categoria varchar(20) NOT NULL DEFAULT 'BASE',   -- BASE | ANEXO | DECRETO
  nombre varchar(255) NOT NULL,
  storage_path text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  tamano_bytes bigint,
  mime_type varchar(120),
  uploaded_by uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT chk_documentos_categoria CHECK (categoria IN ('BASE', 'ANEXO', 'DECRETO')),
  CONSTRAINT uq_documentos_version UNIQUE (licitacion_id, categoria, nombre, version)
);

CREATE INDEX IF NOT EXISTS idx_documentos_licitacion ON public.documentos(licitacion_id);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON public.documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_uploaded_by ON public.documentos(uploaded_by);
CREATE UNIQUE INDEX IF NOT EXISTS uq_documentos_version_idx
  ON public.documentos(licitacion_id, categoria, nombre, version);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documentos_select_auth" ON public.documentos;
DROP POLICY IF EXISTS "documentos_insert_auth" ON public.documentos;
DROP POLICY IF EXISTS "documentos_delete_auth" ON public.documentos;
DROP POLICY IF EXISTS "documentos_select_mismo_organismo" ON public.documentos;
DROP POLICY IF EXISTS "documentos_insert_mismo_organismo" ON public.documentos;
DROP POLICY IF EXISTS "documentos_delete_mismo_organismo_editable" ON public.documentos;

CREATE POLICY "documentos_select_mismo_organismo" ON public.documentos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.licitaciones l
      JOIN public.usuarios u ON u.municipio_id = l.municipio_id
      WHERE l.id = documentos.licitacion_id
        AND u.id = (SELECT auth.uid())
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "documentos_insert_mismo_organismo" ON public.documentos
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.licitaciones l
      JOIN public.usuarios u ON u.municipio_id = l.municipio_id
      WHERE l.id = documentos.licitacion_id
        AND u.id = (SELECT auth.uid())
        AND coalesce(u.activo, true) = true
        AND l.estado IN ('BORRADOR', 'OBSERVADO', 'EN_REVISION', 'APROBADO_JURIDICO', 'DECRETO_GENERADO')
    )
  );

CREATE POLICY "documentos_delete_mismo_organismo_editable" ON public.documentos
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.licitaciones l
      JOIN public.usuarios u ON u.municipio_id = l.municipio_id
      WHERE l.id = documentos.licitacion_id
        AND u.id = (SELECT auth.uid())
        AND coalesce(u.activo, true) = true
        AND l.estado IN ('BORRADOR', 'OBSERVADO', 'EN_REVISION', 'APROBADO_JURIDICO', 'DECRETO_GENERADO')
    )
  );

-- Bucket de almacenamiento PRIVADO (probidad: las bases no son públicas antes de publicar)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "docs_read_auth" ON storage.objects;
DROP POLICY IF EXISTS "docs_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "docs_delete_auth" ON storage.objects;
DROP POLICY IF EXISTS "docs_read_mismo_organismo" ON storage.objects;
DROP POLICY IF EXISTS "docs_insert_mismo_organismo" ON storage.objects;
DROP POLICY IF EXISTS "docs_delete_mismo_organismo_editable" ON storage.objects;

CREATE POLICY "docs_read_mismo_organismo" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos'
    AND EXISTS (
      SELECT 1
      FROM public.licitaciones l
      JOIN public.usuarios u ON u.municipio_id = l.municipio_id
      WHERE u.id = (SELECT auth.uid())
        AND coalesce(u.activo, true) = true
        AND name LIKE l.municipio_id::text || '/' || l.id::text || '/%'
    )
  );

CREATE POLICY "docs_insert_mismo_organismo" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos'
    AND EXISTS (
      SELECT 1
      FROM public.licitaciones l
      JOIN public.usuarios u ON u.municipio_id = l.municipio_id
      WHERE u.id = (SELECT auth.uid())
        AND coalesce(u.activo, true) = true
        AND l.estado IN ('BORRADOR', 'OBSERVADO', 'EN_REVISION', 'APROBADO_JURIDICO', 'DECRETO_GENERADO')
        AND name LIKE l.municipio_id::text || '/' || l.id::text || '/%'
    )
  );

CREATE POLICY "docs_delete_mismo_organismo_editable" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos'
    AND EXISTS (
      SELECT 1
      FROM public.licitaciones l
      JOIN public.usuarios u ON u.municipio_id = l.municipio_id
      WHERE u.id = (SELECT auth.uid())
        AND coalesce(u.activo, true) = true
        AND l.estado IN ('BORRADOR', 'OBSERVADO', 'EN_REVISION', 'APROBADO_JURIDICO', 'DECRETO_GENERADO')
        AND name LIKE l.municipio_id::text || '/' || l.id::text || '/%'
    )
  );
