-- Roles granulares, alertas de flujo y versionamiento de bases tipo.
-- El MVP conserva licitaciones como nombre físico del requerimiento interno.

CREATE TABLE IF NOT EXISTS public.roles (
  id bigserial PRIMARY KEY,
  name text,
  codigo varchar(50),
  nombre varchar(100),
  descripcion text,
  permisos jsonb NOT NULL DEFAULT '{}'::jsonb,
  nivel_acceso integer NOT NULL DEFAULT 1 CHECK (nivel_acceso BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS codigo varchar(50);
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS nombre varchar(100);
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS descripcion text;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS permisos jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS nivel_acceso integer NOT NULL DEFAULT 1;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

UPDATE public.roles
SET codigo = coalesce(nullif(codigo, ''), upper(regexp_replace(coalesce(name, nombre, 'ROL'), '[^A-Za-z0-9]+', '_', 'g'))),
    nombre = coalesce(nullif(nombre, ''), name, codigo),
    name = coalesce(nullif(name, ''), nombre, codigo)
WHERE codigo IS NULL OR nombre IS NULL OR name IS NULL;

ALTER TABLE public.roles ALTER COLUMN codigo SET NOT NULL;
ALTER TABLE public.roles ALTER COLUMN nombre SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS roles_codigo_key ON public.roles(codigo);
CREATE UNIQUE INDEX IF NOT EXISTS roles_nombre_key ON public.roles(nombre);

INSERT INTO public.roles (name, codigo, nombre, descripcion, nivel_acceso, permisos)
VALUES
  ('Unidad Técnica', 'UNIDAD_TECNICA', 'Unidad Técnica', 'Solicita requerimientos y adjunta antecedentes técnicos.', 1, '{"crear_requerimiento":true,"ver_propios":true,"adjuntar_pdf":true,"adjuntar_eett":true}'::jsonb),
  ('Comprador', 'UNIDAD_COMPRA', 'Comprador', 'Procesa requerimientos y selecciona bases tipo.', 2, '{"revisar_requerimientos":true,"aprobar_requerimientos":true,"seleccionar_bases":true,"ajustar_bases":true,"generar_decreto":true,"ver_dashboard":true}'::jsonb),
  ('Jurídico', 'JURIDICO', 'Jurídico', 'Revisa y aprueba bases antes del decreto.', 2, '{"revisar_bases":true,"aprobar_bases":true,"solicitar_cambios":true}'::jsonb),
  ('Jefe Compras', 'JEFE_COMPRAS', 'Jefe Compras', 'Monitorea el proceso y recibe alertas.', 3, '{"ver_todos":true,"monitorear":true,"recibir_alertas":true,"generar_reportes":true,"aprobar_versiones":true}'::jsonb),
  ('Admin Institución', 'ADMIN_INSTITUCION', 'Admin Institución', 'Administra la configuración de un organismo.', 4, '{"acceso_institucion":true,"gestionar_usuarios":true,"configurar_alertas":true,"crear_bases_tipo":true}'::jsonb),
  ('Admin Sistema', 'ADMIN_SISTEMA', 'Admin Sistema', 'Control total de la plataforma.', 5, '{"acceso_total":true,"gestionar_usuarios":true,"configurar_alertas":true,"crear_bases_tipo":true,"ver_auditoria":true}'::jsonb),
  ('Lector', 'LECTOR', 'Lector', 'Consulta información sin modificar el proceso.', 1, '{"ver_requerimientos":true,"ver_dashboard":true}'::jsonb)
ON CONFLICT (codigo) DO UPDATE SET
  nombre = excluded.nombre,
  name = excluded.name,
  descripcion = excluded.descripcion,
  nivel_acceso = excluded.nivel_acceso,
  permisos = excluded.permisos;

CREATE TABLE IF NOT EXISTS public.usuarios_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  rol_id bigint NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  institucion_id uuid REFERENCES public.municipios(id) ON DELETE CASCADE,
  activo boolean NOT NULL DEFAULT true,
  fecha_asignacion timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, rol_id, institucion_id)
);

ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_role_id_fkey;
ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;

INSERT INTO public.usuarios_roles (usuario_id, rol_id, institucion_id)
SELECT u.id, r.id, u.municipio_id
FROM public.usuarios u
JOIN public.roles r ON r.codigo = CASE
  WHEN u.rol = 'ADMIN_MUNICIPIO' THEN 'ADMIN_INSTITUCION'
  WHEN u.rol IN ('ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_TECNICA', 'UNIDAD_COMPRA', 'JURIDICO', 'JEFE_COMPRAS', 'LECTOR') THEN u.rol
  ELSE 'LECTOR'
END
WHERE coalesce(u.activo, true)
ON CONFLICT (usuario_id, rol_id, institucion_id) DO NOTHING;

UPDATE public.usuarios u
SET role_id = r.id
FROM public.roles r
WHERE r.codigo = CASE WHEN u.rol = 'ADMIN_MUNICIPIO' THEN 'ADMIN_INSTITUCION' ELSE u.rol END
  AND (u.role_id IS NULL OR u.role_id <> r.id);

CREATE TABLE IF NOT EXISTS public.alertas_parametros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institucion_id uuid NOT NULL UNIQUE REFERENCES public.municipios(id) ON DELETE CASCADE,
  plazo_compra_dias integer NOT NULL DEFAULT 3 CHECK (plazo_compra_dias > 0),
  plazo_juridico_dias integer NOT NULL DEFAULT 5 CHECK (plazo_juridico_dias > 0),
  plazo_firma_dias integer NOT NULL DEFAULT 2 CHECK (plazo_firma_dias > 0),
  plazo_total_ejecucion_dias integer NOT NULL DEFAULT 15 CHECK (plazo_total_ejecucion_dias > 0),
  horas_sin_actividad_alerta integer NOT NULL DEFAULT 24 CHECK (horas_sin_actividad_alerta > 0),
  horas_sin_actividad_critica integer NOT NULL DEFAULT 48 CHECK (horas_sin_actividad_critica > horas_sin_actividad_alerta),
  dias_antes_vencimiento_alerta integer NOT NULL DEFAULT 1 CHECK (dias_antes_vencimiento_alerta >= 0),
  alertar_correo boolean NOT NULL DEFAULT true,
  alertar_sms boolean NOT NULL DEFAULT false,
  alertar_whatsapp boolean NOT NULL DEFAULT false,
  alertas_a_comprador boolean NOT NULL DEFAULT true,
  alertas_a_jefatura boolean NOT NULL DEFAULT true,
  alertas_a_admin boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.alertas_parametros (institucion_id)
SELECT id FROM public.municipios WHERE coalesce(activo, true)
ON CONFLICT (institucion_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.alertas_registradas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacion_id uuid NOT NULL REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  tipo_alerta varchar(100) NOT NULL,
  descripcion text NOT NULL,
  severidad varchar(20) NOT NULL CHECK (severidad IN ('amarilla', 'roja', 'critica')),
  enviado_a jsonb NOT NULL DEFAULT '[]'::jsonb,
  canales_enviados jsonb NOT NULL DEFAULT '[]'::jsonb,
  fecha_creacion timestamptz NOT NULL DEFAULT now(),
  fecha_resolucion timestamptz,
  resuelta boolean NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS alertas_activas_unicas
  ON public.alertas_registradas(licitacion_id, tipo_alerta) WHERE resuelta = false;
CREATE INDEX IF NOT EXISTS alertas_registradas_licitacion_idx ON public.alertas_registradas(licitacion_id, resuelta);

CREATE TABLE IF NOT EXISTS public.notificaciones_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo varchar(100) NOT NULL,
  mensaje text NOT NULL,
  licitacion_id uuid REFERENCES public.licitaciones(id) ON DELETE CASCADE,
  leida boolean NOT NULL DEFAULT false,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notificaciones_usuario_idx ON public.notificaciones_usuario(usuario_id, leida, fecha_creacion DESC);

CREATE TABLE IF NOT EXISTS public.bases_tipo_versiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bases_tipo_id uuid NOT NULL REFERENCES public.bases_tipos(id) ON DELETE CASCADE,
  version varchar(20) NOT NULL,
  contenido jsonb NOT NULL DEFAULT '{}'::jsonb,
  estado varchar(30) NOT NULL DEFAULT 'DRAFT' CHECK (estado IN ('DRAFT', 'PENDIENTE_REVISION', 'APROBADA_JEFATURA', 'APROBADA', 'RECHAZADA')),
  solicitada_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  fecha_solicitud timestamptz NOT NULL DEFAULT now(),
  revisada_jefatura_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  aprobada_jefatura boolean,
  observaciones_jefatura text,
  fecha_revision_jefatura timestamptz,
  revisada_juridico_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  aprobada_juridico boolean,
  observaciones_juridico text,
  fecha_revision_juridico timestamptz,
  activada_como_oficial timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bases_tipo_id, version)
);
CREATE INDEX IF NOT EXISTS bases_tipo_versiones_estado_idx ON public.bases_tipo_versiones(bases_tipo_id, estado);

ALTER TABLE public.licitaciones
  ADD COLUMN IF NOT EXISTS eett_url varchar(500),
  ADD COLUMN IF NOT EXISTS bases_tipo_version_id uuid,
  ADD COLUMN IF NOT EXISTS fecha_envio_compra timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_envio_juridico timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_decreto_generado timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_firma_solicitada timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_firma_completada timestamptz,
  ADD COLUMN IF NOT EXISTS fecha_publicacion_mp timestamptz;

ALTER TABLE public.licitaciones DROP CONSTRAINT IF EXISTS licitaciones_bases_tipo_version_id_fkey;
ALTER TABLE public.licitaciones
  ADD CONSTRAINT licitaciones_bases_tipo_version_id_fkey
  FOREIGN KEY (bases_tipo_version_id) REFERENCES public.bases_tipo_versiones(id) ON DELETE SET NULL;

INSERT INTO public.bases_tipo_versiones (bases_tipo_id, version, contenido, estado, solicitada_por, aprobada_jefatura, fecha_revision_jefatura, aprobada_juridico, fecha_revision_juridico, activada_como_oficial)
SELECT bt.id, bt.version::text,
       jsonb_build_object('estructura', bt.estructura_base, 'clausulas_obligatorias', coalesce(bt.clausulas_obligatorias, '{}'::jsonb), 'campos_especificos', coalesce(bt.campos_especificos, '{}'::jsonb)),
       'APROBADA',
       (SELECT u.id FROM public.usuarios u WHERE coalesce(u.activo, true) ORDER BY u.created_at LIMIT 1),
       true, now(), true, now(), now()
FROM public.bases_tipos bt
WHERE NOT EXISTS (SELECT 1 FROM public.bases_tipo_versiones v WHERE v.bases_tipo_id = bt.id AND v.version = bt.version::text);

CREATE OR REPLACE FUNCTION public.marcar_hito_licitacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.estado IS DISTINCT FROM OLD.estado THEN
    CASE NEW.estado
      WHEN 'ENVIADA_COMPRA' THEN NEW.fecha_envio_compra = coalesce(NEW.fecha_envio_compra, now());
      WHEN 'ENVIADA_JURIDICO', 'EN_REVISION' THEN NEW.fecha_envio_juridico = coalesce(NEW.fecha_envio_juridico, now());
      WHEN 'DECRETO_GENERADO' THEN NEW.fecha_decreto_generado = coalesce(NEW.fecha_decreto_generado, now());
      WHEN 'PENDIENTE_FIRMA' THEN NEW.fecha_firma_solicitada = coalesce(NEW.fecha_firma_solicitada, now());
      WHEN 'LISTO_PUBLICACION' THEN NEW.fecha_firma_completada = coalesce(NEW.fecha_firma_completada, now());
      WHEN 'PUBLICADA_MP' THEN NEW.fecha_publicacion_mp = coalesce(NEW.fecha_publicacion_mp, now());
      ELSE NULL;
    END CASE;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marcar_hito_licitacion ON public.licitaciones;
CREATE TRIGGER trg_marcar_hito_licitacion
BEFORE INSERT OR UPDATE OF estado ON public.licitaciones
FOR EACH ROW EXECUTE FUNCTION public.marcar_hito_licitacion();

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_parametros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_registradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bases_tipo_versiones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS roles_read ON public.roles;
CREATE POLICY roles_read ON public.roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS usuarios_roles_read ON public.usuarios_roles;
CREATE POLICY usuarios_roles_read ON public.usuarios_roles FOR SELECT TO authenticated
USING (usuario_id = (SELECT auth.uid()) OR EXISTS (
  SELECT 1 FROM public.usuarios viewer
  WHERE viewer.id = (SELECT auth.uid())
    AND viewer.municipio_id = usuarios_roles.institucion_id
    AND viewer.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'JEFE_COMPRAS')
));

DROP POLICY IF EXISTS alertas_parametros_read ON public.alertas_parametros;
DROP POLICY IF EXISTS alertas_parametros_update ON public.alertas_parametros;
CREATE POLICY alertas_parametros_read ON public.alertas_parametros FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = (SELECT auth.uid()) AND u.municipio_id = institucion_id AND coalesce(u.activo, true)));
CREATE POLICY alertas_parametros_update ON public.alertas_parametros FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = (SELECT auth.uid()) AND u.municipio_id = institucion_id AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA')))
WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = (SELECT auth.uid()) AND u.municipio_id = institucion_id AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA')));

DROP POLICY IF EXISTS alertas_registradas_read ON public.alertas_registradas;
DROP POLICY IF EXISTS alertas_registradas_update ON public.alertas_registradas;
CREATE POLICY alertas_registradas_read ON public.alertas_registradas FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.licitaciones l JOIN public.usuarios u ON u.municipio_id = l.municipio_id WHERE l.id = licitacion_id AND u.id = (SELECT auth.uid()) AND coalesce(u.activo, true)));
CREATE POLICY alertas_registradas_update ON public.alertas_registradas FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.licitaciones l JOIN public.usuarios u ON u.municipio_id = l.municipio_id WHERE l.id = licitacion_id AND u.id = (SELECT auth.uid()) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'JEFE_COMPRAS')))
WITH CHECK (resuelta IN (true, false));

DROP POLICY IF EXISTS notificaciones_read ON public.notificaciones_usuario;
DROP POLICY IF EXISTS notificaciones_update ON public.notificaciones_usuario;
CREATE POLICY notificaciones_read ON public.notificaciones_usuario FOR SELECT TO authenticated USING (usuario_id = (SELECT auth.uid()));
CREATE POLICY notificaciones_update ON public.notificaciones_usuario FOR UPDATE TO authenticated USING (usuario_id = (SELECT auth.uid())) WITH CHECK (usuario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS bases_tipo_versiones_read ON public.bases_tipo_versiones;
DROP POLICY IF EXISTS bases_tipo_versiones_insert ON public.bases_tipo_versiones;
DROP POLICY IF EXISTS bases_tipo_versiones_update ON public.bases_tipo_versiones;
CREATE POLICY bases_tipo_versiones_read ON public.bases_tipo_versiones FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)));
CREATE POLICY bases_tipo_versiones_insert ON public.bases_tipo_versiones FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_COMPRA') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)));
CREATE POLICY bases_tipo_versiones_update ON public.bases_tipo_versiones FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_COMPRA', 'JEFE_COMPRAS', 'JURIDICO') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)))
WITH CHECK (EXISTS (SELECT 1 FROM public.bases_tipos bt JOIN public.usuarios u ON u.id = (SELECT auth.uid()) WHERE bt.id = bases_tipo_id AND coalesce(u.activo, true) AND u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA', 'UNIDAD_COMPRA', 'JEFE_COMPRAS', 'JURIDICO') AND (bt.institucion_id IS NULL OR bt.institucion_id = u.municipio_id)));
