'use client'

import { useState } from 'react'
import Header from '../components/Header'
import ProfessionalBadge from '../components/ProfessionalBadge'

interface Professional {
    id: string
    nombre: string
    matricula: string
    estado: 'HABILITADO' | 'RECOMENDADOR' | 'INACTIVO'
    telefono: string | null
}

interface Recipe {
    id: string
    codigoActivacion: string
    cultivo: string
    insumos: string
    dosis: string
}

export default function GeneratePage() {
    const [step, setStep] = useState<'verify' | 'form' | 'success'>('verify')
    const [matricula, setMatricula] = useState('')
    const [professional, setProfessional] = useState<Professional | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        cultivo: '',
        insumos: '',
        dosis: '',
    })

    const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null)

    const handleVerifyProfessional = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`/api/professionals?matricula=${matricula}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al verificar profesional')
                return
            }

            if (!data.isHabilitado) {
                setError('Solo profesionales habilitados o activos pueden generar recetas')
                return
            }

            setProfessional(data)
            setStep('form')
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRecipe = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profesionalId: professional?.id,
                    ...formData,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al crear receta')
                return
            }

            setCreatedRecipe(data)
            setStep('success')
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setStep('verify')
        setMatricula('')
        setProfessional(null)
        setFormData({ cultivo: '', insumos: '', dosis: '' })
        setCreatedRecipe(null)
        setError('')
    }

    return (
        <div className="min-h-screen bg-gradient-hero">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                        Generar Receta
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Crea una nueva receta agronómica certificada
                    </p>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`flex items-center ${step === 'verify' ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'verify' ? 'bg-green-600 text-white' : 'bg-gray-300'
                                }`}>
                                1
                            </div>
                            <span className="ml-2 font-medium">Verificación</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                        <div className={`flex items-center ${step === 'form' ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'form' ? 'bg-green-600 text-white' : 'bg-gray-300'
                                }`}>
                                2
                            </div>
                            <span className="ml-2 font-medium">Datos</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
                        <div className={`flex items-center ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
                                }`}>
                                3
                            </div>
                            <span className="ml-2 font-medium">Código</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Verify Professional */}
                    {step === 'verify' && (
                        <div className="card animate-fade-in">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Verificación Profesional
                            </h2>
                            <form onSubmit={handleVerifyProfessional}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de Matrícula
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ingrese su matrícula"
                                        value={matricula}
                                        onChange={(e) => setMatricula(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Verificando...' : 'Verificar Matrícula'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Recipe Form */}
                    {step === 'form' && professional && (
                        <div className="card animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        Datos de la Receta
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Profesional: {professional.nombre}
                                    </p>
                                </div>
                                <ProfessionalBadge status={professional.estado} />
                            </div>

                            <form onSubmit={handleCreateRecipe}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cultivo
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Ej: Soja, Maíz, Trigo"
                                            value={formData.cultivo}
                                            onChange={(e) => setFormData({ ...formData, cultivo: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Insumos
                                        </label>
                                        <textarea
                                            className="input"
                                            rows={3}
                                            placeholder="Detalle los insumos agroquímicos"
                                            value={formData.insumos}
                                            onChange={(e) => setFormData({ ...formData, insumos: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dosis
                                        </label>
                                        <textarea
                                            className="input"
                                            rows={2}
                                            placeholder="Especifique las dosis recomendadas"
                                            value={formData.dosis}
                                            onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep('verify')}
                                        className="btn btn-secondary flex-1"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={loading}
                                    >
                                        {loading ? 'Generando...' : 'Generar Receta'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && createdRecipe && (
                        <div className="card animate-fade-in text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                ¡Receta Generada!
                            </h2>
                            <p className="text-gray-600 mb-8">
                                La receta ha sido creada exitosamente
                            </p>

                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <p className="text-sm font-medium text-gray-600 mb-2">
                                    Código de Activación
                                </p>
                                <p className="text-4xl font-bold text-green-600 tracking-wider mb-4">
                                    {createdRecipe.codigoActivacion}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Guarde este código para vincular la receta física con la digital
                                </p>
                            </div>

                            <div className="text-left bg-white border border-gray-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Detalles de la Receta</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Cultivo:</span>
                                        <p className="text-gray-900">{createdRecipe.cultivo}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Insumos:</span>
                                        <p className="text-gray-900">{createdRecipe.insumos}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Dosis:</span>
                                        <p className="text-gray-900">{createdRecipe.dosis}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleReset}
                                className="btn btn-primary w-full"
                            >
                                Generar Nueva Receta
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
