# KEVANZA MVP - Deployment Instructions

## ✅ Completado:
- ✓ Proyecto Next.js + Supabase creado en `/Users/alexis/claude/kevanza-mvp`
- ✓ npm install (339 paquetes)
- ✓ npm run dev (servidor corriendo en http://localhost:3000)
- ✓ Schema SQL ejecutado en Supabase
- ✓ Git repo inicializado localmente
- ✓ Vercel CLI instalado

## ⚠️ Pasos manuales requeridos:

### Opción A: Deploy con GitHub + Vercel (RECOMENDADO)

#### Paso 1: Crear repositorio en GitHub
```bash
# Ve a https://github.com/new
# Nombre: kevanza-mvp
# Descripción: Next.js + Supabase MVP
# Visibilidad: Public
# Click: "Create repository"
```

#### Paso 2: Pushear código a GitHub
```bash
cd /Users/alexis/claude/kevanza-mvp
git branch -M main
git remote set-url origin https://github.com/aldfig-sketch/kevanza-mvp.git
git push -u origin main
# (Te pedirá credenciales o token de GitHub)
```

#### Paso 3: Deployar en Vercel
```bash
# Opción 1: Desde el navegador:
# 1. Ve a https://vercel.com/new
# 2. Click en "Import Git Repository"
# 3. Selecciona "aldfig-sketch/kevanza-mvp"
# 4. Click "Import"
# 5. Vercel desplegará automáticamente

# Opción 2: Desde terminal:
cd /Users/alexis/claude/kevanza-mvp
npx vercel --prod
# (Sigue las instrucciones interactivas)
```

#### Paso 4: Configurar variables de entorno en Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://ibgxezibscvdyjpxlglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3hlemliY3NjdmR5anB4bGdsdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2MTQ1NzU1LCJleHAiOjE5NDM5MTc1NTV9.eyJ3bGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### Opción B: Deploy directo en Vercel (sin GitHub)
```bash
cd /Users/alexis/claude/kevanza-mvp
npx vercel deploy --prod
# Sube la carpeta completa sin necesidad de GitHub
```

---

## 🚀 URLs del proyecto:
- **Local**: http://localhost:3000
- **GitHub**: https://github.com/aldfig-sketch/kevanza-mvp
- **Vercel**: Se genera al deployar

## 📊 Stack:
- Next.js 14
- React 18
- TypeScript
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS (ready to use)

## 📝 Próximos pasos después del deploy:
1. Refinar UI con componentes React mejorados
2. Agregar más tablas y lógica en Supabase
3. Configurar autenticación con Supabase Auth
4. Agregar validación de formularios
5. Mejorar manejo de errores
