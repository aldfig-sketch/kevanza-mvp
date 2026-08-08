-- KEVANZA MVP: Tabla de Ofertas
-- Ejecutar en Supabase SQL Editor

-- Crear tabla ofertas
CREATE TABLE IF NOT EXISTS ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licitacion_id UUID NOT NULL,
  proveedor_nombre VARCHAR(255) NOT NULL,
  proveedor_email VARCHAR(255) NOT NULL,
  precio_ofertado DECIMAL(15, 2) NOT NULL,
  plazo_dias INTEGER NOT NULL,
  descripcion_tecnica TEXT,
  puntaje_precio DECIMAL(5, 2),
  puntaje_tecnica DECIMAL(5, 2),
  puntaje_plazo DECIMAL(5, 2),
  puntaje_total DECIMAL(5, 2),
  estado VARCHAR(50) DEFAULT 'RECIBIDA',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_licitacion FOREIGN KEY (licitacion_id) REFERENCES licitaciones(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_ofertas_licitacion ON ofertas(licitacion_id);
CREATE INDEX IF NOT EXISTS idx_ofertas_estado ON ofertas(estado);
CREATE INDEX IF NOT EXISTS idx_ofertas_email ON ofertas(proveedor_email);

-- Habilitar RLS
ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;

-- Policy: Cualquiera puede ver ofertas
CREATE POLICY "Anyone can view ofertas" ON ofertas
  FOR SELECT USING (true);

-- Policy: Cualquiera puede insertar ofertas
CREATE POLICY "Anyone can insert ofertas" ON ofertas
  FOR INSERT WITH CHECK (true);

-- Policy: Cualquiera puede actualizar ofertas
CREATE POLICY "Anyone can update ofertas" ON ofertas
  FOR UPDATE USING (true) WITH CHECK (true);

-- Policy: Solo autenticados pueden eliminar
CREATE POLICY "Authenticated users can delete ofertas" ON ofertas
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON ofertas TO postgres, anon, authenticated;

-- Tabla para ponderación de plazo (si no existe)
-- Actualizar licitaciones para incluir ponderacion_plazo si no existe
ALTER TABLE licitaciones
ADD COLUMN IF NOT EXISTS ponderacion_plazo DECIMAL(5, 2) DEFAULT 0;
