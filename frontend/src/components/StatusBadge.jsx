import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const styles = {
    Available: {
      bg: '#dcfce7',
      color: '#15803d',
      label: 'Disponible',
      icon: CheckCircle2
    },
    Assigned: {
      bg: '#fef9c3',
      color: '#854d0e',
      label: 'Asignado a Flete',
      icon: Clock
    },
    InTransit: {
      bg: '#dbeafe',
      color: '#1e40af',
      label: 'En Tránsito',
      icon: Truck
    },
    Completed: {
      bg: '#f3e8ff',
      color: '#6b21a8',
      label: 'Completado',
      icon: PackageCheck
    },
    Delivered: {
      bg: '#f3e8ff',
      color: '#6b21a8',
      label: 'Entregado',
      icon: PackageCheck
    },
    Planned: {
      bg: '#e0e7ff',
      color: '#3730a3',
      label: 'Planificado',
      icon: Clock
    }
  };

  const current = styles[status] || {
    bg: '#f1f5f9',
    color: '#475569',
    label: status,
    icon: AlertCircle
  };

  const IconComponent = current.icon;

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.color,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
      }}
    >
      <IconComponent size={13} />
      <span>{current.label}</span>
    </span>
  );
}
