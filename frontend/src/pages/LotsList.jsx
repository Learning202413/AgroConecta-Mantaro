import { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/ui/Pagination';
import CustomSelect from '../components/ui/CustomSelect';
import { useOutletContext } from 'react-router-dom';
import { Sprout, PlusCircle, MapPin, Phone, RefreshCw, Search, Filter, Truck } from 'lucide-react';

export default function LotsList() {
  const context = useOutletContext();
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state (Shneiderman Mantra: Zoom and Filter)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');

  // Pagination state (Nielsen NN/g & ISO 9241-110 User Control)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    loadLots();
    const handleReload = () => loadLots();
    window.addEventListener('harvest-lot-created', handleReload);
    return () => window.removeEventListener('harvest-lot-created', handleReload);
  }, []);

  const loadLots = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllLots();
      setLots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered lots
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const matchSearch =
        lot.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.townName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lot.cropType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCrop = selectedCrop === 'ALL' || lot.cropType === selectedCrop;
      return matchSearch && matchCrop;
    });
  }, [lots, searchTerm, selectedCrop]);

  // Reset to page 1 if filter reduces count below current page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCrop, pageSize]);

  // Sliced lots for current page
  const paginatedLots = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLots.slice(startIndex, startIndex + pageSize);
  }, [filteredLots, currentPage, pageSize]);

  // Distinct crops for filter dropdown
  const cropOptions = useMemo(() => {
    const set = new Set(lots.map((l) => l.cropType));
    return Array.from(set);
  }, [lots]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sprout size={24} color="#15803d" />
            <span>Inventario de Cosechas en el Valle</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Lotes registrados para consolidación y transporte hacia el Mercado Mayorista de Huancayo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={loadLots}
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
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>Actualizar</span>
          </button>

          {user?.role === 'Carrier' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.82rem'
              }}
            >
              <Truck size={15} />
              <span>Cargas Disponibles para Flete</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => context?.onOpenCreateModal?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(21, 128, 61, 0.2)'
              }}
            >
              <PlusCircle size={16} />
              <span>Registrar Cosecha</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar (Shneiderman Mantra: Zoom and Filter) */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '18px',
          backgroundColor: '#ffffff',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por productor, distrito o cultivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ width: '220px', flexShrink: 0 }}>
          <CustomSelect
            value={selectedCrop}
            onChange={(val) => setSelectedCrop(val)}
            options={[
              { value: 'ALL', label: 'Todos los cultivos' },
              ...cropOptions.map((crop) => ({ value: crop, label: crop, icon: Sprout }))
            ]}
            icon={Filter}
            ariaLabel="Filtrar por cultivo"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #15803d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
          <div>Cargando inventario de cosechas...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fca5a5' }}>
          Error al cargar los datos: {error}
        </div>
      ) : filteredLots.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Sprout size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>
            No se encontraron cosechas
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0' }}>
            {searchTerm || selectedCrop !== 'ALL'
              ? 'Intente cambiar los filtros o el término de búsqueda.'
              : 'Haga clic en "+ Registrar Cosecha" para agregar el primer lote.'}
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto', borderRadius: '12px 12px 0 0' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <tr>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>ID</th>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>Productor</th>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>Producto</th>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>Peso (kg)</th>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>Precio Sugerido</th>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>Ubicación</th>
                  <th scope="col" style={{ padding: '12px 18px', fontWeight: '700' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLots.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: '600' }}>#{l.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{l.producerName}</span>
                        {user?.role === 'Producer' && user.fullName && l.producerName.toLowerCase().includes(user.fullName.toLowerCase()) && (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            Mi Lote
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone size={11} />
                        <span>{l.contactPhone}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: '600' }}>{l.cropType}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0f172a' }}>{l.weightKg.toLocaleString()} kg</td>
                    <td style={{ padding: '14px 18px', color: '#15803d', fontWeight: '700' }}>S/ {l.estimatedPricePerKg.toFixed(2)}</td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#15803d" />
                        <strong>{l.townName}</strong>
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reusable Atomic Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLots.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
}
