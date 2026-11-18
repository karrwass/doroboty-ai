/**
 * DoRoboty Design React parts (register "Praca"). Anatomy follows
 * docs/design-system/doroboty-design/references/components.md. Styles: ./praca.css.
 */
import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Code2, Compass, Wrench } from "lucide-react";

/** Three bars of decreasing length: Build, Apply, Lead. */
export function BrandMark() {
  return (
    <svg className="ds-mark" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="4" width="20" height="4" rx="1" className="b1" />
      <rect x="2" y="10" width="14" height="4" rx="1" className="b2" />
      <rect x="2" y="16" width="8" height="4" rx="1" className="b3" />
    </svg>
  );
}
export function Wordmark() {
  return (
    <span>
      DoRoboty<span className="ai">.ai</span>
    </span>
  );
}

export type Step = { key: string; label: string };
/** Exactly one current step (yellow); earlier steps are done. */
export function StepBar({
  label,
  steps,
  current,
}: {
  label: string;
  steps: Step[];
  current: string;
}) {
  const index = steps.findIndex((s) => s.key === current);
  return (
    <>
      <p className="ds-meta ds-steps-label" id="ds-steps-label">
        {label}
      </p>
      <ol className="ds-steps" aria-labelledby="ds-steps-label">
        {steps.map((step, i) => (
          <li key={step.key} className="ds-step" aria-current={i === index ? "step" : undefined}>
            {i < index ? `✓ ${step.label}` : step.label}
            {i < index && <span className="ds-sr-only"> (zakończony)</span>}
          </li>
        ))}
      </ol>
    </>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "warn" | "pos" | "err" | "neutral";
  children: ReactNode;
}) {
  return (
    <span className="ds-pill" data-tone={tone}>
      {children}
    </span>
  );
}

const nbsp = " ";
/** "1 620,00" with a non-breaking space as the thousands separator (copy rules). */
export function formatPln(value: number, grosze = true) {
  const [whole, fraction] = value.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, nbsp);
  return grosze ? `${grouped},${fraction}` : grouped;
}
/** Large amount: grosze at 0.6em raised, currency on the baseline. */
export function Amount({ value, unit = "zł netto" }: { value: number; unit?: string }) {
  const [whole, fraction] = formatPln(value).split(",");
  return (
    <span className="ds-amount">
      {whole}
      <span className="gr">,{fraction}</span>
      <span className="unit">{unit}</span>
    </span>
  );
}

const categoryIcons = { build: Code2, apply: Wrench, lead: Compass } as const;
const categoryNames = { build: "Build", apply: "Apply", lead: "Lead" } as const;
/** Category = name + icon + mapped colour, never colour alone. */
export function CategoryTag({ category }: { category: keyof typeof categoryIcons }) {
  const Icon = categoryIcons[category];
  return (
    <li className="ds-tag" data-category={category}>
      <Icon strokeWidth={1.5} aria-hidden="true" />
      {categoryNames[category]}
    </li>
  );
}

/** Modal dialog with Base UI behaviour (focus trap, Escape, restore) and DS anatomy. */
export function DsDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="ds-backdrop" />
        <DialogPrimitive.Popup className="ds ds-dialog">
          <DialogPrimitive.Title render={<h2 />}>{title}</DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description render={<p className="ds-sentence" />}>
              {description}
            </DialogPrimitive.Description>
          )}
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export const DsDialogClose = DialogPrimitive.Close;

/** Sticky action bar shown only while the in-page actions are out of view. */
export function StickyActions({
  target,
  children,
}: {
  target: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return (
    <>
      <div className="ds-sticky-spacer" aria-hidden="true" />
      {show && <div className="ds-sticky">{children}</div>}
    </>
  );
}
