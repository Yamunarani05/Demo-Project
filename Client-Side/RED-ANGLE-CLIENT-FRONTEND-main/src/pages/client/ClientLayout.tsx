import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ClientSidebar from './components/ClientSidebar'
import ClientTopbar from './components/ClientTopbar'

export default function ClientLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-white font-sans text-slate-800">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            
            <ClientSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
            
            <div
                className="flex flex-col flex-1 w-full md:ml-[var(--sidebar-width)] transition-all duration-300"
            >
                <ClientTopbar toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                <main
                    className="flex-1 overflow-auto border-t border-slate-100 p-4 sm:p-6 md:p-8"
                    style={{ backgroundColor: '#f9f8ff' }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
