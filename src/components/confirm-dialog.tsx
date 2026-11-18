"use client";
import { AlertDialog } from "@base-ui/react/alert-dialog";

/** Confirmation that names what is lost (DoRoboty Design: destructive = secondary, raspberry text). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  pending,
  error,
  label = "Potwierdź",
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  pending: boolean;
  error?: string;
  label?: string;
}) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!pending) onOpenChange(value);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="ds-backdrop" />
        <AlertDialog.Popup className="ds ds-dialog">
          <AlertDialog.Title render={<h2 />}>{title}</AlertDialog.Title>
          <AlertDialog.Description render={<p className="ds-sentence" style={{ margin: 0 }} />}>
            {description}
          </AlertDialog.Description>
          {error && (
            <p role="alert" className="ds-error">
              {error}
            </p>
          )}
          <div className="ds-actions">
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-danger"
              disabled={pending}
              onClick={onConfirm}
            >
              {pending ? "Zapisywanie…" : label}
            </button>
            <AlertDialog.Close className="ds-btn ds-btn-secondary" disabled={pending}>
              Anuluj
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
