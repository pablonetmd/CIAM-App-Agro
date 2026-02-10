interface ProfessionalBadgeProps {
    status: string
    showIcon?: boolean
}

export default function ProfessionalBadge({ status, showIcon = true }: ProfessionalBadgeProps) {
    const getStatusConfig = () => {
        // Normalizar estado
        const normalizedStatus = status?.toUpperCase();

        switch (normalizedStatus) {
            case 'HABILITADO':
            case 'ACTIVO':
                return {
                    className: 'badge-habilitado',
                    label: 'Habilitado',
                    icon: '✓',
                }
            case 'RECOMENDADOR':
                return {
                    className: 'badge-recomendador',
                    label: 'Recomendador',
                    icon: 'ℹ',
                }
            case 'PENDIENTE':
                return {
                    className: 'badge-pendiente',
                    label: 'Pendiente',
                    icon: '○',
                }
            case 'INACTIVO':
            default:
                return {
                    className: 'badge-inactivo',
                    label: normalizedStatus || 'Inactivo',
                    icon: '✕',
                }
        }
    }

    const config = getStatusConfig()

    return (
        <span className={`badge ${config.className}`}>
            {showIcon && <span>{config.icon}</span>}
            {config.label}
        </span>
    )
}
