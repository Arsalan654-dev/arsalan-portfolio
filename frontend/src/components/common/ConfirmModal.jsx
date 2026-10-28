'use client';
import Modal from './Modal';

const variantConfig = {
  danger: { bg: '#dc3545', icon: 'fa-exclamation-triangle' },
  warning: { bg: '#ffc107', icon: 'fa-exclamation-circle' },
  info: { bg: '#0dcaf0', icon: 'fa-info-circle' }
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  const config = variantConfig[variant] || variantConfig.danger;

  const footer = (
    <>
      <button
        className="btn"
        onClick={onClose}
        disabled={loading}
        style={{ background: 'var(--bs)', color: 'var(--tp)', border: '1px solid var(--bdr)' }}
      >
        {cancelText}
      </button>
      <button
        className="btn"
        onClick={onConfirm}
        disabled={loading}
        style={{ background: config.bg, color: '#fff', border: 'none' }}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            Processing...
          </>
        ) : confirmText}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm" footer={footer}>
      <div className="text-center py-2">
        <i className={`fas ${config.icon}`} style={{ fontSize: '3rem', color: config.bg, marginBottom: '0.5rem' }}></i>
        <h5 style={{ color: 'var(--tp)' }}>{title}</h5>
        <p style={{ color: 'var(--ts)', fontSize: '0.9rem' }}>{message}</p>
      </div>
    </Modal>
  );
}
