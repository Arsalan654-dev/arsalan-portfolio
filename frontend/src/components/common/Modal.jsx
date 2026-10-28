'use client';
import { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal-dialog modal-dialog-centered ${sizes[size] || ''}`}>
        <div className="modal-content" style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', borderRadius: '12px' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--bdr)' }}>
            <h5 className="modal-title" style={{ color: 'var(--tp)' }}>{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} style={{ filter: 'invert(0.7)' }}></button>
          </div>
          <div className="modal-body" style={{ color: 'var(--tp)' }}>
            {children}
          </div>
          {footer && (
            <div className="modal-footer" style={{ borderTop: '1px solid var(--bdr)' }}>
              {footer}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
