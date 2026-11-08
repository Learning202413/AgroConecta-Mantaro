import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import CustomSelect from '../components/ui/CustomSelect';
import {
  Truck,
  Building2,
  Sprout,
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  Scale,
  Calendar,
  Info,
  FileText,
  Printer,
  X
} from 'lucide-react';

// Fix Leaflet default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Destination: Gran Mercado Mayorista de Huancayo (Puquio)
const DESTINATION = {
  lat: -12.0682,
  lng: -75.2100,
  name: 'Gran Mercado Mayorista de Huancayo'
};

// Custom SVG-based Pin Icons for Leaflet (Donald Norman Signifiers & ISO 9241 Visual Ergonomics)
const marketIcon = L.divIcon({
  className: 'custom-pin-market',
  html: `<div style="background: linear-gradient(135deg, #6b21a8, #4c1d95); color: #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 2.5px solid #ffffff;">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34]
});

const farmLotIcon = L.divIcon({
  className: 'custom-pin-lot',
  html: `<div style="background: linear-gradient(135deg, #15803d, #166534); color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid #ffffff;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"></path><path d="M10 20c5.5-2.5.8-6.4 3-10"></path><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const stopPendingIcon = L.divIcon({
  className: 'custom-pin-pending',
  html: `<div style="background: linear-gradient(135deg, #1e40af, #1d4ed8); color: #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const stopCollectedIcon = L.divIcon({
  className: 'custom-pin-collected',
  html: `<div style="background: linear-gradient(135deg, #15803d, #10b981); color: #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

export default function RouteOptimizerMap() {
  const { user } = useAuth();
  const [availableLots, setAvailableLots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedLotIds, setSelectedLotIds] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationAlert, setValidationAlert] = useState(null);

  // Confirm Modal state (Norman / Shneiderman Rule 4 & 5)
  const [pendingStop, setPendingStop] = useState(null);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);
  const [isWaybillModalOpen, setIsWaybillModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    const handleReload = () => loadData();
    window.addEventListener('harvest-lot-created', handleReload);
    return () => window.removeEventListener('harvest-lot-created', handleReload);
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lots, vehs] = await Promise.all([
        apiService.getAvailableLots(),
        apiService.getAvailableVehicles()
      ]);
      setAvailableLots(lots);
      setVehicles(vehs);
      if (vehs.length > 0) {
        if (user?.role === 'Carrier') {
          const myVeh = vehs.find(v => v.driverName.toLowerCase().includes((user.fullName || '').toLowerCase()));
          setSelectedVehicleId((myVeh || vehs[0]).id.toString());
        } else if (!selectedVehicleId) {
          setSelectedVehicleId(vehs[0].id.toString());
        }
      }
      if (lots.length > 0 && selectedLotIds.length === 0) {
        setSelectedLotIds(lots.slice(0, 3).map(l => l.id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLotToggle = (id) => {
    setValidationAlert(null);
    if (selectedLotIds.includes(id)) {
      setSelectedLotIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedLotIds(prev => [...prev, id]);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id.toString() === selectedVehicleId);
  const totalWeight = availableLots
    .filter(l => selectedLotIds.includes(l.id))
    .reduce((sum, l) => sum + l.weightKg, 0);

  const isOverweight = selectedVehicle && totalWeight > selectedVehicle.maxCapacityKg;

  // Replaced alert() with accessible inline banners (Nielsen H4 / H9)
  const handleOptimize = async () => {
    setValidationAlert(null);
    if (!selectedVehicleId) {
      setValidationAlert('Seleccione un vehículo transportista.');
      return;
    }
    if (selectedLotIds.length === 0) {
      setValidationAlert('Seleccione al menos un lote de cosecha para consolidar el flete.');
      return;
    }
    if (isOverweight) {
      setValidationAlert('El peso total supera la capacidad máxima del camión seleccionado.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const route = await apiService.optimizeRoute({
        transportVehicleId: parseInt(selectedVehicleId),
        selectedLotIds
      });
      setActiveRoute(route);
      const remainingLots = await apiService.getAvailableLots();
      setAvailableLots(remainingLots);
      setSelectedLotIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmStopAction = async () => {
    if (!activeRoute || !pendingStop) return;
    try {
      setIsConfirmingStop(true);
      await apiService.completeStop(activeRoute.id, pendingStop.id);
      const updated = await apiService.getRouteById(activeRoute.id);
      setActiveRoute(updated);
      setPendingStop(null);
    } catch (err) {
      setError(`Error al registrar recojo: ${err.message}`);
    } finally {
      setIsConfirmingStop(false);
    }
  };

  const polylineCoords = activeRoute
    ? [
        ...activeRoute.stops.map(s => [s.latitude, s.longitude]),
        [DESTINATION.lat, DESTINATION.lng]
      ]
    : [];

  return (
    <div>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={24} color="#15803d" />
            <span>Fletes Compartidos y Ruteo Inteligente</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
            Optimización geoespacial de carga agrícola a lo largo del Valle del Mantaro hacia el Gran Mercado Mayorista de Huancayo.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
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
          <RotateCw size={14} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Role-Specific Guidance Banner (Donald Norman Feedforward / Nielsen H1) */}
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
            <strong>Modo Monitoreo de Productor:</strong> Estás visualizando los fletes en tránsito y los tiempos de llegada estimados hacia el Mercado Mayorista. La ejecución y confirmación de paradas corresponde al transportista asignado.
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
            <strong>Hoja de Ruta del Transportista:</strong> Seleccione los lotes a consolidar respetando la capacidad máxima de su camión. Al iniciar la ruta podrá confirmar cada parada de recojo en tiempo real.
          </div>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Inline Validation Warning (Replaces window.alert) */}
      {validationAlert && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span style={{ fontWeight: '600', fontSize: '0.86rem' }}>{validationAlert}</span>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Left Control Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Truck size={18} color="#15803d" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              1. Asignar Camión Transportista
            </h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <CustomSelect
              value={selectedVehicleId}
              onChange={(val) => {
                setSelectedVehicleId(String(val));
                setValidationAlert(null);
              }}
              options={vehicles.map(v => ({
                value: String(v.id),
                label: `${v.driverName} (${v.licensePlate})`,
                subtitle: `Capacidad nominal: ${v.maxCapacityKg.toLocaleString()} kg`,
                icon: Truck,
                badge: 'Disponible'
              }))}
              ariaLabel="Seleccionar camión transportista"
            />
            {selectedVehicle && (
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Scale size={13} />
                <span>Capacidad máxima nominal: <strong>{selectedVehicle.maxCapacityKg.toLocaleString()} kg</strong></span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sprout size={18} color="#15803d" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              2. Seleccionar Lotes Disponibles
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px 0' }}>
            Marque las cosechas a consolidar en este viaje.
          </p>

          {/* Lots Selection List */}
          <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '6px', marginBottom: '18px' }}>
            {availableLots.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No hay cosechas disponibles para consolidar.
              </div>
            ) : (
              availableLots.map(lot => {
                const isChecked = selectedLotIds.includes(lot.id);
                return (
                  <div
                    key={lot.id}
                    onClick={() => handleLotToggle(lot.id)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleLotToggle(lot.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isChecked ? '#f0fdf4' : '#ffffff',
                      border: isChecked ? '1px solid #86efac' : '1px solid transparent',
                      marginBottom: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        aria-label={`Seleccionar lote ${lot.cropType} de ${lot.producerName}`}
                        style={{ cursor: 'pointer', accentColor: '#15803d' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                          {lot.cropType} · {lot.townName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {lot.producerName}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#15803d' }}>
                        {lot.weightKg.toLocaleString()} kg
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        S/ {lot.estimatedPricePerKg.toFixed(2)}/kg
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Weight Capacity Progress Meter (Donald Norman Constraints & Feedback) */}
          {selectedVehicle && (
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: isOverweight ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: isOverweight ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: isOverweight ? '#dc2626' : '#334155' }}>
                  Carga consolidada: {totalWeight.toLocaleString()} kg
                </span>
                <span style={{ color: '#64748b' }}>
                  Límite: {selectedVehicle.maxCapacityKg.toLocaleString()} kg
                </span>
              </div>

              {/* Visual meter bar */}
              <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (totalWeight / selectedVehicle.maxCapacityKg) * 100)}%`,
                    backgroundColor: isOverweight ? '#ef4444' : '#15803d',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {isOverweight && (
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} />
                  <span>Exceso de peso ({totalWeight - selectedVehicle.maxCapacityKg} kg). Deseleccione lotes.</span>
                </div>
              )}
            </div>
          )}

          {/* Optimize Button (Norman Physical Constraint) */}
          <button
            type="button"
            onClick={handleOptimize}
            disabled={loading || isOverweight || selectedLotIds.length === 0}
            style={{
              width: '100%',
              backgroundColor: isOverweight || selectedLotIds.length === 0 ? '#94a3b8' : '#15803d',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: isOverweight || selectedLotIds.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isOverweight || selectedLotIds.length === 0 ? 'none' : '0 2px 4px rgba(21, 128, 61, 0.25)',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? (
              <span>Calculando Ruta Óptima...</span>
            ) : (
              <>
                <Play size={16} fill="#ffffff" />
                <span>Optimizar y Consolidar Flete</span>
              </>
            )}
          </button>
        </div>

        {/* Right Map & Route Visualization Panel */}
        <div>
          <div style={{ height: '460px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'relative', zIndex: 1 }}>
            <MapContainer
              center={[-12.0000, -75.3000]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Destination Wholesale Market with Custom Purple Pin */}
              <Marker position={[DESTINATION.lat, DESTINATION.lng]} icon={marketIcon}>
                <Popup>
                  <div style={{ fontWeight: '800', color: '#6b21a8' }}>{DESTINATION.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Punto final de descarga mayorista (El Tambo / Puquio).</div>
                </Popup>
              </Marker>

              {/* Harvest lots markers with Farm Pin */}
              {availableLots.map(lot => (
                <Marker key={lot.id} position={[lot.latitude, lot.longitude]} icon={farmLotIcon}>
                  <Popup>
                    <div style={{ fontWeight: '800', color: '#15803d' }}>{lot.cropType}</div>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>Productor: <strong>{lot.producerName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>Carga: <strong>{lot.weightKg} kg</strong></div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={12} color="#15803d" />
                      <span>{lot.townName}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Active Route Stops with Differentiated Status Pin (Norman Signifier) */}
              {activeRoute && activeRoute.stops.map(stop => (
                <Marker
                  key={stop.id}
                  position={[stop.latitude, stop.longitude]}
                  icon={stop.isCollected ? stopCollectedIcon : stopPendingIcon}
                >
                  <Popup>
                    <div style={{ fontWeight: '800' }}>Parada #{stop.stopOrder}: {stop.townName}</div>
                    <div style={{ fontSize: '0.8rem' }}>Volumen: {stop.weightToCollectKg} kg</div>
                    <div style={{ fontSize: '0.78rem', color: stop.isCollected ? '#15803d' : '#1e40af', fontWeight: '700' }}>
                      {stop.isCollected ? '✓ Recolectado' : '⏳ Pendiente de Recojo'}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Polyline Route */}
              {polylineCoords.length > 1 && (
                <Polyline
                  positions={polylineCoords}
                  color="#15803d"
                  weight={5}
                  opacity={0.85}
                  dashArray="8, 6"
                />
              )}
            </MapContainer>
          </div>

          {/* Active Route Details Card or Empty Guidance State (Shneiderman Rule 8) */}
          {activeRoute ? (
            <div style={{ marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Hoja de Ruta #{activeRoute.id} · Conductor: {activeRoute.driverName} ({activeRoute.licensePlate})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsWaybillModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      title="Ver Manifiesto de Carga y Hoja de Ruta Oficial"
                    >
                      <FileText size={13} color="#15803d" />
                      <span>Manifiesto de Carga</span>
                    </button>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Destino: {activeRoute.destination} (Sector Puquio / El Tambo)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Distancia Total</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{activeRoute.totalDistanceKm} km</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Tiempo Estimado</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{activeRoute.estimatedDurationMinutes} min</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Carga Total</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#15803d' }}>{activeRoute.totalWeightKg.toLocaleString()} kg</div>
                  </div>
                </div>
              </div>

              {/* Sequential Stops */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#334155', marginBottom: '10px' }}>
                  Paradas de Recolección Programadas:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeRoute.stops.map(stop => (
                    <div
                      key={stop.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: stop.isCollected ? '#f0fdf4' : '#f8fafc',
                        border: stop.isCollected ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: stop.isCollected ? '#15803d' : '#1e40af',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '800'
                        }}>
                          {stop.stopOrder}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                            {stop.townName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Carga a recoger: {stop.weightToCollectKg.toLocaleString()} kg
                          </div>
                        </div>
                      </div>

                      {stop.isCollected ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={15} />
                          <span>Recolectado</span>
                        </span>
                      ) : user?.role === 'Producer' ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="#94a3b8" />
                          <span>Pendiente de recojo</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingStop(stop)}
                          style={{
                            backgroundColor: '#1e40af',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Confirmar Recojo</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Final Destination Discharge Stop (Gran Mercado Mayorista de Huancayo) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: activeRoute.stops.every(s => s.isCollected) ? '#faf5ff' : '#f8fafc',
                      border: activeRoute.stops.every(s => s.isCollected) ? '1.5px solid #a855f7' : '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#6b21a8',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building2 size={15} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#581c87', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Destino Final: Gran Mercado Mayorista de Huancayo</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Sector Puquio / El Tambo · Descarga consolidada de {activeRoute.totalWeightKg.toLocaleString()} kg
                        </div>
                      </div>
                    </div>

                    <div>
                      {activeRoute.status === 'Completed' || activeRoute.stops.every(s => s.isCollected) ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CheckCircle2 size={16} color="#15803d" />
                          <span>Carga Entregada</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '6px' }}>
                          Esperando paradas previas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '24px', textAlign: 'center' }}>
              <Info size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', margin: '0 0 4px 0' }}>
                Sin hoja de ruta activa
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Seleccione un camión y los lotes deseados a la izquierda, y presione <strong>"Optimizar y Consolidar Flete"</strong> para generar la secuencia de recolección en el mapa.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Stop Collection (Norman Slips / Shneiderman Rule 4 & 5) */}
      <ConfirmModal
        isOpen={!!pendingStop}
        title="Confirmar Recojo de Cosecha"
        description={
          pendingStop
            ? `¿Desea registrar como completado el recojo de ${pendingStop.weightToCollectKg} kg en ${pendingStop.townName}? Esta acción actualizará la trazabilidad del lote y la carga del camión.`
            : ''
        }
        confirmText="Confirmar Recojo"
        onConfirm={handleConfirmStopAction}
        onCancel={() => setPendingStop(null)}
        isLoading={isConfirmingStop}
      />

      {/* Official Waybill & Cargo Manifest Modal (Shneiderman Closure / Traceability Audit) */}
      {isWaybillModalOpen && activeRoute && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #cbd5e1'
          }}>
            {/* Manifest Header Bar */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#15803d', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  AgroConecta Mantaro · Manifiesto Oficial de Carga
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: '2px 0 0 0' }}>
                  Hoja de Ruta de Transporte Agrícola #{activeRoute.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWaybillModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Manifest Content */}
            <div style={{ padding: '22px' }}>
              {/* Institutional Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: '700' }}>UNIDAD DE TRANSPORTE:</div>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{activeRoute.licensePlate} · Camión Local</div>
                  <div style={{ color: '#475569', marginTop: '2px' }}>Conductor: <strong>{activeRoute.driverName}</strong></div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: '700' }}>DESTINO FINAL REGISTRADO:</div>
                  <div style={{ fontWeight: '800', color: '#6b21a8' }}>{activeRoute.destination}</div>
                  <div style={{ color: '#475569', marginTop: '2px' }}>Sector Puquio / El Tambo · Huancayo</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: '700' }}>MÉTRICAS DEL VIAJE:</div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>
                    {activeRoute.totalDistanceKm} km · {activeRoute.estimatedDurationMinutes} min estimados
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.74rem', fontWeight: '700' }}>CARGA TOTAL CONSOLIDADA:</div>
                  <div style={{ fontWeight: '800', color: '#15803d' }}>
                    {activeRoute.totalWeightKg.toLocaleString()} kg (Ahorro ~32.5% vs flete individual)
                  </div>
                </div>
              </div>

              {/* Waybill Stops Table */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                Detalle de Lotes y Tranqueras de Recojo (Trazabilidad):
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}># Parada</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Lugar de Recojo</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Coordenadas GPS</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Carga a Recoger</th>
                    <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Estado de Parada</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRoute.stops.map(stop => (
                    <tr key={stop.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#0f172a' }}>Parada {stop.stopOrder}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '700' }}>{stop.townName}</td>
                      <td style={{ padding: '8px 10px', color: '#64748b' }}>{stop.latitude}, {stop.longitude}</td>
                      <td style={{ padding: '8px 10px', fontWeight: '800', color: '#15803d' }}>{stop.weightToCollectKg.toLocaleString()} kg</td>
                      <td style={{ padding: '8px 10px' }}>
                        {stop.isCollected ? (
                          <span style={{ color: '#15803d', fontWeight: '700' }}>✓ Recolectado en Tranquera</span>
                        ) : (
                          <span style={{ color: '#1e40af', fontWeight: '600' }}>⏳ En Camino</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#faf5ff' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#6b21a8' }}>DESTINO FINAL</td>
                    <td style={{ padding: '8px 10px', fontWeight: '800', color: '#6b21a8' }}>Gran Mercado Mayorista de Huancayo</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>-12.0682, -75.2100</td>
                    <td style={{ padding: '8px 10px', fontWeight: '900', color: '#6b21a8' }}>{activeRoute.totalWeightKg.toLocaleString()} kg Total</td>
                    <td style={{ padding: '8px 10px', color: '#6b21a8', fontWeight: '700' }}>Punto de Descarga</td>
                  </tr>
                </tbody>
              </table>

              {/* Digital Compliance & Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
                <div style={{ textAlign: 'center', padding: '14px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontWeight: '700', color: '#0f172a' }}>
                    {activeRoute.driverName}
                  </div>
                  <div>Transportista Autorizado (MTC)</div>
                </div>

                <div style={{ textAlign: 'center', padding: '14px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontWeight: '700', color: '#0f172a' }}>
                    Garita de Control · Puquio
                  </div>
                  <div>Recepción Gran Mercado Mayorista</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={15} color="#15803d" />
                <span>Imprimir Manifiesto</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWaybillModalOpen(false)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
