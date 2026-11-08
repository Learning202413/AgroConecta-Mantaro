import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const TOWNS = [
  { name: 'Chupaca', lat: -12.0625, lng: -75.2878 },
  { name: 'Sicaya', lat: -12.0306, lng: -75.2817 },
  { name: 'Orcotuna', lat: -11.9681, lng: -75.3342 },
  { name: 'Mito', lat: -11.9328, lng: -75.3392 },
  { name: 'Concepción', lat: -11.9189, lng: -75.3131 },
  { name: 'Jauja', lat: -11.7758, lng: -75.4967 }
];

const CROPS = [
  'Papa Canchán',
  'Papa Huayro',
  'Papa Amarilla',
  'Zanahoria',
  'Arveja Verde',
  'Maíz Choclo'
];

export default function CreateHarvestLot() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    producerName: '',
    contactPhone: '',
    cropType: 'Papa Canchán',
    weightKg: '',
    estimatedPricePerKg: '1.30',
    townName: 'Chupaca',
    latitude: -12.0625,
    longitude: -75.2878
  });

  const [loading, setLoading] = useState(false);
  const [suggestedPriceLoading, setSuggestedPriceLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestedPrice(formData.cropType);
  }, [formData.cropType]);

  const fetchSuggestedPrice = async (crop) => {
    try {
      setSuggestedPriceLoading(true);
      const res = await apiService.getSuggestedPrice(crop);
      if (res && res.suggestedPricePerKg) {
        setFormData(prev => ({ ...prev, estimatedPricePerKg: res.suggestedPricePerKg.toString() }));
      }
    } catch {
      // Keep existing default
    } finally {
      setSuggestedPriceLoading(false);
    }
  };

  const handleTownChange = (e) => {
    const townName = e.target.value;
    const selected = TOWNS.find(t => t.name === townName);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        townName: selected.name,
        latitude: selected.lat,
        longitude: selected.lng
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await apiService.createLot({
        ...formData,
        weightKg: parseFloat(formData.weightKg),
        estimatedPricePerKg: parseFloat(formData.estimatedPricePerKg)
      });
      navigate('/lots');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          Registrar Cosecha para Flete
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
          Ingresá los datos del lote. El sistema sugerirá el precio de referencia del SISAP y ubicará la parcela en el mapa.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Nombre del Productor / Responsable
          </label>
          <input
            type="text"
            required
            value={formData.producerName}
            onChange={e => setFormData({ ...formData, producerName: e.target.value })}
            placeholder="Ej. Toribio Ramos"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Teléfono de Contacto
            </label>
            <input
              type="text"
              required
              value={formData.contactPhone}
              onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="Ej. 964112233"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Tipo de Cultivo
            </label>
            <select
              value={formData.cropType}
              onChange={e => setFormData({ ...formData, cropType: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
            >
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Peso Estimado (kg)
            </label>
            <input
              type="number"
              step="10"
              required
              value={formData.weightKg}
              onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
              placeholder="Ej. 1500"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Precio Base (S/ por kg) {suggestedPriceLoading && <span style={{ color: '#15803d' }}>(Consultando SISAP...)</span>}
            </label>
            <input
              type="number"
              step="0.05"
              required
              value={formData.estimatedPricePerKg}
              onChange={e => setFormData({ ...formData, estimatedPricePerKg: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Centro Poblado / Distrito (Valle del Mantaro)
          </label>
          <select
            value={formData.townName}
            onChange={handleTownChange}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
          >
            {TOWNS.map(t => <option key={t.name} value={t.name}>{t.name} (GPS: {t.lat}, {t.lng})</option>)}
          </select>
          <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
            Coordenadas fijadas automáticamente para el motor de ruteo de camiones.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Guardando registro...' : 'Registrar Oferta de Cosecha'}
        </button>
      </form>
    </div>
  );
}
