import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Truck,
  Wheat,
  Building2,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Cpu,
  Sprout,
  Zap,
  Scale
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();

  const [formData, setFormData] = useState({
    email: 'productor@agroconecta.pe',
    password: '1234'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const emailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleKeyDown = (e) => {
    const isCaps = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockActive(!!isCaps);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'El correo institucional o comercial es obligatorio.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Ingrese un formato de correo válido (ej. usuario@agroconecta.pe).';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 4) {
      newErrors.password = 'La contraseña debe contener al menos 4 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await login(formData.email.trim(), formData.password);
      if (result.success) {
        navigate('/routes');
      } else {
        setErrorMessage(result.message || 'Credenciales no válidas. Verifique su usuario o contraseña.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoProfiles = [
    {
      id: 1,
      fullName: 'Eusebio Poma',
      email: 'productor@agroconecta.pe',
      password: '1234',
      role: 'Producer',
      roleLabel: 'Productor Agrícola',
      icon: Wheat,
      townName: 'Chupaca',
      description: 'Lotes de Papa Canchán y consolidación de fletes en Chupaca.',
      badgeColor: '#15803d',
      badgeBg: '#dcfce7'
    },
    {
      id: 2,
      fullName: 'Carlos Quispe',
      email: 'transportista@agroconecta.pe',
      password: '1234',
      role: 'Carrier',
      roleLabel: 'Transportista Local',
      icon: Truck,
      townName: 'Camión W2A-841 (4,000 kg)',
      description: 'Hoja de ruta optimizada, recojo secuencial y balanza.',
      badgeColor: '#1e40af',
      badgeBg: '#dbeafe'
    },
    {
      id: 3,
      fullName: 'Administrador Mayorista',
      email: 'admin@agroconecta.pe',
      password: '1234',
      role: 'Admin',
      roleLabel: 'Mercado Mayorista',
      icon: Building2,
      townName: 'Huancayo (Puquio)',
      description: 'Monitoreo consolidado de fletes, trazabilidad y destino.',
      badgeColor: '#6b21a8',
      badgeBg: '#f3e8ff'
    }
  ];

  const handleSelectDemo = (p) => {
    loginAsDemo({
      id: p.id,
      fullName: p.fullName,
      email: p.email,
      role: p.role,
      phone: '964112233',
      townName: p.townName
    });
    navigate('/routes');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* 1. Panel de Marca (Brand Showcase) con fotografía real del Valle del Mantaro - 52% */}
      <aside style={{
        display: 'none',
        flex: '0 0 52%',
        background: 'linear-gradient(150deg, rgba(6, 78, 59, 0.90) 0%, rgba(6, 95, 70, 0.82) 45%, rgba(2, 44, 34, 0.94) 100%), url("/mantaro-valle.jpg") center/cover no-repeat',
        color: '#ffffff',
        padding: '56px 48px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }} className="brand-panel">
        <style>{`
          @media (min-width: 1024px) {
            .brand-panel { display: flex !important; }
          }
        `}</style>

        {/* Decorative background grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        {/* Top Institutional Header */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a7f3d0' }}>
              Universidad Peruana Los Andes
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
            <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#e2e8f0' }}>
              Track 2: Integración de Sistemas
            </span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '580px', margin: '40px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6ee7b7' }}>
              RETO: AGROCONECTA MANTARO
            </span>
            <div style={{ width: '40px', height: '2px', backgroundColor: '#34d399', borderRadius: '2px' }} />
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1.1, margin: '0 0 16px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            AgroConecta <br />
            <span style={{ color: '#6ee7b7' }}>Mantaro.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
            Plataforma corporativa de <strong>fletes compartidos</strong> y <strong>ruteo inteligente</strong> que vincula a pequeños productores del valle con transportistas locales hacia el Mercado Mayorista de Huancayo.
          </p>

          {/* Feature Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', padding: '6px', borderRadius: '8px', color: '#34d399' }}>
                <Truck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Ruteo Inteligente y Consolidación</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Algoritmo de clustering geoespacial para reducir hasta 35% del costo de transporte.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', padding: '6px', borderRadius: '8px', color: '#34d399' }}>
                <Scale size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Control de Capacidad en Tiempo Real</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Validación de peso por camión y prevención de sobrecarga en ruta.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', padding: '6px', borderRadius: '8px', color: '#34d399' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Trazabilidad y Entrega Segura</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Control de lotes desde la parcela hasta la descarga en el Mercado Mayorista.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Photo credit */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: '18px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#6ee7b7" />
            <span>Valle del Mantaro · Junín, Perú</span>
          </div>
          <span>Facultad de Ingeniería · UPLA 2026</span>
        </div>
      </aside>

      {/* 2. Panel del Formulario y Perfiles Demo - 48% */}
      <main style={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '36px 32px',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d'
              }}>
                <Sprout size={18} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AgroConecta Mantaro
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Iniciar Sesión
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              Ingrese con sus credenciales o seleccione un perfil de prueba.
            </p>
          </div>

          {/* Quick Demo Personas Bar for Hackathon Jury (Nielsen H7 / Shneiderman) */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#15803d" />
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Acceso Rápido para el Jurado
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                1 Clic
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoProfiles.map(p => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectDemo(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#15803d';
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: p.badgeBg,
                        color: p.badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                          {p.fullName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {p.roleLabel} • {p.townName}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Probar</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#94a3b8' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ padding: '0 12px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>
              o ingresar con credenciales
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Error Message Banner (Nielsen H9) */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CapsLock Warning (Donald Norman Slips / Nielsen H5) */}
          {capsLockActive && (
            <div style={{
              backgroundColor: '#fef9c3',
              border: '1px solid #fde047',
              color: '#854d0e',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={15} />
              <span>Bloqueo de Mayúsculas (Caps Lock) activo</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field with Icon & Semantic Accessibility */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Mail size={17} />
                </span>
                <input
                  id="login-email"
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="ej. productor@agroconecta.pe"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: errors.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    backgroundColor: errors.email ? '#fef2f2' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = '#15803d'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#cbd5e1'}
                />
              </div>
              {errors.email && (
                <span style={{ fontSize: '0.75rem', color: '#dc2626', display: 'block', marginTop: '4px' }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field with Icon and Eye toggle */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                  Contraseña
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Clave demo: 1234</span>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={17} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 38px',
                    borderRadius: '8px',
                    border: errors.password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    backgroundColor: errors.password ? '#fef2f2' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = '#15803d'}
                  onBlur={e => e.target.style.borderColor = errors.password ? '#ef4444' : '#cbd5e1'}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ fontSize: '0.75rem', color: '#dc2626', display: 'block', marginTop: '4px' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: isSubmitting ? '#86efac' : '#15803d',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(21, 128, 61, 0.2)'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Natural footer */}
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
            AgroConecta Mantaro · Plataforma de Comercialización Agrícola
          </div>
        </div>
      </main>
    </div>
  );
}
