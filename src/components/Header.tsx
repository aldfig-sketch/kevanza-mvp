import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (router.pathname.startsWith('/auth')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">KV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">KEVANZA</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex gap-8">
              <Link
                href="/licitaciones"
                className={`text-sm font-medium transition-colors duration-200 ${
                  router.pathname.startsWith('/licitaciones')
                    ? 'text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Licitaciones
              </Link>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors duration-200 ${
                  router.pathname === '/dashboard'
                    ? 'text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">Municipio</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="hidden md:flex gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200/20 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {user ? (
              <>
                <Link
                  href="/licitaciones"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Licitaciones
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
