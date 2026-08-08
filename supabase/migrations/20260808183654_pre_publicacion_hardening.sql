-- KEVANZA: hardening para gestion interna previa a Mercado Publico.
-- Nota: la columna municipio_id se mantiene por compatibilidad, pero representa
-- el organismo/unidad compradora propietaria del requerimiento.

-- 1. Retirar superficie de ofertas del producto.
DO $$
BEGIN
  IF to_regclass('public.ofertas') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can view ofertas" ON public.ofertas;
    DROP POLICY IF EXISTS "Anyone can insert ofertas" ON public.ofertas;
    DROP POLICY IF EXISTS "Anyone can update ofertas" ON public.ofertas;
    DROP POLICY IF EXISTS "Authenticated users can delete ofertas" ON public.ofertas;
    REVOKE ALL ON TABLE public.ofertas FROM anon;
    REVOKE ALL ON TABLE public.ofertas FROM authenticated;
  END IF;
END $$;
DROP TABLE IF EXISTS public.ofertas CASCADE;

-- 2. Compatibilidad minima de usuarios para policies.
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS rol text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'usuarios'
      AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE public.usuarios SET activo = is_active WHERE activo IS NULL';
  END IF;
END $$;

-- 3. Campos normativos y estado interno.
ALTER TABLE public.licitaciones
  ADD COLUMN IF NOT EXISTS porcentaje_seriedad numeric(5,2),
  ADD COLUMN IF NOT EXISTS porcentaje_cumplimiento numeric(5,2),
  ADD COLUMN IF NOT EXISTS plazo_ejecucion_dias integer,
  ADD COLUMN IF NOT EXISTS incluye_impuestos boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS datos_bases jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS clasificacion varchar(4);

UPDATE public.licitaciones
SET estado = CASE estado
  WHEN 'PUBLICADA' THEN 'LISTO_MERCADO_PUBLICO'
  WHEN 'EN_EVALUACION' THEN 'EN_REVISION'
  WHEN 'ADJUDICADA' THEN 'ARCHIVADO'
  ELSE estado
END
WHERE estado IN ('PUBLICADA', 'EN_EVALUACION', 'ADJUDICADA');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_licitaciones_estado_pre_publicacion'
  ) THEN
    ALTER TABLE public.licitaciones
      ADD CONSTRAINT chk_licitaciones_estado_pre_publicacion
      CHECK (estado IN (
        'BORRADOR',
        'EN_REVISION',
        'OBSERVADO',
        'APROBADO_JURIDICO',
        'DECRETO_GENERADO',
        'LISTO_MERCADO_PUBLICO',
        'ARCHIVADO'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_licitaciones_ponderaciones_100'
  ) THEN
    ALTER TABLE public.licitaciones
      ADD CONSTRAINT chk_licitaciones_ponderaciones_100
      CHECK (
        estado = 'BORRADOR'
        OR abs(
          coalesce(ponderacion_precio, 0)
          + coalesce(ponderacion_tecnica, 0)
          + coalesce(ponderacion_plazo, 0)
          - 100
        ) < 0.01
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_licitaciones_garantias_rango'
  ) THEN
    ALTER TABLE public.licitaciones
      ADD CONSTRAINT chk_licitaciones_garantias_rango
      CHECK (
        (porcentaje_seriedad IS NULL OR porcentaje_seriedad BETWEEN 0 AND 5)
        AND (porcentaje_cumplimiento IS NULL OR porcentaje_cumplimiento BETWEEN 0 AND 30)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_licitaciones_montos_positivos'
  ) THEN
    ALTER TABLE public.licitaciones
      ADD CONSTRAINT chk_licitaciones_montos_positivos
      CHECK (
        coalesce(presupuesto_total, 0) >= 0
        AND (plazo_ejecucion_dias IS NULL OR plazo_ejecucion_dias > 0)
      );
  END IF;
END $$;

-- 4. Documentos privados con aislamiento por organismo.
CREATE TABLE IF NOT EXISTS public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacion_id uuid NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  categoria varchar(20) NOT NULL DEFAULT 'BASE',
  nombre varchar(255) NOT NULL,
  storage_path text NOT NULL UNIQUE,
  version integer NOT NULL DEFAULT 1,
  tamano_bytes bigint,
  mime_type varchar(120),
  uploaded_by uuid REFERENCES auth.users(id),
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
ALTER TABLE public.licitaciones ENABLE ROW LEVEL SECURITY;

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

-- 5. Reemplazar policies permisivas de licitaciones.
DROP POLICY IF EXISTS "Licitaciones readable by authenticated" ON public.licitaciones;
DROP POLICY IF EXISTS "Licitaciones creatable by authenticated" ON public.licitaciones;
DROP POLICY IF EXISTS "Licitaciones updatable by creator" ON public.licitaciones;
DROP POLICY IF EXISTS licitaciones_read ON public.licitaciones;
DROP POLICY IF EXISTS licitaciones_write ON public.licitaciones;
-- Policies permisivas heredadas del setup inicial (USING true / sin check).
-- IMPRESCINDIBLE eliminarlas: al combinarse con OR anulan el aislamiento por organismo.
DROP POLICY IF EXISTS licitaciones_insert ON public.licitaciones;
DROP POLICY IF EXISTS licitaciones_update ON public.licitaciones;
DROP POLICY IF EXISTS licitaciones_select ON public.licitaciones;
DROP POLICY IF EXISTS licitaciones_delete ON public.licitaciones;
DROP POLICY IF EXISTS "licitaciones_select_mismo_organismo" ON public.licitaciones;
DROP POLICY IF EXISTS "licitaciones_insert_mismo_organismo" ON public.licitaciones;
DROP POLICY IF EXISTS "licitaciones_update_mismo_organismo" ON public.licitaciones;
DROP POLICY IF EXISTS "licitaciones_delete_borrador_mismo_organismo" ON public.licitaciones;

CREATE POLICY "licitaciones_select_mismo_organismo" ON public.licitaciones
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "licitaciones_insert_mismo_organismo" ON public.licitaciones
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "licitaciones_update_mismo_organismo" ON public.licitaciones
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "licitaciones_delete_borrador_mismo_organismo" ON public.licitaciones
  FOR DELETE TO authenticated
  USING (
    estado = 'BORRADOR'
    AND EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

-- 6. Storage privado: el path debe iniciar con organismo_id/licitacion_id/.
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.licitaciones TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.documentos TO authenticated;
