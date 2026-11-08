import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import CustomSelect from './ui/CustomSelect';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Sprout,
  MapPin,
  Save,
  AlertCircle,
  Navigation,
  Compass,
  Crosshair,
  Bookmark,
  CheckCircle2,
  Map,
  RotateCcw,
  Sparkles,
  Layers,
  Radio,
  Plus,
  X
} from 'lucide-react';

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const parcelMarkerIcon = L.divIcon({
  className: 'custom-pin-parcel',
  html: `<div style="background: linear-gradient(135deg, #15803d, #166534); color: #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 2.5px solid #ffffff; font-size: 14px;">🌾</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

const TOWNS = [
  { name: 'Chupaca', lat: -12.0625, lng: -75.2878 },
  { name: 'Sicaya', lat: -12.0306, lng: -75.2817 },
  { name: 'Orcotuna', lat: -11.9681, lng: -75.3342 },
  { name: 'Mito', lat: -11.9328, lng: -75.3392 },
  { name: 'Concepción', lat: -11.9189, lng: -75.3131 },
  { name: 'Jauja', lat: -11.7758, lng: -75.4967 }
];

const DEFAULT_FAVORITE_PARCELS = [
  { id: 'fav-1', name: 'Parcela Santa Rosa', townName: 'Chupaca', lat: -12.0625, lng: -75.2878, note: 'Camino a Chupaca Km 1.5' },
  { id: 'fav-2', name: 'Fundo Los Molinos', townName: 'Sicaya', lat: -12.0306, lng: -75.2817, note: 'Margen izquierda del río' },
  { id: 'fav-3', name: 'Chacra San Isidro', townName: 'Orcotuna', lat: -11.9681, lng: -75.3342, note: 'Sector San Antonio' }
];

const CROPS = [
  'Papa Canchán',
  'Papa Huayro',
  'Papa Amarilla',
  'Zanahoria',
  'Arveja Verde',
  'Maíz Choclo'
];

function getClosestTown(lat, lng) {
  let closest = TOWNS[0];
  let minDistance = Infinity;
  for (const t of TOWNS) {
    const d = Math.hypot(t.lat - lat, t.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = t;
    }
  }
  return closest;
}

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    }
  });
  return null;
}

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, Math.max(12, map.getZoom()));
    }
  }, [center, map]);
  return null;
}

export default function CreateHarvestLotModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();

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
  const [error, setError] = useState(null);

  // Dynamic Persistent Favorite Parcels (Donald Norman / Jakob Nielsen H7)
  const [parcels, setParcels] = useState(() => {
    const saved = localStorage.getItem(`agroconecta_parcels_${user?.id || 'producer'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_FAVORITE_PARCELS;
  });

  const [isAddingParcel, setIsAddingParcel] = useState(false);
  const [newParcelName, setNewParcelName] = useState('');
  const [selectedParcelId, setSelectedParcelId] = useState('fav-1');
  const [locationSourceLabel, setLocationSourceLabel] = useState('Parcela Santa Rosa');
  const [rememberPickup, setRememberPickup] = useState(true);

  // GPS Sensor State
  const [gpsState, setGpsState] = useState({
    loading: false,
    error: null,
    detected: false
  });

  useEffect(() => {
    if (isOpen && user) {
      // Reload user parcels from localStorage if available
      const savedParcels = localStorage.getItem(`agroconecta_parcels_${user.id || 'producer'}`);
      if (savedParcels) {
        try {
          const parsed = JSON.parse(savedParcels);
          if (Array.isArray(parsed) && parsed.length > 0) setParcels(parsed);
        } catch {
          // ignore
        }
      }

      const storageKey = `agroconecta_default_pickup_${user.id || 'producer'}`;
      const saved = localStorage.getItem(storageKey);
      let targetTown = null;
      let targetSource = 'Parcela Santa Rosa';

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          targetTown = TOWNS.find(t => t.name.toLowerCase() === (parsed.townName || '').toLowerCase());
          if (targetTown) {
            targetSource = parsed.source || `Ubicación Guardada (${targetTown.name})`;
          }
        } catch {
          // ignore
        }
      }

      if (!targetTown) {
        targetTown = TOWNS.find(t => t.name.toLowerCase() === (user.townName || '').toLowerCase()) || TOWNS[0];
      }

      setLocationSourceLabel(targetSource);

      setFormData(prev => ({
        ...prev,
        producerName: user.role === 'Producer' ? user.fullName : (prev.producerName || user.fullName),
        contactPhone: user.phone || '964112233',
        townName: targetTown.name,
        latitude: targetTown.lat,
        longitude: targetTown.lng
      }));
    }
  }, [isOpen, user]);

  const handleSelectParcel = (parcel) => {
    setSelectedParcelId(parcel.id);
    setLocationSourceLabel(`Parcela: ${parcel.name}`);
    setFormData(prev => ({
      ...prev,
      townName: parcel.townName,
      latitude: parcel.lat,
      longitude: parcel.lng
    }));
  };

  const handleSaveNewParcel = () => {
    const name = newParcelName.trim() || `Parcela ${formData.townName}`;
    const newParcel = {
      id: `fav-${Date.now()}`,
      name,
      townName: formData.townName,
      lat: formData.latitude,
      lng: formData.longitude,
      note: `GPS: ${formData.latitude}, ${formData.longitude}`
    };
    const updated = [...parcels, newParcel];
    setParcels(updated);
    setSelectedParcelId(newParcel.id);
    setLocationSourceLabel(`Parcela: ${newParcel.name}`);
    localStorage.setItem(`agroconecta_parcels_${user?.id || 'producer'}`, JSON.stringify(updated));
    setIsAddingParcel(false);
    setNewParcelName('');
  };

  const handleDeleteParcel = (e, parcelId) => {
    e.stopPropagation();
    const updated = parcels.filter(p => p.id !== parcelId);
    setParcels(updated);
    localStorage.setItem(`agroconecta_parcels_${user?.id || 'producer'}`, JSON.stringify(updated));
    if (selectedParcelId === parcelId) {
      setSelectedParcelId(null);
    }
  };

  const handleCaptureGPS = () => {
    setGpsState({ loading: true, error: null, detected: false });

    if (!navigator.geolocation) {
      setGpsState({
        loading: false,
        error: 'Su navegador no soporta geolocalización. Use el mapa interactivo o seleccione su parcela.',
        detected: false
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const closest = getClosestTown(lat, lng);
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          townName: closest.name
        }));
        setSelectedParcelId(null);
        setLocationSourceLabel(`GPS en Parcela (${closest.name})`);
        setGpsState({ loading: false, error: null, detected: true });
      },
      () => {
        setGpsState({
          loading: false,
          error: 'No se obtuvo señal GPS directa. Puede simular la captura en campo o usar el mapa.',
          detected: false
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSimulateFieldGPS = () => {
    // Realistic simulation of a field plot in Chupaca valley terraces
    const simLat = -12.0642;
    const simLng = -75.2895;
    const closest = getClosestTown(simLat, simLng);
    setFormData(prev => ({
      ...prev,
      latitude: simLat,
      longitude: simLng,
      townName: closest.name
    }));
    setSelectedParcelId(null);
    setLocationSourceLabel('GPS Capturado en Terreno (Chupaca Sur)');
    setGpsState({ loading: false, error: null, detected: true });
  };

  const handleMapLocationSelect = (lat, lng) => {
    const closest = getClosestTown(lat, lng);
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      townName: closest.name
    }));
    setSelectedParcelId(null);
    setLocationSourceLabel(`Punto en Mapa (${closest.name})`);
  };

  const handleTownSelect = (townName) => {
    const selected = TOWNS.find(t => t.name === townName);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        townName: selected.name,
        latitude: selected.lat,
        longitude: selected.lng
      }));
      setSelectedParcelId(null);
      setLocationSourceLabel(`Distrito ${selected.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.producerName.trim()) {
      setError('El nombre del productor o responsable es obligatorio.');
      return;
    }
    if (!formData.contactPhone.trim() || !/^[0-9]{9}$/.test(formData.contactPhone.trim().replace(/\s+/g, ''))) {
      setError('Ingrese un número de celular válido de 9 dígitos (ej. 964112233).');
      return;
    }
    if (!formData.weightKg || parseFloat(formData.weightKg) <= 0) {
      setError('El peso debe ser mayor a cero.');
      return;
    }

    try {
      setLoading(true);
      await apiService.createLot({
        ...formData,
        weightKg: parseFloat(formData.weightKg),
        estimatedPricePerKg: parseFloat(formData.estimatedPricePerKg)
      });

      // Persist preferred pickup location so user is never asked again
      if (user && rememberPickup) {
        const storageKey = `agroconecta_default_pickup_${user.id || 'producer'}`;
        localStorage.setItem(storageKey, JSON.stringify({
          townName: formData.townName,
          latitude: formData.latitude,
          longitude: formData.longitude,
          source: locationSourceLabel
        }));
      }

      if (onCreated) onCreated();
      onClose();
      // Reset form
      setFormData({
        producerName: '',
        contactPhone: '',
        cropType: 'Papa Canchán',
        weightKg: '',
        estimatedPricePerKg: '1.30',
        townName: 'Chupaca',
        latitude: -12.0625,
        longitude: -75.2878
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
      title="Registrar Lote de Cosecha"
      subtitle="Defina el cultivo y la ubicación de recojo para consolidar el flete hacia el Mercado Mayorista."
      maxWidth="680px"
    >
      {error && (
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          borderRadius: '8px',
          fontSize: '0.84rem',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Producer & Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label htmlFor="lot-producer" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Productor / Responsable
            </label>
            <input
              id="lot-producer"
              type="text"
              required
              value={formData.producerName}
              onChange={e => setFormData({ ...formData, producerName: e.target.value })}
              placeholder="Ej. Eusebio Poma"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label htmlFor="lot-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Celular de Contacto
            </label>
            <input
              id="lot-phone"
              type="text"
              required
              value={formData.contactPhone}
              onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="Ej. 964112233"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Crop, Weight & Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
          <div>
            <label htmlFor="lot-crop" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Cultivo / Producto
            </label>
            <CustomSelect
              value={formData.cropType}
              onChange={(val) => setFormData(prev => ({ ...prev, cropType: val }))}
              options={CROPS.map(c => ({ value: c, label: c, icon: Sprout }))}
              ariaLabel="Seleccionar tipo de cultivo"
            />
          </div>

          <div>
            <label htmlFor="lot-weight" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Peso (kg)
            </label>
            <input
              id="lot-weight"
              type="number"
              step="10"
              required
              value={formData.weightKg}
              onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
              placeholder="Ej. 1500"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label htmlFor="lot-price" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Precio Base (S/ kg)
            </label>
            <input
              id="lot-price"
              type="number"
              step="0.05"
              required
              value={formData.estimatedPricePerKg}
              onChange={e => setFormData({ ...formData, estimatedPricePerKg: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* UNIFIED INTERACTIVE LOCATION PICKER (Donald Norman / Jakob Nielsen H7) */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px' }}>
          {/* Header & Active Source Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} color="#15803d" />
              <span>Lugar y Tranquera de Recojo</span>
            </span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
              {locationSourceLabel}
            </span>
          </div>

          {/* Interactive Mini-Map with Floating GPS Controls */}
          <div style={{ height: '190px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', marginBottom: '12px' }}>
            <MapContainer
              center={[formData.latitude, formData.longitude]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[formData.latitude, formData.longitude]}
                icon={parcelMarkerIcon}
              />
              <MapClickHandler onLocationSelect={handleMapLocationSelect} />
              <MapRecenter center={[formData.latitude, formData.longitude]} />
            </MapContainer>

            {/* Floating Quick GPS Toolbar on Top Right of Map */}
            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 500, display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleCaptureGPS}
                disabled={gpsState.loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  cursor: gpsState.loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Crosshair size={13} />
                <span>{gpsState.loading ? 'Detectando GPS...' : 'Usar Mi GPS Actual'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateFieldGPS}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Simula la señal GPS en campo"
              >
                <Sparkles size={12} color="#15803d" />
                <span>Simular GPS</span>
              </button>
            </div>

            {/* Floating Bottom Info Bar */}
            <div style={{
              position: 'absolute',
              bottom: '6px',
              left: '6px',
              right: '6px',
              backgroundColor: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(4px)',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              color: '#1e293b',
              zIndex: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} color="#15803d" />
                <span><strong>GPS Parcela:</strong> {formData.townName} ({formData.latitude}, {formData.longitude})</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
                Toca el mapa para ajustar la tranquera
              </span>
            </div>
          </div>

          {/* Quick Parcel Chips & Autocompleted District in One Seamless Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '14px', alignItems: 'start', marginBottom: '10px' }}>
            {/* Quick Favorite Parcel Chips with Add Option */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b' }}>
                  Parcelas Habituales del Productor:
                </span>
                {!isAddingParcel && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewParcelName(`Parcela en ${formData.townName}`);
                      setIsAddingParcel(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#15803d',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title="Guardar las coordenadas actuales como una nueva parcela habitual"
                  >
                    <Plus size={13} />
                    <span>Guardar esta ubicación</span>
                  </button>
                )}
              </div>

              {/* Inline input to name and save the current location */}
              {isAddingParcel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nombre (ej. Fundo Don Toribio)"
                    value={newParcelName}
                    onChange={(e) => setNewParcelName(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      fontSize: '0.78rem',
                      borderRadius: '6px',
                      border: '1.5px solid #15803d',
                      outline: 'none',
                      flex: 1,
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewParcel}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.74rem',
                      fontWeight: '700',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingParcel(false); setNewParcelName(''); }}
                    style={{
                      padding: '5px 8px',
                      fontSize: '0.74rem',
                      color: '#64748b',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Saved Parcel Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {parcels.map(p => {
                  const isSelected = selectedParcelId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParcel(p)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: '700',
                        border: isSelected ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                        color: isSelected ? '#15803d' : '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Bookmark size={11} color={isSelected ? '#15803d' : '#64748b'} />
                      <span>{p.name}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 'normal' }}>({p.townName})</span>
                      {parcels.length > 1 && (
                        <span
                          onClick={(e) => handleDeleteParcel(e, p.id)}
                          title="Eliminar parcela habitual"
                          style={{
                            color: '#94a3b8',
                            marginLeft: '2px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 'normal',
                            lineHeight: 1
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                          onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                        >
                          ×
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Base District (100% Autocompleted, NOT a manual dropdown!) */}
            <div>
              <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>
                Distrito (Autocompletado por GPS):
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', flexShrink: 0 }}>
                  <CheckCircle2 size={14} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {formData.townName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Valle del Mantaro · Asignado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Persistence Checkbox */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={rememberPickup}
                onChange={(e) => setRememberPickup(e.target.checked)}
                style={{ accentColor: '#15803d', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span>Guardar esta tranquera como mi lugar de recojo habitual (no volver a preguntar)</span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#15803d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(21, 128, 61, 0.25)'
            }}
          >
            <Save size={16} />
            <span>{loading ? 'Guardando Lote...' : 'Guardar Lote de Cosecha'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
