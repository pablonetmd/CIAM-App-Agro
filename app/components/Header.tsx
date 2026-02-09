'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
                            C
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">CIAM</h1>
                            <p className="text-xs text-gray-600">Recetas Agronómicas</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/generate"
                            className={`text-sm font-medium transition-colors hover:text-green-600 ${pathname === '/generate' ? 'text-green-600' : 'text-gray-700'
                                }`}
                        >
                            Generar Receta
                        </Link>
                        <Link
                            href="/validate"
                            className={`text-sm font-medium transition-colors hover:text-green-600 ${pathname === '/validate' ? 'text-green-600' : 'text-gray-700'
                                }`}
                        >
                            Validar Receta
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}
