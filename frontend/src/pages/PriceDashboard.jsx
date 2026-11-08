import { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/ui/Pagination';
import { TrendingUp, BarChart3, RefreshCw, Building2, Calendar, BadgeCheck, ShieldAlert, Sprout, Truck } from 'lucide-react';

export default function PriceDashboard() {
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state (Nielsen NN/g & ISO 9241-110 User Control)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllPrices();
      setPrices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const paginatedPrices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return prices.slice(startIndex, startIndex + pageSize);
  }, [prices, currentPage, pageSize]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={24} color="#15803d" />
            <span>Precios Mayoristas · SISAP MIDAGRI</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Cotizaciones oficiales del Gran Mercado Mayorista de Huancayo para transparentar el mercado y evitar intermediación abusiva.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPrices}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: loading ? '#94a3b8' : '#334155',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Role-Specific Contextual Guidance (Jakob Nielsen H1 / H2) */}
      {user?.role === 'Producer' && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem'
        }}>
          <Sprout size={20} color="#15803d" style={{ flexShrink: 0 }} />
          <div>
            <strong>Precios de Referencia Oficial (SISAP):</strong> Utilizá estos valores promedio del Mercado Mayorista de Huancayo como base mínima para negociar la venta directa de tus cosechas y evitar pérdidas por intermediarios.
          </div>
        </div>
      )}

      {user?.role === 'Carrier' && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem'
        }}>
          <Truck size={20} color="#1e40af" style={{ flexShrink: 0 }} />
          <div>
            <strong>Referencia de Carga para Fletes:</strong> Precios oficiales de mercado para la estimación del valor de la mercadería transportada y liquidación de fletes compartidos.
          </div>
        </div>
      )}

      {user?.role === 'Admin' && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          color: '#5b21b6',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem'
        }}>
          <Building2 size={20} color="#6b21a8" style={{ flexShrink: 0 }} />
          <div>
            <strong>Supervisión de Precios Mayoristas:</strong> Cotizaciones validadas del Gran Mercado Mayorista de Huancayo (Puquio) en enlace con el Sistema de Información de Abastecimiento y Precios (SISAP - MIDAGRI).
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px', color: '#15803d' }} />
          <div>Cargando cotizaciones del mercado...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} />
          <div>Error al cargar precios: {error}</div>
        </div>
      ) : (
        <>
          {/* Quick cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {prices.map(p => (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{p.cropType}</span>
                    <BadgeCheck size={16} color="#15803d" />
                  </div>
                  <div style={{ fontSize: '1.7rem', fontWeight: '900', color: '#15803d', marginTop: '8px', letterSpacing: '-0.02em' }}>
                    S/ {p.averagePrice.toFixed(2)}
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>/ kg</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                  <span>Rango oficial:</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>S/ {p.minPrice.toFixed(2)} - S/ {p.maxPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px 12px 0 0' }}>
              <BarChart3 size={18} color="#15803d" />
              <span>Histórico de Cotizaciones Registradas (MIDAGRI)</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <tr>
                    <th scope="col" style={{ padding: '14px 20px' }}>Cultivo</th>
                    <th scope="col" style={{ padding: '14px 20px' }}>Mercado de Referencia</th>
                    <th scope="col" style={{ padding: '14px 20px' }}>Mínimo</th>
                    <th scope="col" style={{ padding: '14px 20px' }}>Máximo</th>
                    <th scope="col" style={{ padding: '14px 20px' }}>Promedio</th>
                    <th scope="col" style={{ padding: '14px 20px' }}>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPrices.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>{p.cropType}</td>
                      <td style={{ padding: '14px 20px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} color="#64748b" />
                        <span>{p.marketName}</span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>S/ {p.minPrice.toFixed(2)}</td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>S/ {p.maxPrice.toFixed(2)}</td>
                      <td style={{ padding: '14px 20px', color: '#15803d', fontWeight: '800' }}>S/ {p.averagePrice.toFixed(2)}</td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={14} color="#94a3b8" />
                          <span>{new Date(p.recordDate).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reusable Atomic Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalItems={prices.length}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
              pageSizeOptions={[5, 10, 20]}
            />
          </div>
        </>
      )}
    </div>
  );
}
