-- Ficha real SECPLAC y repositorio de bases tipo.
-- Se conserva "licitaciones" como nombre físico por compatibilidad con el MVP.

ALTER TABLE public.licitaciones
  ADD COLUMN IF NOT EXISTS objeto text,
  ADD COLUMN IF NOT EXISTS fecha_inicio date,
  ADD COLUMN IF NOT EXISTS cuenta_presupuestaria varchar(100),
  ADD COLUMN IF NOT EXISTS modalidad varchar(50),
  ADD COLUMN IF NOT EXISTS direccion_solicitante text,
  ADD COLUMN IF NOT EXISTS unidad_tecnica text,
  ADD COLUMN IF NOT EXISTS funcionario_responsable text,
  ADD COLUMN IF NOT EXISTS criterios_evaluacion jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS antecedentes_oferta jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS multas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS visita_terreno jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS estados_pago text,
  ADD COLUMN IF NOT EXISTS obligaciones_contratista text,
  ADD COLUMN IF NOT EXISTS causales_termino text,
  ADD COLUMN IF NOT EXISTS bases_tipo_id uuid,
  ADD COLUMN IF NOT EXISTS bases_ajustadas jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS fecha_aprobacion_compra timestamptz,
  ADD COLUMN IF NOT EXISTS observaciones_compra text;

ALTER TABLE public.bases_generadas
  ADD COLUMN IF NOT EXISTS bases_tipo_id uuid,
  ADD COLUMN IF NOT EXISTS seleccionado_por uuid,
  ADD COLUMN IF NOT EXISTS fecha_seleccion timestamptz,
  ADD COLUMN IF NOT EXISTS actualizado_por uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.bases_tipos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_compra varchar(100) NOT NULL,
  nombre varchar(255) NOT NULL,
  descripcion text,
  estructura_base jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1,
  creado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  actualizado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  fecha_creacion timestamptz NOT NULL DEFAULT now(),
  fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
  institucion_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  changelog jsonb NOT NULL DEFAULT '[]'::jsonb,
  activo boolean NOT NULL DEFAULT true
);

ALTER TABLE public.bases_tipos
  ADD COLUMN IF NOT EXISTS nombre varchar(255),
  ADD COLUMN IF NOT EXISTS descripcion text,
  ADD COLUMN IF NOT EXISTS estructura_base jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS creado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS actualizado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fecha_creacion timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS institucion_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS changelog jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

UPDATE public.bases_tipos
SET nombre = coalesce(nullif(nombre, ''), 'Base tipo ' || coalesce(tipo_compra, 'general')),
    estructura_base = CASE
      WHEN estructura_base = '{}'::jsonb AND seccion_antecedentes IS NOT NULL THEN jsonb_build_object(
        'antecedentes', seccion_antecedentes,
        'objeto', seccion_objeto,
        'especificaciones', seccion_especificaciones,
        'presupuesto', seccion_presupuesto,
        'plazos', seccion_plazos,
        'garantias', seccion_garantias,
        'condiciones_pago', seccion_condiciones_pago,
        'penalidades', seccion_penalidades,
        'resolucion_controversias', seccion_resolucion_controversias,
        'campos_especificos', coalesce(campos_especificos, '{}'::jsonb),
        'clausulas_obligatorias', coalesce(clausulas_obligatorias, '{}'::jsonb)
      )
      ELSE estructura_base
    END
WHERE nombre IS NULL OR estructura_base = '{}'::jsonb;

ALTER TABLE public.licitaciones
  DROP CONSTRAINT IF EXISTS licitaciones_bases_tipo_id_fkey;
ALTER TABLE public.licitaciones
  ADD CONSTRAINT licitaciones_bases_tipo_id_fkey
  FOREIGN KEY (bases_tipo_id) REFERENCES public.bases_tipos(id) ON DELETE SET NULL;

ALTER TABLE public.bases_generadas
  DROP CONSTRAINT IF EXISTS bases_generadas_bases_tipo_id_fkey;
ALTER TABLE public.bases_generadas
  ADD CONSTRAINT bases_generadas_bases_tipo_id_fkey
  FOREIGN KEY (bases_tipo_id) REFERENCES public.bases_tipos(id) ON DELETE SET NULL;

ALTER TABLE public.documentos DROP CONSTRAINT IF EXISTS chk_documentos_categoria;
ALTER TABLE public.documentos
  ADD CONSTRAINT chk_documentos_categoria CHECK (
    categoria IN (
      'BASE', 'ANEXO', 'DECRETO',
      'CERTIFICADO_DISPONIBILIDAD', 'OFICIO_CONDUCTOR', 'TECNICO'
    )
  );

CREATE INDEX IF NOT EXISTS idx_bases_tipos_tipo_institucion
  ON public.bases_tipos(tipo_compra, institucion_id, activo);
CREATE INDEX IF NOT EXISTS idx_licitaciones_bases_tipo
  ON public.licitaciones(bases_tipo_id);

ALTER TABLE public.bases_tipos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bases_tipos_select ON public.bases_tipos;
DROP POLICY IF EXISTS "bases_tipos_select" ON public.bases_tipos;
CREATE POLICY bases_tipos_select ON public.bases_tipos
  FOR SELECT TO authenticated
  USING (activo = true AND (institucion_id IS NULL OR institucion_id = (
    SELECT u.municipio_id FROM public.usuarios u
    WHERE u.id = (SELECT auth.uid()) AND coalesce(u.activo, true)
  )));

-- Plantillas oficiales mínimas. Son estructuras editables, no contenido generado por IA.
INSERT INTO public.bases_tipos (tipo_compra, nombre, descripcion, estructura_base)
SELECT v.tipo_compra, v.nombre, v.descripcion, v.estructura_base::jsonb
FROM (VALUES
  ('Infraestructura', 'Obras civiles y reparación', 'Base administrativa y técnica para obras civiles.', '{"secciones":["antecedentes","objeto","especificaciones","presupuesto","plazos","garantias","criterios_evaluacion","multas","condiciones_pago","obligaciones_contratista","causales_termino"]}'::text),
  ('Servicios', 'Servicios generales y técnicos', 'Base para contratación de servicios generales o técnicos.', '{"secciones":["antecedentes","objeto","especificaciones","presupuesto","plazos","garantias","criterios_evaluacion","multas","condiciones_pago","obligaciones_contratista","causales_termino"]}'::text),
  ('Suministros', 'Adquisición de bienes y equipamiento', 'Base para suministro de bienes fungibles o equipamiento.', '{"secciones":["antecedentes","objeto","especificaciones","presupuesto","plazos","garantias","criterios_evaluacion","multas","condiciones_pago","obligaciones_contratista","causales_termino"]}'::text),
  ('Consultoría', 'Estudios y asesorías', 'Base para consultorías y asesorías profesionales.', '{"secciones":["antecedentes","objeto","especificaciones","presupuesto","plazos","garantias","criterios_evaluacion","multas","condiciones_pago","obligaciones_contratista","causales_termino"]}'::text)
) AS v(tipo_compra, nombre, descripcion, estructura_base)
WHERE NOT EXISTS (
  SELECT 1 FROM public.bases_tipos b
  WHERE b.tipo_compra = v.tipo_compra AND b.institucion_id IS NULL AND b.activo = true
);
