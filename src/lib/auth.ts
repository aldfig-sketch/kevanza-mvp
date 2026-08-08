// IMPORTANTE: reutilizar el ÚNICO cliente de Supabase de la app.
// Antes existían dos clientes con distinto storage (este y el de ./supabase),
// por lo que la sesión guardada por signIn no era vista por AuthContext
// → login exitoso pero rebote a la pantalla inicial. Ahora es uno solo.
export { supabase } from './supabase'
import { supabase } from './supabase'

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user || null
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
}
