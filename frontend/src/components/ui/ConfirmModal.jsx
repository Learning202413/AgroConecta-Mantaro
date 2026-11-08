import Modal from './Modal';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="480px">
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: danger ? '#fee2e2' : '#dcfce7',
            color: danger ? '#dc2626' : '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {danger ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '10px 18px',
            backgroundColor: '#ffffff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: danger ? '#dc2626' : '#15803d',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '700',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: danger ? '0 2px 4px rgba(220, 38, 38, 0.2)' : '0 2px 4px rgba(21, 128, 61, 0.2)'
          }}
        >
          {isLoading ? (
            <>
              <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span>Procesando...</span>
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
}
