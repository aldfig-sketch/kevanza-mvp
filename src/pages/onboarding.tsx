import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/router'
import { Header } from '@/components/Header'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { useAuth } from '@/contexts/AuthContext'
import { cambiarContrasena } from '@/lib/usuariosService'

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  useEffect(() => { if (!loading && !user) router.replace('/auth/login'); if (!loading && user && profile && !profile.debe_cambiar_contrasena && !completed) router.replace('/dashboard') }, [completed, loading, profile, router, user])
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); if (password !== confirmation) { setError('Las contraseñas no coinciden.'); return } setSaving(true); try { await cambiarContrasena(password); setCompleted(true); setTimeout(() => router.replace('/dashboard'), 1200) } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.') } finally { setSaving(false) } }
  if (loading || !user) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">Cargando...</main></>
  if (completed) return <><Header /><main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><div className="text-center"><CheckCircle2 className="w-14 h-14 mx-auto text-teal-600" /><h1 className="text-2xl font-bold text-gray-900 mt-4">Acceso actualizado</h1><p className="text-gray-600 mt-2">Ya puedes continuar al panel de KEVANZA.</p></div></main></>
  return <><Header /><main className="min-h-screen bg-gray-50 py-12 px-4"><div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm"><div className="flex items-center gap-3 mb-6"><span className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></span><div><p className="text-sm font-semibold text-teal-700">PRIMER ACCESO</p><h1 className="text-2xl font-bold text-gray-900">Activa tu acceso</h1></div></div><p className="text-gray-600 mb-6">Por seguridad, reemplaza la contraseña temporal antes de continuar. Usa al menos 8 caracteres, una mayúscula, un número y un símbolo.</p>{error && <Alert type="error" className="mb-4">{error}</Alert>}<form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-gray-700">Nueva contraseña<div className="relative mt-1"><LockKeyhole className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2" autoComplete="new-password" /></div></label><label className="block text-sm font-semibold text-gray-700">Repite la contraseña<input required minLength={8} type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" autoComplete="new-password" /></label><Button type="submit" isLoading={saving} className="w-full justify-center">Guardar contraseña</Button></form></div></main></>
}
