-- =====================================================
-- KEVANZA MVP - Schema Setup
-- =====================================================

-- 1. MUNICIPIOS
CREATE TABLE IF NOT EXISTS municipios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  region TEXT,
  code TEXT UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. ROLES
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  municipio_id UUID REFERENCES municipios(id),
  rol TEXT DEFAULT 'USUARIO',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. LICITACIONES
CREATE TABLE IF NOT EXISTS licitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  municipio_id UUID REFERENCES municipios(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id),

  -- Estados internos previos a Mercado Publico
  estado TEXT DEFAULT 'BORRADOR',

  -- Tipo de licitación
  tipo_licita TEXT,

  -- Presupuesto
  presupuesto_total DECIMAL(15, 2),
  clasificacion VARCHAR(4),
  porcentaje_seriedad DECIMAL(5, 2),
  porcentaje_cumplimiento DECIMAL(5, 2),
  plazo_ejecucion_dias INTEGER,
  incluye_impuestos BOOLEAN DEFAULT true,

  -- Ponderaciones (deben sumar 100)
  ponderacion_precio DECIMAL(5, 2) DEFAULT 0,
  ponderacion_tecnica DECIMAL(5, 2) DEFAULT 0,
  ponderacion_plazo DECIMAL(5, 2) DEFAULT 0,

  -- Campos adicionales (JSON para flexibilidad)
  datos_bases JSONB DEFAULT '{}'::jsonb,

  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Municipios
INSERT INTO municipios (nombre, region, code) VALUES
  ('Pucón', 'La Araucanía', 'PUCON'),
  ('Villarrica', 'La Araucanía', 'VILLARRICA'),
  ('Temuco', 'La Araucanía', 'TEMUCO')
ON CONFLICT DO NOTHING;

-- Roles
INSERT INTO roles (name, description) VALUES
  ('ADMIN_MUNICIPIO', 'Administrador del municipio'),
  ('EVALUADOR', 'Encargado de evaluar licitaciones'),
  ('USUARIO', 'Usuario normal')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para MUNICIPIOS (lectura pública)
CREATE POLICY "Municipios readable by all"
  ON municipios FOR SELECT
  USING (true);

-- Políticas para ROLES (lectura pública)
CREATE POLICY "Roles readable by all"
  ON roles FOR SELECT
  USING (true);

-- Políticas para USUARIOS
CREATE POLICY "Users can view own data"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para LICITACIONES
CREATE POLICY "Licitaciones readable by authenticated"
  ON licitaciones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "Licitaciones creatable by authenticated"
  ON licitaciones FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "Licitaciones updatable by same organism"
  ON licitaciones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

CREATE POLICY "Licitaciones deletable by same organism in draft"
  ON licitaciones FOR DELETE TO authenticated
  USING (
    estado = 'BORRADOR'
    AND EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = (SELECT auth.uid())
        AND u.municipio_id = licitaciones.municipio_id
        AND coalesce(u.activo, true) = true
    )
  );

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_licitaciones_municipio ON licitaciones(municipio_id);
CREATE INDEX idx_licitaciones_created_by ON licitaciones(created_by);
CREATE INDEX idx_licitaciones_estado ON licitaciones(estado);
CREATE INDEX idx_usuarios_municipio ON usuarios(municipio_id);
CREATE INDEX idx_usuarios_role ON usuarios(rol);
