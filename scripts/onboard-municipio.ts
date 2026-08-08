/**
 * KEVANZA Onboarding Script
 * Automatiza agregar un nuevo municipio en 15 minutos
 *
 * Uso: npx ts-node scripts/onboard-municipio.ts <nombre-municipio> <email-admin>
 * Ej: npx ts-node scripts/onboard-municipio.ts "Pucón" "admin@puconcl.gov.cl"
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface OnboardingResult {
  municipioId: string
  adminEmail: string
  demoEmail: string
  tempPassword: string
  setupUrl: string
  status: 'success' | 'error'
  message: string
}

/**
 * Genera contraseña temporal segura
 */
function generarContraseñaTemporal(): string {
  return crypto.randomBytes(12).toString('hex').slice(0, 16).toUpperCase()
}

/**
 * PASO 1: Crear municipio en base de datos
 */
async function crearMunicipio(nombre: string): Promise<string> {
  console.log(`  [1/6] Creando municipio: ${nombre}...`)

  try {
    const { data, error } = await supabase
      .from('municipios')
      .insert([{ nombre, region: 'La Araucanía', activo: true }])
      .select('id')
      .single()

    if (error) throw error
    console.log(`  ✅ Municipio creado: ${data.id}`)
    return data.id
  } catch (error) {
    throw new Error(`Error creando municipio: ${error}`)
  }
}

/**
 * PASO 2: Crear usuario admin municipal
 */
async function crearUsuarioAdmin(
  municipioId: string,
  email: string,
  nombre: string
): Promise<{ userId: string; tempPassword: string }> {
  console.log(`  [2/6] Creando usuario admin: ${email}...`)

  const tempPassword = generarContraseñaTemporal()

  try {
    // En producción, usar Supabase Admin API
    // Por ahora, retornamos la contraseña para que se configure manualmente

    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          email,
          nombre,
          municipio_id: municipioId,
          rol: 'ADMIN_MUNICIPIO',
          activo: true,
        },
      ])
      .select('id')
      .single()

    if (error) throw error
    console.log(`  ✅ Admin creado: ${data.id}`)
    return { userId: data.id, tempPassword }
  } catch (error) {
    throw new Error(`Error creando admin: ${error}`)
  }
}

/**
 * PASO 3: Crear usuario demo
 */
async function crearUsuarioDemo(municipioId: string): Promise<string> {
  console.log(`  [3/6] Creando usuario demo...`)

  const demoEmail = `demo@municipio-${municipioId}.test`

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          email: demoEmail,
          nombre: 'Demo User',
          municipio_id: municipioId,
          rol: 'MUNICIPIO',
          activo: true,
        },
      ])
      .select('id')
      .single()

    if (error) throw error
    console.log(`  ✅ Demo creado: ${demoEmail}`)
    return demoEmail
  } catch (error) {
    throw new Error(`Error creando demo: ${error}`)
  }
}

/**
 * PASO 4: Crear licitación template
 */
async function crearLicitacionTemplate(municipioId: string): Promise<string> {
  console.log(`  [4/6] Creando licitación template...`)

  try {
    const { data, error } = await supabase
      .from('licitaciones')
      .insert([
        {
          numero: `DEMO-${Date.now()}`,
          titulo: 'Ejemplo: Equipamiento Informático 2026',
          descripcion:
            'Esta es una licitación de ejemplo. Puedes usarla para probar todas las funcionalidades.',
          estado: 'BORRADOR',
          municipio_id: municipioId,
          tipo_licita: 'Equipamiento',
          presupuesto_total: 50000000,
          ponderacion_precio: 60,
          ponderacion_tecnica: 25,
          ponderacion_experiencia: 15,
          ponderacion_otro: 0,
        },
      ])
      .select('id')
      .single()

    if (error) throw error
    console.log(`  ✅ Template creada: ${data.id}`)
    return data.id
  } catch (error) {
    throw new Error(`Error creando template: ${error}`)
  }
}

/**
 * PASO 5: Enviar email de bienvenida
 */
async function enviarEmailBienvenida(
  email: string,
  municipio: string,
  tempPassword: string
): Promise<void> {
  console.log(`  [5/6] Enviando email de bienvenida...`)

  // En producción, usar SendGrid/Mailgun
  // Por ahora, solo logueamos

  const emailContent = `
BIENVENIDA A KEVANZA

Municipio: ${municipio}
Email: ${email}
Contraseña temporal: ${tempPassword}

URL: https://kevanza-mvp.vercel.app
Cambiar contraseña en primer acceso.

Soporte: soporte@kevanza.cl
  `

  console.log(`  ✅ Email de bienvenida preparado:`)
  console.log(emailContent)
}

/**
 * PASO 6: Generar documento de setup
 */
async function generarDocumentoSetup(
  municipio: string,
  adminEmail: string,
  demoEmail: string,
  tempPassword: string
): Promise<string> {
  console.log(`  [6/6] Generando documento de setup...`)

  const setupDoc = `
# SETUP KEVANZA - ${municipio}

## ✅ Onboarding Completado

Fecha: ${new Date().toISOString()}

## Credenciales Admin

- Email: ${adminEmail}
- Contraseña temporal: ${tempPassword}
- Rol: ADMIN_MUNICIPIO
- URL: https://kevanza-mvp.vercel.app

## Credenciales Demo

- Email: ${demoEmail}
- Contraseña: TempPassword123!
- Rol: MUNICIPIO (readonly)
- Propósito: Testing sin afectar datos reales

## Próximos Pasos

1. Login con credenciales admin
2. Cambiar contraseña temporal
3. Leer docs/TRAINING_PUCON.md
4. Crear primera licitación
5. Invitar otros usuarios

## Soporte

- Email: soporte@kevanza.cl
- Teléfono: +56 9 XXXX XXXX
- Docs: https://github.com/aldfig-sketch/kevanza-mvp/tree/main/docs

## Timeline Típico

- Día 1-2: Familiarización
- Día 3-7: Primera licitación
- Semana 2: Múltiples licitaciones
- Mes 1: Full adoption

---

Generado automáticamente por kevanza-onboard.ts
`

  console.log(`  ✅ Documento generado`)
  return setupDoc
}

/**
 * Main: Orquestar todo el onboarding
 */
async function main() {
  const [, , municipioNombre, adminEmail] = process.argv

  if (!municipioNombre || !adminEmail) {
    console.error(
      'Uso: npx ts-node scripts/onboard-municipio.ts <nombre-municipio> <email-admin>'
    )
    console.error('Ej: npx ts-node scripts/onboard-municipio.ts "Pucón" "admin@puconcl.gov.cl"')
    process.exit(1)
  }

  console.log('\n🚀 KEVANZA ONBOARDING MUNICIPIO')
  console.log(`📍 ${municipioNombre}`)
  console.log(`📧 ${adminEmail}\n`)

  try {
    // Ejecutar pasos en secuencia
    const municipioId = await crearMunicipio(municipioNombre)
    const { userId, tempPassword } = await crearUsuarioAdmin(
      municipioId,
      adminEmail,
      municipioNombre
    )
    const demoEmail = await crearUsuarioDemo(municipioId)
    const licitacionId = await crearLicitacionTemplate(municipioId)
    await enviarEmailBienvenida(adminEmail, municipioNombre, tempPassword)
    const setupDoc = await generarDocumentoSetup(
      municipioNombre,
      adminEmail,
      demoEmail,
      tempPassword
    )

    // Retornar resultado
    const result: OnboardingResult = {
      municipioId,
      adminEmail,
      demoEmail,
      tempPassword,
      setupUrl: `https://kevanza-mvp.vercel.app/auth/login`,
      status: 'success',
      message: `✅ Onboarding completado en 15 minutos para ${municipioNombre}`,
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ ONBOARDING EXITOSO')
    console.log('='.repeat(60))
    console.log(JSON.stringify(result, null, 2))

    // Guardar documento de setup
    const fs = await import('fs/promises')
    const setupPath = `./setups/${municipioId}-setup.md`
    await fs.mkdir('./setups', { recursive: true })
    await fs.writeFile(setupPath, setupDoc)
    console.log(`\n📄 Setup guardado: ${setupPath}`)
  } catch (error) {
    console.error('\n❌ ERROR:', error)
    process.exit(1)
  }
}

main()
