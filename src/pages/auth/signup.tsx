import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp } from '@/lib/auth'
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

const signupSchema = z
  .object({
    email: z.string().email('Email inválido'),
    fullName: z.string().min(2, 'Nombre muy corto'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    setError(null)

    try {
      await signUp(data.email, data.password, data.fullName)
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login?registered=true')
      }, 2000)
    } catch (err: any) {
      if (err?.message?.includes('User already registered')) {
        setError('Este email ya está registrado')
      } else {
        setError(err instanceof Error ? err.message : 'Error al registrarse')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 text-teal-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta creada!</h2>
          <p className="text-teal-200">Redirigiendo a login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-slate-900 font-bold text-lg">KV</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">KEVANZA</h1>
              <p className="text-xs text-teal-200">Gestión de compras públicas</p>
            </div>
          </div>
          <p className="text-teal-100">Crea tu cuenta para comenzar</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('fullName')}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.fullName
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                  }`}
                  placeholder="Juan Pérez"
                  disabled={loading}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1.5">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                  }`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.password
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all ${
                    errors.confirmPassword
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-teal-200 text-xs">
          © 2026 KEVANZA • Plataforma para organismos sujetos a Ley de Compras Públicas
        </p>
      </div>
    </div>
  )
}
