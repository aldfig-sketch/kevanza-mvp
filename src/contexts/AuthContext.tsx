import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/lib/auth'

export interface UserProfile {
  id: string
  email: string
  nombre?: string
  full_name?: string
  municipio_id?: string
  rol?: string
  role_id?: number
  activo?: boolean
  debe_cambiar_contrasena?: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  organismoNombre: string | null
  municipioNombre: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  organismoNombre: null,
  municipioNombre: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [organismoNombre, setOrganismoNombre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null
      setUser(nextUser)

      if (nextUser) {
        await loadProfile(nextUser.id)
      } else {
        setProfile(null)
        setOrganismoNombre(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const data = await getUserProfile(userId)
      if (!data) return
      const { data: firstLogin } = await supabase
        .from('usuarios_primer_login')
        .select('debe_cambiar_contrasena')
        .eq('usuario_id', userId)
        .maybeSingle()
      setProfile({ ...(data as UserProfile), debe_cambiar_contrasena: firstLogin?.debe_cambiar_contrasena === true })

      // Resolver nombre del organismo/unidad compradora para mostrarlo en la UI.
      if (data.municipio_id) {
        const { data: muni } = await supabase
          .from('municipios')
          .select('nombre')
          .eq('id', data.municipio_id)
          .single()
        if (muni?.nombre) setOrganismoNombre(muni.nombre)
      }
    } catch (err) {
      console.error('Error cargando perfil:', err)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setOrganismoNombre(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        organismoNombre,
        municipioNombre: organismoNombre,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
