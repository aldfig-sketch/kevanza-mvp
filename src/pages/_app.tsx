import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'

function Workspace({ Component, pageProps }: Pick<AppProps, 'Component' | 'pageProps'>) {
  const router = useRouter()
  const publicPage = router.pathname === '/' || router.pathname.startsWith('/auth/') || router.pathname.startsWith('/firmar/')
  if (publicPage) return <Component {...pageProps} />
  return <AppLayout><Component {...pageProps} /></AppLayout>
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Workspace Component={Component} pageProps={pageProps} />
    </AuthProvider>
  )
}
