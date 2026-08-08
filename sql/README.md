# Migraciones SQL para KEVANZA MVP

## Setup Tabla Ofertas

### Pasos:

1. Ve a **Supabase Dashboard** → tu proyecto (ibgxezibscvdyjpxlglv)
2. Click **SQL Editor**
3. Click **New Query**
4. Copia TODO el contenido de `001-create-ofertas-table.sql`
5. Pega en el editor
6. Click **Run**
7. ✅ Si no hay errores: listo

### Si hay error "table licitaciones does not exist":
- Es normal si no ejecutaste migraciones previas
- Verifica que la tabla licitaciones existe: `SELECT * FROM licitaciones LIMIT 1;`
- Si no existe, crea las tablas básicas primero

### Qué hace el SQL:

✅ Crea tabla `ofertas` con todas las columnas
✅ Crea índices para búsquedas rápidas
✅ Habilita Row Level Security (RLS)
✅ Agrega columna `ponderacion_plazo` a `licitaciones`

### Verificar que funcionó:

```sql
-- Contar ofertas (debe retornar 0)
SELECT COUNT(*) FROM ofertas;

-- Ver estructura
\d ofertas;
```

---

**IMPORTANTE**: Ejecuta este SQL ANTES de probar el MVP. Sin esta tabla, la app no funcionará.
