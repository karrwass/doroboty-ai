import { useState, useSyncExternalStore, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
const query = "(max-width: 850px)";
function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
/** Filters inline on wide screens; a named full-height sheet (Base UI dialog) at ≤850px. */
export function ResponsivePanel({
  title,
  description,
  children,
  resultCount,
}: {
  title: string;
  description: string;
  children: ReactNode;
  resultCount: number;
}) {
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
  const [open, setOpen] = useState(false);
  if (!mobile) return children;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger className="ds-btn ds-btn-secondary">
        <SlidersHorizontal size={16} aria-hidden="true" />
        {title}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="ds-backdrop" />
        <DialogPrimitive.Popup className="ds reg-komfort ds-sheet">
          <div className="ds-sheet-head">
            <DialogPrimitive.Title render={<h2 />}>{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="ds-btn ds-btn-ghost ds-btn-icon"
              aria-label="Zamknij filtry"
            >
              <X size={18} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="ds-meta" style={{ margin: 0 }}>
            {description}
          </DialogPrimitive.Description>
          <div className="ds-sheet-body">{children}</div>
          <div className="ds-sheet-foot">
            <DialogPrimitive.Close className="ds-btn ds-btn-primary">
              Pokaż {resultCount} ofert
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
