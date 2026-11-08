import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CreateHarvestLotModal from '../components/CreateHarvestLotModal';
import { useAuth } from '../context/AuthContext';
import { Sprout, Truck, Building2, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MainLayout() {
  const { user, loginAsDemo } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();

  const demoRoles = [
    {
      id: 1,
      fullName: 'Eusebio Poma',
      email: 'productor@agroconecta.pe',
      role: 'Producer',
      label: 'Productor',
      icon: Sprout,
      townName: 'Chupaca'
    },
    {
      id: 2,
      fullName: 'Carlos Quispe',
      email: 'transportista@agroconecta.pe',
      role: 'Carrier',
      label: 'Transportista',
      icon: Truck,
      townName: 'W2A-841'
    },
    {
      id: 3,
      fullName: 'Administrador Mayorista',
      email: 'admin@agroconecta.pe',
      role: 'Admin',
      label: 'Admin Mayorista',
      icon: Building2,
      townName: 'Huancayo'
    }
  ];

  // Dynamic Breadcrumb according to current location path (Nielsen H4 / Shneiderman Rule 1)
  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/routes':
        return { section: 'Operaciones', title: 'Ruteo y Fletes Compartidos' };
      case '/lots':
        return { section: 'Inventario', title: 'Lotes de Cosecha' };
      case '/prices':
        return { section: 'Comercialización', title: 'Precios Mayoristas SISAP' };
      case '/create-lot':
        return { section: 'Inventario', title: 'Registro de Oferta' };
      default:
        return { section: 'Plataforma', title: 'Panel de Control' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <Sidebar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          backgroundColor: '#ffffff',
          height: '64px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0
        }}>
          {/* Institutional Breadcrumb Navigation (Norman / Nielsen H4) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#15803d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                UPLA 2026-II
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                Track 2: Integración de Sistemas
              </span>
            </div>

            <ChevronRight size={14} color="#94a3b8" />

            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {breadcrumb.section}
            </span>

            <ChevronRight size={14} color="#cbd5e1" />

            <span style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>
              {breadcrumb.title}
            </span>
          </div>

          {/* Quick Role Switcher for the Jury (Nielsen H7 / Shneiderman Rule 2) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.04em' }}>
              MODO EVALUADOR:
            </span>
            {demoRoles.map(r => {
              const IconComp = r.icon;
              const isSelected = user && user.role === r.role;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => loginAsDemo(r)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    border: isSelected ? '1px solid #15803d' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                    color: isSelected ? '#15803d' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={13} />
                  <span>{r.label}</span>
                  {isSelected && <CheckCircle2 size={12} />}
                </button>
              );
            })}

            {!user && (
              <Link
                to="/login"
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textDecoration: 'none'
                }}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </header>

        <main style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          <Outlet context={{ onOpenCreateModal: () => setIsCreateModalOpen(true) }} />
        </main>
      </div>

      {/* Global Create Harvest Lot Modal */}
      <CreateHarvestLotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          window.dispatchEvent(new CustomEvent('harvest-lot-created'));
        }}
      />
    </div>
  );
}
