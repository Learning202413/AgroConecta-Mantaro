import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { apiService } from '../services/apiService';
import { Truck, Sprout, Plus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminManagementModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'crops'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({
    driverName: '',
    licensePlate: '',
    maxCapacityKg: '4000',
    contactPhone: '964112233'
  });

  // Crops state
  const [categories, setCategories] = useState([]);
  const [cropForm, setCropForm] = useState({
    name: '',
    category: 'Tubérculos y Raíces',
    scientificName: '',
    typicalUnit: 'Saco 50kg',
    referencePriceKg: '1.50'
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vehs, cats] = await Promise.all([
        apiService.getAllVehicles(),
        apiService.getCropCategories()
      ]);
      setVehicles(vehs || []);
      setCategories(cats?.filter(c => c !== 'Todos') || [
        'Tubérculos y Raíces',
        'Hortalizas',
        'Leguminosas',
        'Granos y Cereales',
        'Frutales y Hierbas'
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!vehicleForm.driverName.trim() || !vehicleForm.licensePlate.trim()) {
      setError('El nombre del conductor y la placa son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      await apiService.createVehicle({
        driverName: vehicleForm.driverName.trim(),
        licensePlate: vehicleForm.licensePlate.trim().toUpperCase(),
        maxCapacityKg: parseFloat(vehicleForm.maxCapacityKg)
      });
      setSuccessMessage(`Camión ${vehicleForm.licensePlate.toUpperCase()} registrado exitosamente en la flota.`);
      setVehicleForm({
        driverName: '',
        licensePlate: '',
        maxCapacityKg: '4000',
        contactPhone: '964112233'
      });
      const updated = await apiService.getAllVehicles();
      setVehicles(updated || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!cropForm.name.trim()) {
      setError('El nombre del cultivo o variedad es obligatorio.');
      return;
    }

    try {
      setLoading(true);
      await apiService.createCrop({
        name: cropForm.name.trim(),
        category: cropForm.category,
        scientificName: cropForm.scientificName.trim() || 'Variedad Regional',
        typicalUnit: cropForm.typicalUnit.trim() || 'Saco 50kg',
        referencePriceKg: parseFloat(cropForm.referencePriceKg) || 1.50
      });
      setSuccessMessage(`Variedad "${cropForm.name}" añadida exitosamente al catálogo oficial.`);
      setCropForm({
        name: '',
        category: 'Tubérculos y Raíces',
        scientificName: '',
        typicalUnit: 'Saco 50kg',
        referencePriceKg: '1.50'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión Maestra del Administrador Mayorista"
      subtitle="Administración de flota autorizada de camiones y mantenimiento del catálogo regional de cultivos."
      maxWidth="720px"
    >
      {/* Alert Banners */}
      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div style={{ padding: '10px 14px', backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs (Nielsen H4 / Norman Signifiers) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '18px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('vehicles'); setError(null); setSuccessMessage(null); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '700',
            border: activeTab === 'vehicles' ? '1.5px solid #1e40af' : '1px solid #cbd5e1',
            backgroundColor: activeTab === 'vehicles' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'vehicles' ? '#1e40af' : '#475569',
            cursor: 'pointer'
          }}
        >
          <Truck size={16} color={activeTab === 'vehicles' ? '#1e40af' : '#64748b'} />
          <span>Flota de Camiones ({vehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('crops'); setError(null); setSuccessMessage(null); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '700',
            border: activeTab === 'crops' ? '1.5px solid #15803d' : '1px solid #cbd5e1',
            backgroundColor: activeTab === 'crops' ? '#dcfce7' : '#ffffff',
            color: activeTab === 'crops' ? '#15803d' : '#475569',
            cursor: 'pointer'
          }}
        >
          <Sprout size={16} color={activeTab === 'crops' ? '#15803d' : '#64748b'} />
          <span>Catálogo de Cultivos</span>
        </button>
      </div>

      {/* TAB 1: VEHICLES MANAGEMENT */}
      {activeTab === 'vehicles' && (
        <div>
          <form onSubmit={handleCreateVehicle} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} color="#1e40af" />
              <span>Registrar Nuevo Camión Transportista</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Nombre del Chofer / Conductor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Huamán"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Placa de Rodaje
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. W3B-742"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Capacidad de Carga (kg)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={vehicleForm.maxCapacityKg}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, maxCapacityKg: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1e40af',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Guardando...' : '+ Dar de Alta Camión'}
              </button>
            </div>
          </form>

          {/* Current Vehicles List */}
          <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Unidades Registradas en el Valle del Mantaro:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {vehicles.map(v => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.84rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{v.licensePlate} · {v.driverName}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Capacidad: <strong>{v.maxCapacityKg.toLocaleString()} kg</strong></div>
                </div>
                <div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    backgroundColor: v.isAvailable ? '#dcfce7' : '#fef3c7',
                    color: v.isAvailable ? '#15803d' : '#b45309',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {v.isAvailable ? 'Disponible' : 'En Ruta'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CROPS CATALOG MANAGEMENT */}
      {activeTab === 'crops' && (
        <div>
          <form onSubmit={handleCreateCrop} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} color="#15803d" />
              <span>Registrar Nueva Variedad en el Catálogo Oficial</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Nombre del Producto / Variedad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Papa Huagalina Norteña"
                  value={cropForm.name}
                  onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Familia Agrícola
                </label>
                <select
                  value={cropForm.category}
                  onChange={(e) => setCropForm({ ...cropForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Nombre Científico (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Solanum tuberosum"
                  value={cropForm.scientificName}
                  onChange={(e) => setCropForm({ ...cropForm, scientificName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Unidad Típica de Estiba
                </label>
                <input
                  type="text"
                  placeholder="Ej. Saco 50kg / Jaba 20kg"
                  value={cropForm.typicalUnit}
                  onChange={(e) => setCropForm({ ...cropForm, typicalUnit: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Precio Base Sugerido (S/ kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={cropForm.referencePriceKg}
                  onChange={(e) => setCropForm({ ...cropForm, referencePriceKg: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Guardando...' : '+ Agregar al Catálogo API'}
              </button>
            </div>
          </form>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
            * Al agregar una variedad, estará disponible de forma inmediata en el autocompletado y búsqueda debounced del formulario de cosecha de los agricultores.
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.84rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cerrar Panel
        </button>
      </div>
    </Modal>
  );
}