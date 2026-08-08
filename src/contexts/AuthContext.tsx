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
  activo?: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  municipioNombre: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  municipioNombre: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [municipioNombre, setMunicipioNombre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null
      setUser(nextUser)
      setLoading(false)

      // Cargar perfil (municipio, nombre, rol) en segundo plano
      if (nextUser) {
        loadProfile(nextUser.id)
      } else {
        setProfile(null)
        setMunicipioNombre(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const data = await getUserProfile(userId)
      if (!data) return
      setProfile(data as UserProfile)

      // Resolver nombre del municipio para mostrarlo en la UI
      if (data.municipio_id) {
        const { data: muni } = await supabase
          .from('municipios')
          .select('nombre')
          .eq('id', data.municipio_id)
          .single()
        if (muni?.nombre) setMunicipioNombre(muni.nombre)
      }
    } catch (err) {
      console.error('Error cargando perfil:', err)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setMunicipioNombre(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, municipioNombre, loading, signOut }}>
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
