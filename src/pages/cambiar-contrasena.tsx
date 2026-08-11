import { FormEvent, useState } from 'react'
import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/router'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { cambiarContrasena } from '@/lib/usuariosService'

export default function CambiarContrasenaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); if (password !== confirmation) { setError('Las contraseñas no coinciden.'); return } setSaving(true); try { await cambiarContrasena(password); setSaved(true) } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.') } finally { setSaving(false) } }
  if (loading) return <><Header /><main className="min-h-screen bg-slate-50 p-6 text-slate-500">Cargando...</main></>
  if (!user) { void router.replace('/auth/login'); return null }
  return <><Header /><main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-sm font-semibold uppercase tracking-wide text-teal-700">SEGURIDAD</p><h1 className="mt-1 text-2xl font-bold text-slate-950">Cambiar contraseña</h1></div></div>{saved ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-teal-600" /><p className="mt-4 font-semibold text-slate-900">Contraseña actualizada</p><button onClick={() => router.push('/perfil')} className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-900">Volver a mi perfil</button></div> : <><p className="mb-6 text-sm text-slate-600">Usa al menos 8 caracteres, una mayúscula, un número y un símbolo.</p>{error && <Alert type="error" className="mb-4">{error}</Alert>}<form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-slate-700">Nueva contraseña<div className="relative mt-1"><LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" autoComplete="new-password" /></div></label><label className="block text-sm font-semibold text-slate-700">Repite la contraseña<input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100" autoComplete="new-password" /></label><Button type="submit" isLoading={saving} className="w-full justify-center">Guardar contraseña</Button></form></>}</div></main></>
}
