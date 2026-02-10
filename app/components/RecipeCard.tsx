import ProfessionalBadge from './ProfessionalBadge'

interface RecipeCardProps {
    recipe: {
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
        }
    }
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className="card animate-fade-in">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{recipe.cultivo}</h3>
                    <p className="text-sm text-gray-600">Código: {recipe.codigoActivacion}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <ProfessionalBadge status={recipe.profesional.estado} />
                    {recipe.utilizada && (
                        <span className="badge" style={{ background: '#e5e7eb', color: '#6b7280' }}>
                            Utilizada
                        </span>
                    )}
                    {recipe.pagado && (
                        <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>
                            Pagada
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Insumos
                    </p>
                    <p className="text-sm text-gray-800">{recipe.insumos}</p>
                </div>

                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Dosis
                    </p>
                    <p className="text-sm text-gray-800">{recipe.dosis}</p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <div>
                            <span className="font-medium">Profesional:</span> {recipe.profesional.nombre}
                        </div>
                        <div>
                            <span className="font-medium">Mat:</span> {recipe.profesional.matricula}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(recipe.createdAt)}</p>
                </div>
            </div>
        </div>
    )
}
