import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ui/ConfirmModal';
import AdminManagementModal from './AdminManagementModal';
import {
  Sprout,
  Truck,
  PlusCircle,
  BarChart3,
  Building2,
  LogOut,
  MapPin,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ onOpenCreateModal }) {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const navStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.88rem',
    color: isActive ? '#ffffff' : '#334155',
    backgroundColor: isActive ? '#15803d' : 'transparent',
    transition: 'all 0.15s ease-in-out'
  });

  const roleConfigs = {
    Producer: { label: 'Productor Agrícola', color: '#15803d', bg: '#dcfce7', icon: Sprout },
    Carrier: { label: 'Transportista Local', color: '#1e40af', bg: '#dbeafe', icon: Truck },
    Admin: { label: 'Admin Mayorista', color: '#6b21a8', bg: '#f3e8ff', icon: Building2 }
  };

  const currentConfig = (user && roleConfigs[user.role]) || { label: 'Evaluador', color: '#475569', bg: '#f1f5f9', icon: UserCheck };
  const RoleIcon = currentConfig.icon;

  const getNavLinks = () => {
    if (user?.role === 'Carrier') {
      return [
        { to: '/routes', label: 'Fletes y Ruteo', icon: Truck },
        { to: '/lots', label: 'Cargas Disponibles', icon: Sprout }
      ];
    }
    if (user?.role === 'Producer') {
      return [
        { to: '/lots', label: 'Mis Cosechas y Ofertas', icon: Sprout },
        { to: '/routes', label: 'Rutas de Flete', icon: Truck }
      ];
    }
    return [
      { to: '/routes', label: 'Fletes y Ruteo', icon: Truck },
      { to: '/lots', label: 'Inventario de Cosechas', icon: Sprout }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      height: '100vh',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      {/* Brand Header */}
      <div style={{ marginBottom: '22px', paddingLeft: '6px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#15803d', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
            <Sprout size={18} />
          </div>
          <span>AgroConecta</span>
        </h2>
        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', display: 'block', marginTop: '2px' }}>
          Valle del Mantaro · Track 2
        </span>
      </div>

      {/* User Profile Card */}
      {user && (
        <div style={{
          padding: '12px 14px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: currentConfig.bg,
              color: currentConfig.color,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <RoleIcon size={12} />
              <span>{currentConfig.label}</span>
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={11} />
              <span>{user.townName || 'Huancayo'}</span>
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
            {user.fullName}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
            {user.email}
          </div>
        </div>
      )}

      {/* Primary Action Button (Norman Affordance tailored by Role) */}
      {user?.role === 'Carrier' ? (
        <NavLink
          to="/routes"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: '#1e40af',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.85rem',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(30, 64, 175, 0.25)',
            boxSizing: 'border-box'
          }}
        >
          <Truck size={16} />
          <span>Planificar Flete</span>
        </NavLink>
      ) : user?.role === 'Admin' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: '#6b21a8',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(107, 33, 168, 0.2)'
            }}
          >
            <Building2 size={16} />
            <span>Gestión de Maestros</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={14} />
            <span>+ Registrar Cosecha</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenCreateModal}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: '#15803d',
            color: '#ffffff',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(21, 128, 61, 0.2)'
          }}
        >
          <PlusCircle size={16} />
          <span>Registrar Cosecha</span>
        </button>
      )}

      {/* Navigation tailored by Role */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navLinks.map((item) => {
          const ItemIcon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} style={navStyle}>
              <ItemIcon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom info & Logout */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={12} />
            <span>Destino Mayorista</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', marginTop: '3px' }}>
            Mercado Huancayo (Puquio)
          </div>
        </div>

        {user && (
          <>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease'
              }}
            >
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>

            {/* Anti-Slip Logout Confirmation Modal (Norman / Shneiderman Rule 5) */}
            <ConfirmModal
              isOpen={isLogoutModalOpen}
              title="Confirmar Cierre de Sesión"
              description="¿Está seguro de que desea salir de la plataforma AgroConecta Mantaro? Deberá ingresar sus credenciales nuevamente."
              confirmText="Cerrar Sesión"
              cancelText="Permanecer"
              danger={true}
              onConfirm={() => {
                setIsLogoutModalOpen(false);
                logout();
              }}
              onCancel={() => setIsLogoutModalOpen(false)}
            />

            {/* Master Admin Fleet & Catalog Management Modal (Nielsen H7 / Norman Signifiers) */}
            <AdminManagementModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
            />
          </>
        )}
      </div>
    </aside>
  );
}
