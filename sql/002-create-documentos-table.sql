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
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documentos_licitacion ON public.documentos(licitacion_id);
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON public.documentos(categoria);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_select_auth" ON public.documentos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "documentos_insert_auth" ON public.documentos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "documentos_delete_auth" ON public.documentos
  FOR DELETE TO authenticated USING (true);

-- Bucket de almacenamiento PRIVADO (probidad: las bases no son públicas antes de publicar)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "docs_read_auth" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documentos');
CREATE POLICY "docs_insert_auth" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos');
CREATE POLICY "docs_delete_auth" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documentos');
