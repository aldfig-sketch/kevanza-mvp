# KEVANZA - ESTADO DE DESARROLLO

**Fecha:** 2026-08-10  
**Versión:** v1.0-MVP  
**Estado:** Generación de Bases con IA - OPERATIVO

---

## ✅ COMPLETADO

### FASE 1: Gestión de Requerimientos
- ✅ Modelo BD: requerimientos, documentos, usuarios
- ✅ UI: Lista + detalle + estados
- ✅ Estados: Borrador, En revisión, Listo MP, Archivado
- ✅ Dashboard con KPIs por estado
- ✅ Filtros y búsqueda

### FASE 2: Generación Automática de Bases (IA)
- ✅ Tabla `bases_tipos` (plantillas por tipo de compra)
- ✅ Tabla `bases_generadas` (propuestas generadas y guardadas)
- ✅ API Anthropic integrada (Claude Opus 4.1)
- ✅ RPC: `generar_bases_rpc` (SECURITY DEFINER)
- ✅ UI: `/licitaciones/[id]/bases.tsx` completa
- ✅ Flujo: Generar → Editar → Guardar
- ✅ Descarga y copia de bases generadas
- ✅ Validación de estructura JSON (Ley 19.886)

### FASE 3: Seguridad & Hardening
- ✅ RLS habilitado en todas las tablas
- ✅ Autenticación JWT validada en API routes
- ✅ API routes protegidas (Bearer tokens)
- ✅ Funciones RPC restringidas a usuarios autenticados
- ✅ Fetch directo a APIs externas (sin SDK bundling)
- ✅ Migraciones SQL versionadas

---

## 🏗️ STACK TÉCNICO

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Next.js + React + TypeScript | 14.2.35 |
| **Base de Datos** | Supabase (PostgreSQL) | sa-east-1 |
| **IA / LLM** | Anthropic Claude Opus | 4.1-20250805 |
| **Autenticación** | Supabase Auth (JWT) | Supabase |
| **Hosting** | Vercel | Production |
| **Estilos** | Tailwind CSS | 3.4 |

---

## ⚙️ REQUISITOS PARA FUNCIONAR

**Desarrollo Local:**
```bash
# Instalar ANTHROPIC_API_KEY
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env.local

# Iniciar servidor
npm run dev
```

**Variables de Entorno Requeridas:**
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `ANTHROPIC_API_KEY` ⚠️ **REQUERIDA PARA IA**

**Configuración Supabase:**
- Proyecto ref: `ibgxezibscvdylpxlglv` ✅
- Región: `sa-east-1` ✅
- RLS: Habilitado en todas las tablas ✅

---

## 📋 MODELO DE DATOS

### Tablas Principales
```
usuarios (id UUID, rol, municipio_id, activo)
licitaciones (id UUID, numero, titulo, estado, tipo_licita, presupuesto_total)
bases_generadas (id UUID, licitacion_id, contenido_bases JSON, estado)
bases_tipos (id UUID, tipo_compra, descripcion)
documentos (id UUID, categoria, licitacion_id, storage_path)
```

### Estados de Requerimiento
```
BORRADOR → EN_REVISION → OBSERVADO → APROBADO_JURIDICO 
→ DECRETO_GENERADO → LISTO_MERCADO_PUBLICO → ARCHIVADO
```

---

## 🎯 PENDIENTE - PRÓXIMAS FASES

### FASE 4: Workflow Jurídico
- [ ] Tabla: `revisiones_juridicas`
- [ ] Envío a jurídico (email integrado)
- [ ] Estados: `ENVIADO_JURIDICO` → `VALIDANDO` → `OBSERVACIONES` → `APROBADO`
- [ ] Loop de cambios y reaprobación

### FASE 5: Control de Plazos
- [ ] Tabla: `configuracion_plazos` por municipio
- [ ] Alertas automáticas (email/SMS)
- [ ] Notificaciones de proximidad a vencimiento
- [ ] Dashboard de riesgos

### FASE 6: Integración Mercado Público
- [ ] API REST del Mercado Público
- [ ] Publicación automática desde APROBADO
- [ ] Registro y tracking de ID MP
- [ ] Sincronización de ofertas recibidas

### FASE 7: Auditoría + Seguimiento
- [ ] Timeline visual del proceso
- [ ] Historial completo de cambios
- [ ] Trazabilidad de usuario + timestamp
- [ ] Reportes de auditoría por municipio

---

## 📊 MÉTRICAS

| Métrica | Valor |
|---------|-------|
| Líneas de código (nuevo) | ~6000+ |
| Tablas base de datos | 10+ |
| API Routes | 8+ |
| Rutas UI (Next.js) | 15+ |
| Build size | 149 KB |
| Tiempo generación bases | ~8-10s (con IA) |
| Usuarios activos | Test |

---

## 🔐 COMMITS RECIENTES

```
6ba6ef3  Security hardening: RLS, auth tokens, fetch-based Claude
7b44418  FASE 5: API route para generación de bases con Claude
c119616  FASE 2: Generación de bases con IA (Claude Opus)
515092a  SYNC: UI sincronizada con BD nueva
```

---

## 🚀 ACCESO

| Entorno | URL | Usuario Test |
|---------|-----|--------------|
| **Producción** | https://kevanza-mvp.vercel.app | alexis@kevanza.test |
| **Local** | http://localhost:3000 | Test (auth local) |
| **Admin Panel** | Dashboard en `/dashboard` | ✅ |
| **Supabase** | Console.supabase.co | Proyecto ibgxezibscvdylpxlglv |

---

## 🔧 DEPLOYMENT

**Vercel:**
- Rama: `main`
- Auto-deploy en push
- Env vars configuradas
- Build: ~2 min

**Base de Datos:**
- Supabase managed PostgreSQL
- Backups diarios
- RLS policies en remoto

---

## 📝 NOTAS

- ⚠️ RLS deshabilitado temporalmente en MVP, re-habilitado con políticas apropiadas
- ⚠️ ANTHROPIC_API_KEY es crítica para feature IA
- ✅ Build optimizado con Next.js 14
- ✅ TypeScript strict mode habilitado
- ✅ Trazabilidad completa via migraciones SQL versionadas

---

**Última actualización:** 2026-08-10  
**Próxima revisión:** Cuando FASE 4 inicie  
**Responsable:** Claude + Alexis Figueroa
