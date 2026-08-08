# 🚨 EMERGENCY FIX: Auth Blocker en Vercel

**PROBLEMA**: Login falla con "Error de conexión"  
**CAUSA**: Variables de entorno de Supabase NO están en Vercel  
**TIEMPO**: 5 minutos para arreglarlo

---

## VERIFICACIÓN RÁPIDA DEL ERROR

Visita: https://kevanza-mvp.vercel.app/auth/login

Deberías ver:
- ❌ "Error de autenticación"
- ❌ "Error de conexión. Verifica tu conexión a internet"

---

## SOLUCIÓN: 4 PASOS SIMPLES

### PASO 1: Obtener Credenciales (1 min)

Abre este archivo: `/Users/alexis/Claude/kevanza-mvp/.env.local`

Deberías ver:
```
NEXT_PUBLIC_SUPABASE_URL=https://ibgxezibscvdyjpxlglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**Copia estos valores** (exactamente como aparecen, sin espacios)

---

### PASO 2: Ir a Vercel Dashboard (1 min)

1. Abre: https://vercel.com/dashboard
2. Selecciona proyecto: "kevanza-mvp"
3. Clickea: **Settings** (en la barra superior)
4. Clickea: **Environment Variables** (en el menú lateral izquierdo)

---

### PASO 3: Agregar Variable 1 (1 min)

Busca si ya existe: `NEXT_PUBLIC_SUPABASE_URL`

**Si existe:**
- Clickea el icono de editar (lápiz)
- Borra el valor actual
- Pega: `https://ibgxezibscvdyjpxlglv.supabase.co`
- Clickea "Save"

**Si NO existe:**
- Clickea botón azul "+ Add New"
- Nombre: `NEXT_PUBLIC_SUPABASE_URL`
- Valor: `https://ibgxezibscvdyjpxlglv.supabase.co`
- Clickea "Add"

---

### PASO 4: Agregar Variable 2 (1 min)

Busca si ya existe: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Si existe:**
- Clickea el icono de editar (lápiz)
- Borra el valor actual
- Pega el KEY de .env.local (el valor largo que empieza con `eyJhbGc`)
- Clickea "Save"

**Si NO existe:**
- Clickea botón azul "+ Add New"
- Nombre: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Valor: (pega el KEY de .env.local)
- Clickea "Add"

---

## ESPERAR REDEPLOY (2 min)

Vercel automáticamente:
1. Detecta que cambiaron las env vars
2. Inicia un nuevo build
3. Deploy en 1-2 minutos

Puedes monitorear en: **Deployments** tab en Vercel

---

## TESTEAR QUE FUNCIONÓ (2 min)

1. Abre: https://kevanza-mvp.vercel.app/auth/login (nueva pestaña)
2. Presiona: **Ctrl+F5** (limpiar caché)
3. Deberías ver:
   - ✅ Formulario de login SIN error rojo
   - ✅ Campos de email y password visibles
   - ✅ Botón "Iniciar sesión" funcional

4. Intenta login:
   - Email: `alexis@kevanza.test`
   - Password: `TempPassword123!`
   - Si ve Dashboard: ✅ **AUTH ARREGLADO**

---

## 🎉 RESULTADO ESPERADO

**Página de Login**
```
✅ Sin "Error de conexión"
✅ Formulario visible
✅ Email field
✅ Password field
✅ Login button
```

**Después de Click "Iniciar sesión"**
```
✅ Redirige a /dashboard
✅ Ve gráficos y licitaciones
✅ Sin errores en consola (F12)
```

---

## ❌ Si Sigue Fallando

### Verificar Variables Exactas

En Vercel > Settings > Environment Variables, debe haber EXACTAMENTE:

```
NEXT_PUBLIC_SUPABASE_URL = https://ibgxezibscvdyjpxlglv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliZ3hlemliY3NjdmR5anB4bGdsdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg2MTQ1NzU1LCJleHAiOjE5NDM5MTc1NTV9.eyJ3bGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

**NO** debe haber espacios al principio o final

### Limpiar Caché

1. Abre DevTools: F12
2. Settings: Ctrl+Shift+S (o tres puntos > Settings)
3. Network > Disable cache
4. Recarga F5

### Revisar Supabase Status

Verifica que Supabase esté online:
- URL: https://status.supabase.com

---

## 📞 SOPORTE

Si persiste después de todos los pasos:

1. Abre DevTools (F12)
2. Console
3. Copia el error exacto
4. Verifica que Supabase está online

---

**Tiempo Total**: 5-10 minutos  
**Dificultad**: ⭐☆☆☆☆ Muy Fácil  
**Resultado**: 🟢 Auth Completo
