-- Gestión segura de usuarios. roles.id es BIGINT en el esquema existente.
CREATE TABLE IF NOT EXISTS public.politica_contrasenas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol_id bigint NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  minimo_caracteres integer NOT NULL DEFAULT 8 CHECK (minimo_caracteres BETWEEN 8 AND 128),
  requiere_mayuscula boolean NOT NULL DEFAULT true,
  requiere_numero boolean NOT NULL DEFAULT true,
  requiere_simbolo boolean NOT NULL DEFAULT false,
  validez_dias integer NOT NULL DEFAULT 90 CHECK (validez_dias > 0),
  historial_previo integer NOT NULL DEFAULT 3 CHECK (historial_previo >= 0),
  intentos_fallidos_bloqueo integer NOT NULL DEFAULT 5 CHECK (intentos_fallidos_bloqueo BETWEEN 3 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rol_id)
);

INSERT INTO public.politica_contrasenas (rol_id)
SELECT id FROM public.roles
ON CONFLICT (rol_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.usuarios_historial_contrasenas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  hash_anterior text,
  fecha_cambio timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS usuarios_historial_contrasenas_usuario_idx
  ON public.usuarios_historial_contrasenas(usuario_id, fecha_cambio DESC);

CREATE TABLE IF NOT EXISTS public.usuarios_intentos_fallidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  intentos integer NOT NULL DEFAULT 1 CHECK (intentos >= 0),
  fecha_ultimo_intento timestamptz NOT NULL DEFAULT now(),
  bloqueado_hasta timestamptz,
  UNIQUE (usuario_id)
);

CREATE TABLE IF NOT EXISTS public.usuarios_primer_login (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  debe_cambiar_contrasena boolean NOT NULL DEFAULT true,
  token_cambio text,
  expira_en timestamptz,
  primer_login_realizado boolean NOT NULL DEFAULT false,
  fecha_primer_login timestamptz,
  UNIQUE (usuario_id)
);

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS es_activo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ultimo_login timestamptz,
  ADD COLUMN IF NOT EXISTS contrasena_expira timestamptz;

UPDATE public.usuarios
SET es_activo = coalesce(es_activo, activo, true),
    activo = coalesce(activo, es_activo, true),
    is_active = coalesce(is_active, activo, es_activo, true)
WHERE es_activo IS NULL OR activo IS NULL OR is_active IS NULL;

ALTER TABLE public.politica_contrasenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_historial_contrasenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_intentos_fallidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_primer_login ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS politica_contrasenas_read ON public.politica_contrasenas;
CREATE POLICY politica_contrasenas_read ON public.politica_contrasenas FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (SELECT auth.uid())
      AND coalesce(u.activo, true)
      AND (u.role_id = politica_contrasenas.rol_id OR u.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA'))
  )
);

DROP POLICY IF EXISTS usuarios_historial_read ON public.usuarios_historial_contrasenas;
CREATE POLICY usuarios_historial_read ON public.usuarios_historial_contrasenas FOR SELECT TO authenticated
USING (usuario_id = (SELECT auth.uid()) OR EXISTS (
  SELECT 1 FROM public.usuarios viewer
  JOIN public.usuarios target ON target.id = usuarios_historial_contrasenas.usuario_id
  WHERE viewer.id = (SELECT auth.uid())
    AND viewer.municipio_id = target.municipio_id
    AND viewer.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA')
));

DROP POLICY IF EXISTS usuarios_intentos_read ON public.usuarios_intentos_fallidos;
CREATE POLICY usuarios_intentos_read ON public.usuarios_intentos_fallidos FOR SELECT TO authenticated
USING (usuario_id = (SELECT auth.uid()) OR EXISTS (
  SELECT 1 FROM public.usuarios viewer
  JOIN public.usuarios target ON target.id = usuarios_intentos_fallidos.usuario_id
  WHERE viewer.id = (SELECT auth.uid())
    AND viewer.municipio_id = target.municipio_id
    AND viewer.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA')
));

DROP POLICY IF EXISTS usuarios_primer_login_read ON public.usuarios_primer_login;
CREATE POLICY usuarios_primer_login_read ON public.usuarios_primer_login FOR SELECT TO authenticated
USING (usuario_id = (SELECT auth.uid()) OR EXISTS (
  SELECT 1 FROM public.usuarios viewer
  JOIN public.usuarios target ON target.id = usuarios_primer_login.usuario_id
  WHERE viewer.id = (SELECT auth.uid())
    AND viewer.municipio_id = target.municipio_id
    AND viewer.rol IN ('ADMIN_MUNICIPIO', 'ADMIN_INSTITUCION', 'ADMIN_SISTEMA')
));

REVOKE ALL ON TABLE public.politica_contrasenas, public.usuarios_historial_contrasenas,
  public.usuarios_intentos_fallidos, public.usuarios_primer_login FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE
  public.politica_contrasenas, public.usuarios_historial_contrasenas,
  public.usuarios_intentos_fallidos, public.usuarios_primer_login FROM authenticated;
GRANT SELECT ON TABLE public.politica_contrasenas, public.usuarios_historial_contrasenas,
  public.usuarios_intentos_fallidos, public.usuarios_primer_login TO authenticated;
