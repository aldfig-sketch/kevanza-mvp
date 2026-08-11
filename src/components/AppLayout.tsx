import { createContext, ReactNode, useContext, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface LayoutContextValue {
  openSidebar: () => void
  closeSidebar: () => void
}

const LayoutContext = createContext<LayoutContextValue>({ openSidebar: () => {}, closeSidebar: () => {} })

export function useLayout() {
  return useContext(LayoutContext)
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <LayoutContext.Provider value={{ openSidebar: () => setSidebarOpen(true), closeSidebar: () => setSidebarOpen(false) }}>
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  </LayoutContext.Provider>
}
