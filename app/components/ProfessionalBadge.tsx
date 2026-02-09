interface ProfessionalBadgeProps {
    status: 'HABILITADO' | 'RECOMENDADOR' | 'INACTIVO'
    showIcon?: boolean
}

export default function ProfessionalBadge({ status, showIcon = true }: ProfessionalBadgeProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'HABILITADO':
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
            case 'INACTIVO':
                return {
                    className: 'badge-inactivo',
                    label: 'Inactivo',
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
