'use client'

import { useState } from 'react'
import Header from '../components/Header'
import RecipeCard from '../components/RecipeCard'

interface ValidationResult {
    valid: boolean
    recipe?: {
        id: string
        cultivo: string
        insumos: string
        dosis: string
        codigoActivacion: string
        pagado: boolean
        utilizada: boolean
        createdAt: string
        profesional: {
            nombre: string
            matricula: string
            estado: string
            telefono: string | null
        }
    }
    error?: string
}

export default function ValidatePage() {
    const [codigo, setCodigo] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ValidationResult | null>(null)

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/recipes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigoActivacion: codigo }),
            })

            const data = await res.json()

            if (!res.ok) {
                setResult({ valid: false, error: data.error })
            } else {
                setResult(data)
            }
        } catch (err) {
            setResult({ valid: false, error: 'Error de conexión' })
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setCodigo('')
        setResult(null)
    }

    return (
        <div className="min-h-screen bg-gradient-hero">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                        Validar Receta
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Verifica la autenticidad de una receta agronómica
                    </p>

                    {/* Validation Form */}
                    <div className="card animate-fade-in mb-8">
                        <form onSubmit={handleValidate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Código de Activación
                                </label>
                                <input
                                    type="text"
                                    className="input text-center text-2xl font-bold tracking-wider uppercase"
                                    placeholder="XXXXXXXX"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                    maxLength={8}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Ingrese el código de 8 caracteres de la receta
                                </p>
                            </div>

                            <div className="flex gap-4">
                                {result && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Limpiar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={loading || codigo.length !== 8}
                                >
                                    {loading ? 'Validando...' : 'Validar Receta'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Validation Result */}
                    {result && (
                        <div className="animate-fade-in">
                            {result.valid && result.recipe ? (
                                <div>
                                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-green-900 mb-2">
                                            Receta Válida
                                        </h2>
                                        <p className="text-green-700">
                                            Esta receta es auténtica y está certificada
                                        </p>
                                    </div>

                                    <RecipeCard recipe={result.recipe} />
                                </div>
                            ) : (
                                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-red-900 mb-2">
                                        Receta Inválida
                                    </h2>
                                    <p className="text-red-700">
                                        {result.error || 'El código ingresado no corresponde a ninguna receta'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Section */}
                    {!result && (
                        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                ¿Cómo validar una receta?
                            </h3>
                            <ol className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                        1
                                    </span>
                                    <span>Solicite al cliente el código de activación de la receta</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                        2
                                    </span>
                                    <span>Ingrese el código de 8 caracteres en el campo superior</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                        3
                                    </span>
                                    <span>Verifique que la receta sea válida y corresponda al profesional habilitado</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                                        4
                                    </span>
                                    <span>Proceda con la venta de los insumos según la receta validada</span>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
