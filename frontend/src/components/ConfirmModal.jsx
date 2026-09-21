import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, title, message, confirmLabel, confirmVariant, onConfirm, onCancel }) {
  if (!open) return null;

  const btnClass =
    confirmVariant === 'danger'
      ? 'confirm-modal-btn confirm-modal-btn-danger'
      : 'confirm-modal-btn confirm-modal-btn-warning';

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onCancel} aria-label="Close">
          <X size={18} />
        </button>

        <div className="confirm-modal-icon">
          <AlertTriangle size={32} color={confirmVariant === 'danger' ? '#dc2626' : '#d97706'} />
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className={btnClass} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
