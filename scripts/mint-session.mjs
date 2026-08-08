/**
 * Genera un enlace de acceso SIN CONTRASEÑA para pruebas E2E.
 *
 * Usa el service_role (admin) para crear un magic link de una cuenta de prueba.
 * Al visitar el enlace en el navegador, la app establece la sesión sola
 * (detectSessionInUrl: true). No se maneja ninguna contraseña.
 *
 * Requiere en el entorno:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Supabase Dashboard → Settings → API → service_role)
 *
 * Uso:
 *   node scripts/mint-session.mjs <email> [redirectTo]
 *   node scripts/mint-session.mjs alexis@kevanza.test http://localhost:3000/dashboard
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

// Cargar .env.local manualmente (sin dependencias extra)
function loadEnv(file) {
  try {
    const txt = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch {}
}
loadEnv('.env.local')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const email = process.argv[2] || 'alexis@kevanza.test'
const redirectTo = process.argv[3] || 'http://localhost:3000/dashboard'

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const { data, error } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: { redirectTo },
})

if (error) {
  console.error('❌ Error generando enlace:', error.message)
  process.exit(1)
}

// El action_link apunta al endpoint /verify de Supabase y redirige a redirectTo
// con los tokens en el hash; la app los detecta y crea la sesión.
console.log('\n✅ ENLACE DE ACCESO (sin contraseña) para:', email)
console.log('\n' + data.properties.action_link + '\n')
