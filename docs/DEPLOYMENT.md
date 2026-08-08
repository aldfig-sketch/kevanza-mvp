# KEVANZA - Guía de Deployment

## 1. Arquitectura

```
┌─────────────────────────────────────────┐
│        KEVANZA MVP Architecture         │
├─────────────────────────────────────────┤
│                                         │
│  Frontend:                              │
│  - Next.js 14 (React Framework)         │
│  - Tailwind CSS (Styling)               │
│  - recharts (Gráficos)                  │
│  - react-hook-form (Formularios)        │
│  - jsPDF + XLSX (Reportes)              │
│                                         │
│  Hosting: Vercel (CI/CD automático)     │
│                                         │
│  Backend/Database:                      │
│  - Supabase (PostgreSQL)                │
│  - Row Level Security (RLS)             │
│  - Authentication (Email/Password)      │
│  - Real-time subscriptions              │
│                                         │
│  Storage: Supabase (Auto-backups)       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. URLs en Vivo

| Componente | URL | Notas |
|-----------|-----|-------|
| Aplicación | https://kevanza-mvp.vercel.app | Public |
| Supabase | https://supabase.com/dashboard | Private (auth) |
| Vercel | https://vercel.com/dashboard | Private (auth) |
| GitHub | https://github.com/aldfig-sketch/kevanza-mvp | Public repo |

---

## 3. Variables de Entorno

### Vercel Settings

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ibgxezibscvdyjpxlglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-value]

# Note: These are public, that's ok (anon key is limited)
```

### Local Development

Crear `.env.local` en raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ibgxezibscvdyjpxlglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### Rotación de Keys

⚠️ **Cada 90 días:**
1. Supabase > Settings > API
2. Regenerar anon key
3. Actualizar en Vercel Settings
4. Vercel automáticamente redeploy

---

## 4. Deploy Manual

### Requisitos
- Git instalado
- Acceso a GitHub repo
- Acceso a Vercel

### Pasos

1. **Clonar repo:**
```bash
git clone https://github.com/aldfig-sketch/kevanza-mvp.git
cd kevanza-mvp
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Crear cambios** (o hacer git pull si ya existe)

4. **Testing local:**
```bash
npm run dev
```

5. **Build test:**
```bash
npm run build
```

6. **Commit y push:**
```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```

7. **Vercel automáticamente:**
   - Detecta cambio en main
   - Inicia build automático
   - Deploy en 2-3 minutos
   - Check en https://vercel.com/dashboard

---

## 5. CI/CD Automático

### GitHub → Vercel Flow

```
1. git push origin main
   ↓
2. GitHub notifica a Vercel
   ↓
3. Vercel inicia build (npm run build)
   ↓
4. Si build success → deploy
   ↓
5. Si build fail → notifica en GitHub + email
   ↓
6. Preview URL disponible en PR
```

### Revisar Deploy

1. Vercel Dashboard > kevanza-mvp
2. Ver última deployment
3. Estado: ✓ Ready (exitoso) o ✗ Error
4. Click **"Visit"** para ver sitio en vivo

---

## 6. Rollback (Si hay Error)

### Volver a Deploy Anterior

1. Vercel Dashboard > kevanza-mvp > Deployments
2. Buscar deployment anterior exitoso
3. Click los 3 puntos (...)
4. Click **"Promote to Production"**
5. Confirmado en 1 minuto

### Alternativa: Git Revert

```bash
# Ver commits
git log --oneline

# Revertir último commit
git revert HEAD

# Push
git push origin main

# Vercel automáticamente redeploy
```

---

## 7. Monitoreo Post-Deploy

### Checklists

**Inmediatamente después:**
- [ ] Check status en Vercel (✓ Ready)
- [ ] Visitar https://kevanza-mvp.vercel.app
- [ ] Login funciona (test user)
- [ ] Dashboard carga sin errores
- [ ] Revisar consola (F12) - no errors

**Después de 30 minutos:**
- [ ] Analytics en Vercel (traffic normal)
- [ ] Database en Supabase (no errores)
- [ ] Verificar un flujo completo (crear licitación)

**Después de 24 horas:**
- [ ] Logs sin issues críticos
- [ ] Performance acceptable
- [ ] No errores reportados

---

## 8. Problemas y Soluciones

### Build Falla

**Error típico:**
```
✗ error: Failed to compile
  Error en src/pages/...
```

**Solución:**
1. Revisar cambios locales
2. Ejecutar `npm run build` localmente
3. Fijar error
4. `git push` nuevamente

### Deploy Exitoso pero App Rota

**Síntomas:**
- Vercel muestra ✓ Ready
- Pero https://kevanza-mvp.vercel.app muestra error

**Soluciones:**
1. Limpiar caché: Ctrl+F5
2. Abrir en incógnito
3. Esperar 2 minutos (cache propagation)
4. Si persiste: rollback a anterior deployment

### Variables de Entorno No Cargan

**Verificar:**
1. Vercel > kevanza-mvp > Settings > Environment Variables
2. Confirmar variables presentes
3. Si faltan: agregar y redeployr manualmente

```bash
# Forzar redeploy sin cambios
vercel --prod
```

---

## 9. Performance Tips

### Antes de Deploy a Producción

```bash
# Build test
npm run build

# Check tamaño
npm run analyze  # if available

# Lighthouse check
vercel --prod --test
```

### Optimizaciones Futuras

- [ ] Image optimization (Next.js Image)
- [ ] Code splitting automático
- [ ] Cache headers tuning
- [ ] Database connection pooling

---

## 10. Backup y Recovery

### Backups Automáticos

**Supabase realiza:**
- ✓ Backup diario (02:00 UTC)
- ✓ Retención 30 días
- ✓ Encriptado automático

### Descargar Backup Manual

```
Supabase > Settings > Backups > Download
```

### Restaurar (EMERGENCIA SOLO)

⚠️ **Operación destructiva**

```
Supabase > Settings > Backups > Restore
```

---

## 11. Escalabilidad

### Límites Actuales

| Componente | Límite | Umbrales |
|-----------|--------|----------|
| Vercel | 100 GB bandwidth/mes | OK para MVP |
| Supabase | 500 MB storage free | Upgrade si >80% |
| Realtime | 200 concurrent | OK para MVP |
| Database | Unlimited rows | Performance OK hasta 1M |

### Plan de Escalado

| Hito | Acción |
|------|--------|
| 100 licitaciones | Monitor performance |
| 500 licitaciones | Considerar índices DB |
| 1000+ licitaciones | Upgrade plan Supabase |

---

## 12. Contacto

**Deployment Support:**
- GitHub Issues: https://github.com/aldfig-sketch/kevanza-mvp/issues
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

**Critical Issues:**
- Email: ops@kevanza.cl
- On-call: Check rotation schedule

---

**Última actualización**: 7 agosto 2026
**Versión**: 2.0 MVP
**Maintained by**: DevOps Team
