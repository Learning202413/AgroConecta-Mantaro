import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  icon: LeadingIcon,
  ariaLabel,
  disabled = false,
  dropDirection = 'down'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Normalize options to object format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.name || opt.id,
        label: opt.label !== undefined ? opt.label : opt.name || opt.cropType || String(opt.value),
        subtitle: opt.subtitle,
        icon: opt.icon,
        badge: opt.badge
      };
    }
    return {
      value: opt,
      label: String(opt),
      subtitle: null,
      icon: null,
      badge: null
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', userSelect: 'none' }}
      aria-label={ariaLabel}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          borderRadius: '8px',
          border: isOpen ? '1px solid #15803d' : '1px solid #cbd5e1',
          boxShadow: isOpen ? '0 0 0 2px rgba(21, 128, 61, 0.15)' : 'none',
          color: selectedOption ? '#0f172a' : '#94a3b8',
          fontSize: '0.88rem',
          fontWeight: '500',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {LeadingIcon && (
            <LeadingIcon size={16} color="#64748b" style={{ flexShrink: 0 }} />
          )}
          {selectedOption && selectedOption.icon && (
            <selectedOption.icon size={15} color="#15803d" style={{ flexShrink: 0 }} />
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption && selectedOption.badge && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                flexShrink: 0
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          color="#64748b"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '8px'
          }}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            ...(dropDirection === 'up'
              ? { bottom: 'calc(100% + 4px)', top: 'auto' }
              : { top: 'calc(100% + 4px)', bottom: 'auto' }),
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: dropDirection === 'up'
              ? '0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 -8px 10px -6px rgba(0, 0, 0, 0.05)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '6px',
            animation: 'fadeIn 0.12s ease-out'
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
              No hay opciones disponibles
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = selectedOption && String(selectedOption.value) === String(opt.value);
              const ItemIcon = opt.icon;

              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                    color: isSelected ? '#15803d' : '#334155',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '700' : '500',
                    transition: 'all 0.12s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {ItemIcon && <ItemIcon size={15} color={isSelected ? '#15803d' : '#64748b'} />}
                    <div>
                      <div>{opt.label}</div>
                      {opt.subtitle && (
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 'normal' }}>
                          {opt.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check size={15} color="#15803d" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
