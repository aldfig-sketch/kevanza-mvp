CREATE TABLE IF NOT EXISTS public.publicaciones_mercado_publico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bases_id UUID NOT NULL REFERENCES public.bases_generadas(id) ON DELETE CASCADE,
  licitacion_id UUID NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  
  numero_decreto VARCHAR(100),
  fecha_decreto TIMESTAMP WITH TIME ZONE,
  contenido_decreto TEXT,
  
  estado_publicacion VARCHAR(50) DEFAULT 'PENDIENTE',
  id_mercado_publico VARCHAR(100),
  url_mercado_publico VARCHAR(500),
  
  fecha_publicacion TIMESTAMP WITH TIME ZONE,
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  ofertas_recibidas INT DEFAULT 0,
  
  publicado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publicaciones_bases ON public.publicaciones_mercado_publico(bases_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_estado ON public.publicaciones_mercado_publico(estado_publicacion);
CREATE INDEX IF NOT EXISTS idx_publicaciones_mp ON public.publicaciones_mercado_publico(id_mercado_publico);

ALTER TABLE public.publicaciones_mercado_publico ENABLE ROW LEVEL SECURITY;

CREATE POLICY pub_read ON public.publicaciones_mercado_publico FOR SELECT TO authenticated USING (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
  WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = publicaciones_mercado_publico.licitacion_id
));
CREATE POLICY pub_insert ON public.publicaciones_mercado_publico FOR INSERT TO authenticated WITH CHECK (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
  WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = publicaciones_mercado_publico.licitacion_id
));
CREATE POLICY pub_update ON public.publicaciones_mercado_publico FOR UPDATE TO authenticated USING (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
  WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = publicaciones_mercado_publico.licitacion_id
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.usuarios u
  JOIN public.licitaciones l ON l.municipio_id = u.municipio_id
  WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true) AND l.id = publicaciones_mercado_publico.licitacion_id
));
