import { Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm
}: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop confirm-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button data-testid="confirm-cancel" className="secondary" onClick={onCancel}>
            Abbrechen
          </button>
          <button data-testid="confirm-confirm" className="danger" onClick={onConfirm}>
            <Trash2 size={17} /> {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
