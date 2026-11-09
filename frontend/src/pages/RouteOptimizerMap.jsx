import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
  Phone,
  X,
  Cpu,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck
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

const createSequenceIcon = (number, isCollected = false) => L.divIcon({
  className: 'custom-pin-sequence',
  html: `<div style="background: ${isCollected ? 'linear-gradient(135deg, #15803d, #10b981)' : 'linear-gradient(135deg, #15803d, #166534)'}; color: #ffffff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid #ffffff; font-weight: 800; font-size: 13px; font-family: sans-serif;">
    ${number}
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

export default function RouteOptimizerMap() {
  const { user } = useAuth();
  const location = useLocation();
  const [availableLots, setAvailableLots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedLotIds, setSelectedLotIds] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationAlert, setValidationAlert] = useState(null);

  // Dynamic Route Estimation & Machine Learning State
  const [routeEstimate, setRouteEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isRushHour, setIsRushHour] = useState(false);
  const [showAuditDetails, setShowAuditDetails] = useState(false);

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
        apiService.getAllVehicles()
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

      const preselectedId = location.state?.preselectedLotId;
      if (preselectedId && lots.some(l => l.id === preselectedId)) {
        setSelectedLotIds([preselectedId]);
        setValidationAlert(`Lote #${preselectedId} preseleccionado desde el inventario.`);
      } else if (lots.length > 0 && selectedLotIds.length === 0) {
        setSelectedLotIds(lots.slice(0, 3).map(l => l.id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Restrict displayed map lots if user is a Producer (Data privacy)
  const displayedLots = useMemo(() => {
    if (user?.role === 'Producer' && user.fullName) {
      return availableLots.filter(l => l.producerName.toLowerCase().includes(user.fullName.toLowerCase()));
    }
    return availableLots;
  }, [availableLots, user]);

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

  const [roadGeometry, setRoadGeometry] = useState([]);

  // Stops used for active map routing: either committed active route stops OR dynamically estimated sequence
  const currentStops = useMemo(() => {
    if (activeRoute?.stops?.length > 0) return activeRoute.stops;
    if (routeEstimate?.orderedStops?.length > 0) return routeEstimate.orderedStops;
    return [];
  }, [activeRoute, routeEstimate]);

  // Dynamic Route Estimation via Multiple Linear Regression & Multi-Stop Ordering
  useEffect(() => {
    if (activeRoute) return;

    if (selectedLotIds.length === 0) {
      setRouteEstimate(null);
      return;
    }

    let isMounted = true;
    const runEstimate = async () => {
      try {
        setIsEstimating(true);
        const res = await apiService.estimateRoute({
          selectedLotIds,
          transportVehicleId: selectedVehicleId ? parseInt(selectedVehicleId) : null,
          isRushHour
        });
        if (isMounted) {
          setRouteEstimate(res);
        }
      } catch (err) {
        console.warn('Notice estimating route:', err.message);
      } finally {
        if (isMounted) setIsEstimating(false);
      }
    };

    const timer = setTimeout(runEstimate, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedLotIds, selectedVehicleId, isRushHour, activeRoute]);

  // Fetch real street road geometry via OSRM to curve along actual roads
  useEffect(() => {
    if (!currentStops || currentStops.length === 0) {
      setRoadGeometry([]);
      return;
    }

    let isMounted = true;
    const fetchRoadGeometry = async () => {
      try {
        const waypoints = [
          ...currentStops.map(s => `${s.longitude},${s.latitude}`),
          `${DESTINATION.lng},${DESTINATION.lat}`
        ].join(';');

        const osrmBase = import.meta.env.VITE_OSRM_URL || 'https://osrm.astrazynk.pp.ua';
        let res;
        try {
          res = await fetch(`${osrmBase}/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
        } catch {
          // Secondary fallback to public OSRM if self-hosted is unreachable
          res = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
        }
        if (!res || !res.ok) throw new Error('OSRM service unavailable');
        const data = await res.json();

        if (isMounted && data.routes && data.routes[0] && data.routes[0].geometry) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoadGeometry(coords);
          return;
        }
      } catch (e) {
        // Fallback to straight segments if network or OSRM is slow
      }

      if (isMounted) {
        setRoadGeometry([
          ...currentStops.map(s => [s.latitude, s.longitude]),
          [DESTINATION.lat, DESTINATION.lng]
        ]);
      }
    };

    fetchRoadGeometry();
    return () => { isMounted = false; };
  }, [currentStops]);

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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Marque las cosechas a consolidar en este viaje.
            </p>
            {availableLots.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLotIds(availableLots.map(l => l.id))}
                  style={{
                    fontSize: '0.74rem',
                    color: '#15803d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    padding: 0
                  }}
                >
                  Seleccionar todos
                </button>
                <span style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>|</span>
                <button
                  type="button"
                  onClick={() => setSelectedLotIds([])}
                  style={{
                    fontSize: '0.74rem',
                    color: '#64748b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: 0
                  }}
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

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

              {/* Harvest lots markers with Farm Pin or Sequence Pin (Isolated for Producers) */}
              {displayedLots.map(lot => {
                const estimatedStop = !activeRoute && routeEstimate?.orderedStops?.find(s => s.id === lot.id);
                const iconToUse = estimatedStop
                  ? createSequenceIcon(estimatedStop.stopOrder, false)
                  : farmLotIcon;

                return (
                  <Marker key={lot.id} position={[lot.latitude, lot.longitude]} icon={iconToUse}>
                    <Popup>
                      <div style={{ fontWeight: '800', color: '#15803d' }}>
                        {estimatedStop ? `Parada #${estimatedStop.stopOrder} · ` : ''}{lot.cropType}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155' }}>Productor: <strong>{lot.producerName}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: '#334155' }}>Carga: <strong>{lot.weightKg.toLocaleString()} kg</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} color="#15803d" />
                        <span>{lot.townName}</span>
                      </div>
                      {estimatedStop && (
                        <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#15803d', fontWeight: '700', backgroundColor: '#f0fdf4', padding: '3px 6px', borderRadius: '4px' }}>
                          ✓ Parada #{estimatedStop.stopOrder} en la ruta óptima trazada
                        </div>
                      )}
                    </Popup>
                  </Marker>
                );
              })}

              {/* Active Route Stops with Differentiated Status Pin (Norman Signifier) */}
              {activeRoute && activeRoute.stops.map(stop => (
                <Marker
                  key={stop.id}
                  position={[stop.latitude, stop.longitude]}
                  icon={stop.isCollected ? stopCollectedIcon : createSequenceIcon(stop.stopOrder, false)}
                >
                  <Popup>
                    <div style={{ fontWeight: '800' }}>Parada #{stop.stopOrder}: {stop.townName}</div>
                    <div style={{ fontSize: '0.8rem' }}>Volumen: {stop.weightToCollectKg.toLocaleString()} kg</div>
                    <div style={{ fontSize: '0.78rem', color: stop.isCollected ? '#15803d' : '#1e40af', fontWeight: '700' }}>
                      {stop.isCollected ? '✓ Recolectado' : '⏳ Pendiente de Recojo'}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Polyline Route: Snapped to actual streets and roads */}
              {roadGeometry.length > 1 && (
                <Polyline
                  positions={roadGeometry}
                  color="#15803d"
                  weight={5}
                  opacity={0.85}
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
                  {activeRoute.stops.map(stop => {
                    const matchingLot = activeRoute.lots?.find(
                      l => l.townName.toLowerCase() === stop.townName.toLowerCase() ||
                           (Math.abs(l.latitude - stop.latitude) < 0.005 && Math.abs(l.longitude - stop.longitude) < 0.005)
                    );
                    return (
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
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{stop.townName}</span>
                            {matchingLot && (
                              <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: '600' }}>
                                · {matchingLot.producerName} ({matchingLot.cropType})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span>Carga a recoger: <strong>{stop.weightToCollectKg.toLocaleString()} kg</strong></span>
                            {matchingLot?.contactPhone && (
                              <a
                                href={`tel:${matchingLot.contactPhone}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  color: '#1d4ed8',
                                  textDecoration: 'none',
                                  fontWeight: '600',
                                  backgroundColor: '#eff6ff',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem'
                                }}
                                title="Llamar al productor ante cualquier contingencia"
                              >
                                <Phone size={10} />
                                <span>{matchingLot.contactPhone}</span>
                              </a>
                            )}
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
                    );
                  })}

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
          ) : routeEstimate ? (
            /* Dynamic Route Estimation & Stop Sequencing Panel */
            <div style={{
              marginTop: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #86efac',
              padding: '22px',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.08)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={20} color="#15803d" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Ruta Óptima Trazada y Estimación de Tiempo</span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                        Regresión Lineal Múltiple
                      </span>
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Secuencia calculada para minimizar la distancia total hacia el Mercado Mayorista.
                    </p>
                  </div>
                </div>

                {/* Rush Hour Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#475569', cursor: 'pointer', backgroundColor: isRushHour ? '#fef3c7' : '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={isRushHour}
                    onChange={(e) => setIsRushHour(e.target.checked)}
                    style={{ accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  <span>Hora Punta Huancayo / El Tambo</span>
                </label>
              </div>

              {/* Metric Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Tiempo Estimado Total</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803d' }}>
                    {Math.floor(routeEstimate.estimatedDurationMinutes / 60) > 0 ? `${Math.floor(routeEstimate.estimatedDurationMinutes / 60)} h ` : ''}
                    {routeEstimate.estimatedDurationMinutes % 60} min
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#166534' }}>{routeEstimate.estimatedDurationMinutes} minutos calculados</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Distancia Carretera</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                    {routeEstimate.totalDistanceKm} km
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vía red vial OSRM Junín</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Carga Consolidada</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                    {routeEstimate.totalWeightKg.toLocaleString()} kg
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{(routeEstimate.totalWeightKg / 1000).toFixed(2)} toneladas</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Paradas de Recojo</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                    {routeEstimate.orderedStops.length} paradas
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>+ Destino Mayorista</div>
                </div>
              </div>

              {/* Sequence Breadcrumb Visualization */}
              <div style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Secuencia Óptima de Recolección (Evita retrocesos a lo largo del Valle del Mantaro):
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  {routeEstimate.orderedStops.map((stop) => (
                    <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #15803d',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: '#0f172a'
                      }}>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#15803d',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem'
                        }}>
                          {stop.stopOrder}
                        </span>
                        <span>{stop.townName}</span>
                        <span style={{ color: '#15803d', fontSize: '0.72rem' }}>({stop.weightToCollectKg.toLocaleString()} kg)</span>
                      </div>
                      <ArrowRight size={14} color="#94a3b8" />
                    </div>
                  ))}

                  {/* Final Wholesale Destination */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#faf5ff',
                    border: '1.5px solid #9333ea',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    color: '#581c87'
                  }}>
                    <Building2 size={14} color="#9333ea" />
                    <span>Gran Mercado Mayorista de Huancayo</span>
                  </div>
                </div>
              </div>

              {/* White-Box Audit Accordion */}
              {routeEstimate.regressionAudit && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setShowAuditDetails(!showAuditDetails)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      backgroundColor: '#f8fafc',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#334155'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} color="#15803d" />
                      <span>Auditoría Matemática (Cátedra UPLA / MTC D.S. 020-2021)</span>
                      <span style={{ fontSize: '0.72rem', color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        R² = {routeEstimate.regressionAudit.rSquared.toFixed(3)}
                      </span>
                      {routeEstimate.regressionAudit.sampleSize > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#1e40af', backgroundColor: '#dbeafe', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          N = {routeEstimate.regressionAudit.sampleSize} viajes reales
                        </span>
                      )}
                    </div>
                    {showAuditDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showAuditDetails && (
                    <div style={{ padding: '14px', backgroundColor: '#ffffff', fontSize: '0.8rem', color: '#334155' }}>
                      <div style={{ marginBottom: '10px', padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#0f172a' }}>
                        {routeEstimate.regressionAudit.formula} + (12 min × {routeEstimate.orderedStops.length} paradas de estiba)
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Manejo base en carretera:</span>
                          <strong style={{ float: 'right', color: '#0f172a' }}>{routeEstimate.baseDrivingMinutes} min</strong>
                        </div>
                        <div style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Inercia/freno por carga ({(routeEstimate.totalWeightKg / 1000).toFixed(1)} t):</span>
                          <strong style={{ float: 'right', color: '#15803d' }}>+{routeEstimate.weightImpactMinutes} min</strong>
                        </div>
                        <div style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Congestión urbana en hora punta:</span>
                          <strong style={{ float: 'right', color: routeEstimate.rushHourImpactMinutes > 0 ? '#b45309' : '#64748b' }}>
                            +{routeEstimate.rushHourImpactMinutes} min
                          </strong>
                        </div>
                        <div style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Estiba y carga en chacras ({routeEstimate.orderedStops.length} paradas):</span>
                          <strong style={{ float: 'right', color: '#0f172a' }}>+{routeEstimate.stowageLoadingMinutes} min</strong>
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: '1.4' }}>
                        {routeEstimate.regressionAudit.interpretation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '24px', textAlign: 'center' }}>
              <Info size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#334155', margin: '0 0 4px 0' }}>
                Sin hoja de ruta activa
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Seleccione uno o varios lotes de cosecha a la izquierda para estimar el tiempo de viaje con Regresión Lineal y trazar la ruta óptima de recolección hacia Huancayo.
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
