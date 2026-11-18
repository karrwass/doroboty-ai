/**
 * Next-draft publication flow (AIPH3 test of ideas A + B), DoRoboty Design register "Praca".
 * Anatomy: docs/design-system/doroboty-design/references/components.md.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Amount,
  DsDialog,
  DsDialogClose,
  StatusPill,
  StepBar,
  formatPln,
} from "@/design-system/components";
import {
  PUBLICATION_DAYS,
  PUBLICATION_PRICE_NET,
  VAT_RATE,
  addDays,
  blockerLabels,
  blockers,
  currentPerson,
  declineReasonLabels,
  grossPrice,
  previousResult,
  type Blocker,
  type PublicationResult,
  type PurchaseEvent,
  type PurchaseFlow,
  type State,
} from "./model";
import { usePrototype } from "./store";
import { NotFound } from "./shell";

const dayFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" });
const longDayFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDate = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const asDate = (value: string) => new Date(value.length === 10 ? `${value}T12:00:00` : value);
export const formatDay = (value: string) => dayFormat.format(asDate(value));
export const formatLongDay = (value: string) => longDayFormat.format(asDate(value));
export const formatShortDate = (value: string) => shortDate.format(asDate(value));
export const formatMoney = (value: number) => `${formatPln(value)} zł`;
/** Local calendar day as YYYY-MM-DD, matching the native date input. */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function isDecisionDay(flow: PurchaseFlow) {
  return (
    !flow.paidAt &&
    flow.reminder &&
    (flow.decisionDayReached || (!!flow.decisionDate && flow.decisionDate <= today()))
  );
}
export function approvalUrl(token: string) {
  return `${window.location.origin}${window.location.pathname}#/zgoda/${token}`;
}
export function requester(state: State, flow: PurchaseFlow) {
  return state.people.find((x) => x.role === "employer" && x.companyId === flow.companyId);
}
const activeUntil = () => formatLongDay(addDays(new Date().toISOString(), PUBLICATION_DAYS));
function daysSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}
function since(iso: string) {
  const days = daysSince(iso);
  return days === 0 ? "od dziś" : days === 1 ? "od 1 dnia" : `od ${days} dni`;
}

/** Employer flow steps (skill: whose turn it is now). */
export const publicationSteps = [
  { key: "draft", label: "Draft" },
  { key: "request", label: "Wniosek o zgodę" },
  { key: "decision", label: "Decyzja" },
  { key: "publication", label: "Publikacja" },
];
/** Current step, or null when the draft does not need anyone's approval. */
export function currentStep(flow: PurchaseFlow) {
  const status = flow.request?.status;
  if (flow.paidAt || status === "approved") return "publication";
  if (status === "opened") return "decision";
  if (status === "ready" || status === "declined") return "request";
  if (flow.blocker === "budget" || flow.blocker === "role") return "request";
  return null;
}

export const requestStatus: Record<
  NonNullable<PurchaseFlow["request"]>["status"],
  { label: string; tone: "warn" | "pos" | "err" | "neutral" }
> = {
  ready: { label: "Do wysłania", tone: "neutral" },
  opened: { label: "Czeka na decyzję", tone: "warn" },
  approved: { label: "Zatwierdzono", tone: "pos" },
  declined: { label: "Odrzucono", tone: "err" },
};
const eventLabels: Record<PurchaseEvent["type"], string> = {
  draft_saved: "Draft zapisany",
  reason_given: "Podano, co wstrzymuje publikację",
  request_created: "Utworzono wniosek o zgodę",
  request_opened: "Osoba zatwierdzająca otworzyła wniosek",
  request_approved: "Zakup zatwierdzony",
  request_declined: "Odpowiedź: nie teraz",
  decision_day: "Dzień decyzji (symulacja)",
  date_moved: "Przesunięto dzień decyzji",
  paid: "Opłacono i opublikowano",
};

/** Ledger: result of the previous publication, with its source caption. */
export function PreviousResultLedger({
  result,
  title,
  expiryAt,
}: {
  result: PublicationResult;
  title: string;
  expiryAt: string;
}) {
  const contact =
    result.medianFirstContactDays === null
      ? "—"
      : `${new Intl.NumberFormat("pl-PL").format(result.medianFirstContactDays)} dnia`;
  return (
    <>
      <p className="ds-meta" style={{ margin: "0 0 var(--space-3)" }}>
        {title} · {formatShortDate(result.purchasedAt)}–{formatShortDate(expiryAt)}
      </p>
      <dl className="ds-ledger">
        <div>
          <dt>Aplikacje</dt>
          <dd>{result.applications}</dd>
        </div>
        <div>
          <dt>
            Pierwsze rozmowy
            <span className="ds-meta">
              {result.interviews} z {result.applications} aplikacji
            </span>
          </dt>
          <dd>{result.interviews}</dd>
        </div>
        <div>
          <dt>
            Kolejny etap
            <span className="ds-meta">
              {result.continued === 0
                ? "nikt nie przeszedł dalej po rozmowie"
                : `${result.continued} z ${result.interviews} rozmów, przejście dalej, nie zatrudnienie`}
            </span>
          </dt>
          <dd>{result.continued}</dd>
        </div>
        <div>
          <dt>Pierwszy kontakt z kandydatem (mediana)</dt>
          <dd>{contact}</dd>
        </div>
      </dl>
      <p className="ds-caption">
        ogłoszenie i firma: PRZYKŁAD · liczby: {result.source.replace(/^Dane przykładowe z /, "")}
      </p>
    </>
  );
}

/** Idea B: what holds the draft and when the decision is expected. */
function DraftReasonDialog({
  open,
  onOpenChange,
  flow,
  mode,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow: PurchaseFlow;
  mode: "reason" | "date";
  onSaved: (blocker: Blocker | undefined) => void;
}) {
  const { run } = usePrototype();
  const [blocker, setBlocker] = useState<Blocker | "">(flow.blocker ?? "");
  const [date, setDate] = useState(flow.decisionDate ?? "");
  const [error, setError] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "reason" && !blocker) return setError("Wybierz, co wstrzymuje publikację.");
    if (!date || date < today()) return setError("Wybierz dzień decyzji od dziś wzwyż.");
    const ok =
      mode === "reason"
        ? run({
            type: "draft_reason",
            jobId: flow.jobId,
            blocker: blocker as Blocker,
            decisionDate: date,
          })
        : run({ type: "move_date", jobId: flow.jobId, decisionDate: date });
    if (ok) {
      onOpenChange(false);
      onSaved(mode === "reason" ? (blocker as Blocker) : undefined);
    }
  }
  return (
    <DsDialog
      open={open}
      onOpenChange={(value) => {
        setError("");
        onOpenChange(value);
      }}
      title={mode === "reason" ? "Co wstrzymuje publikację?" : "Kiedy spodziewasz się decyzji?"}
      description={
        mode === "reason"
          ? "Draft jest zapisany. Jeśli podasz dzień decyzji, tego dnia wrócimy z gotowym ogłoszeniem."
          : "Tego dnia wrócimy z gotowym ogłoszeniem do opublikowania."
      }
    >
      <form className="ds-form" onSubmit={save} noValidate>
        {mode === "reason" && (
          <fieldset className="ds-choices">
            <legend className="ds-sr-only">Co wstrzymuje publikację?</legend>
            {blockers.map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name="blocker"
                  value={value}
                  checked={blocker === value}
                  onChange={() => {
                    setBlocker(value);
                    setError("");
                  }}
                />
                {blockerLabels[value]}
              </label>
            ))}
          </fieldset>
        )}
        <label className="ds-field">
          <span>Kiedy spodziewasz się decyzji?</span>
          <Input
            type="date"
            min={today()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError("");
            }}
          />
        </label>
        {error && (
          <p role="alert" className="ds-error">
            {error}
          </p>
        )}
        <div className="ds-actions">
          <button type="submit" className="ds-btn ds-btn-primary">
            {mode === "reason" ? "Przypomnij mi tego dnia" : "Przesuń datę"}
          </button>
          <DsDialogClose className="ds-link" type="button">
            {mode === "reason" ? "Pomiń" : "Anuluj"}
          </DsDialogClose>
        </div>
      </form>
    </DsDialog>
  );
}

function PayDialog({
  open,
  onOpenChange,
  flow,
  title,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flow: PurchaseFlow;
  title: string;
  onPaid: () => void;
}) {
  const { run } = usePrototype();
  const vat = Math.round(PUBLICATION_PRICE_NET * VAT_RATE * 100) / 100;
  return (
    <DsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Opublikuj i zapłać"
      description={
        <>
          Jeśli zapłacisz teraz, ogłoszenie <strong>{title}</strong> będzie aktywne do{" "}
          {activeUntil()}.
        </>
      }
    >
      <dl className="ds-ledger">
        <div>
          <dt>Ogłoszenie pojedyncze · {PUBLICATION_DAYS} dni</dt>
          <dd>{formatMoney(PUBLICATION_PRICE_NET)} netto</dd>
        </div>
        <div>
          <dt>VAT {Math.round(VAT_RATE * 100)}%</dt>
          <dd>{formatMoney(vat)}</dd>
        </div>
        <div className="total">
          <dt>Razem</dt>
          <dd>{formatMoney(grossPrice())} brutto</dd>
        </div>
      </dl>
      <p className="ds-caption">
        cena: jak single_ad w purchases.csv · płatność: DEMO, nic nie zostanie pobrane
      </p>
      <div className="ds-actions">
        <button
          type="button"
          className="ds-btn ds-btn-primary"
          onClick={() => {
            if (run({ type: "pay_and_publish", jobId: flow.jobId })) {
              onOpenChange(false);
              onPaid();
            }
          }}
        >
          Zapłać {formatMoney(grossPrice())} i opublikuj
        </button>
        <DsDialogClose className="ds-btn ds-btn-secondary" type="button">
          Wróć do draftu
        </DsDialogClose>
      </div>
    </DsDialog>
  );
}

/** Idea B, decision day: the ready draft comes back with publish-and-pay in one step. */
export function DecisionDayCard({
  flow,
  title,
  onPay,
  onMoveDate,
}: {
  flow: PurchaseFlow;
  title: string;
  onPay?: () => void;
  onMoveDate?: () => void;
}) {
  const base = `/app/oferty/${flow.jobId}/publikacja`;
  return (
    <section className="ds-card" aria-labelledby={`reminder-${flow.jobId}`}>
      <div className="ds-card-head">
        <h2 id={`reminder-${flow.jobId}`}>Dzień decyzji</h2>
        <StatusPill tone="warn">Czeka na Ciebie</StatusPill>
      </div>
      <p className="ds-sentence">
        Dziś miała zapaść decyzja o roli <strong>{title}</strong>. Draft jest gotowy. Jeśli
        opublikujesz dziś, ogłoszenie będzie aktywne do {activeUntil()}.
      </p>
      <div className="ds-amount-row">
        <Amount value={PUBLICATION_PRICE_NET} />
        <span className="ds-meta">ogłoszenie pojedyncze · {PUBLICATION_DAYS} dni</span>
      </div>
      <div className="ds-actions">
        {onPay ? (
          <button type="button" className="ds-btn ds-btn-primary" onClick={onPay}>
            Opublikuj i zapłać
          </button>
        ) : (
          <Link className="ds-btn ds-btn-primary" to={`${base}?platnosc=1`}>
            Opublikuj i zapłać
          </Link>
        )}
        {onMoveDate ? (
          <button type="button" className="ds-btn ds-btn-secondary" onClick={onMoveDate}>
            Przesuń datę
          </button>
        ) : (
          <Link className="ds-btn ds-btn-secondary" to={`${base}?termin=1`}>
            Przesuń datę
          </Link>
        )}
      </div>
    </section>
  );
}

export function dueFlows(state: State, companyId: string | undefined) {
  return state.purchaseFlows.filter((flow) => flow.companyId === companyId && isDecisionDay(flow));
}

/** Reminders for the signed-in employer, shown on the dashboard and the job list. */
export function DecisionDayNotices() {
  const { state } = usePrototype();
  const person = currentPerson(state);
  const due = dueFlows(state, person?.companyId);
  if (!due.length) return null;
  return (
    <div className="ds-stack" style={{ marginBottom: "var(--space-5)" }}>
      {due.map((flow) => (
        <DecisionDayCard
          key={flow.jobId}
          flow={flow}
          title={state.jobs.find((x) => x.id === flow.jobId)?.title ?? ""}
        />
      ))}
    </div>
  );
}

/** One-line status of a draft for lists. */
export function draftStatusText(flow: PurchaseFlow) {
  return [
    flow.request
      ? `wniosek: ${requestStatus[flow.request.status].label.toLowerCase()}`
      : flow.blocker
        ? blockerLabels[flow.blocker].toLowerCase()
        : "gotowy do publikacji",
    flow.decisionDate && !flow.paidAt ? `decyzja ${formatShortDate(flow.decisionDate)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/** The request card from the requester's side (sentence with consequence + amount). */
function RequestCard({
  flow,
  title,
  primary,
  onAsk,
  onPay,
  onMoveDate,
  headingRef,
}: {
  flow: PurchaseFlow;
  title: string;
  primary: "ask" | "copy" | "pay" | null;
  onAsk: () => void;
  onPay: () => void;
  onMoveDate: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const request = flow.request;
  // The approver name is free text, so it is never declined; it goes in brackets.
  const named = request?.approver ? (
    <>
      {" "}
      (<strong>{request.approver}</strong>)
    </>
  ) : null;
  const [copied, setCopied] = useState("");
  const status = request ? requestStatus[request.status] : null;
  const url = request ? approvalUrl(request.token) : "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("Link skopiowany. Wklej go w mailu lub na czacie.");
    } catch {
      setCopied("Nie udało się skopiować. Zaznacz link i skopiuj go ręcznie.");
    }
  }
  const btn = (key: "ask" | "copy" | "pay") =>
    `ds-btn ${primary === key ? "ds-btn-primary" : "ds-btn-secondary"}`;
  let sentence;
  if (!request && (flow.blocker === "budget" || flow.blocker === "role"))
    sentence = (
      <>
        Publikacja ogłoszenia <strong>{title}</strong> czeka na zgodę. Jeśli poprosisz o nią teraz,
        osoba od budżetu dostanie jedną stronę z wynikiem poprzedniego ogłoszenia, podglądem i ceną.
      </>
    );
  else if (!request)
    sentence = (
      <>
        Draft <strong>{title}</strong> jest gotowy. Jeśli opublikujesz dziś, ogłoszenie będzie
        aktywne do {activeUntil()}.
      </>
    );
  else if (request.status === "ready")
    sentence = (
      <>
        Wniosek o publikację <strong>{title}</strong> jest gotowy, ale jeszcze nikt go nie otworzył.
        Wyślij link osobie, która zatwierdza budżet{named}. Jeśli zatwierdzi, opublikujesz
        ogłoszenie jednym kliknięciem.
      </>
    );
  else if (request.status === "opened")
    sentence = (
      <>
        Wniosek o publikację <strong>{title}</strong> czeka na decyzję osoby zatwierdzającej
        {named} {since(request.openedAt ?? request.createdAt)}. Jeśli zatwierdzi, opublikujesz
        ogłoszenie jednym kliknięciem.
      </>
    );
  else if (request.status === "approved")
    sentence = (
      <>
        Zakup zatwierdzony {formatDay(request.decidedAt!)}. Jeśli opublikujesz dziś, ogłoszenie{" "}
        <strong>{title}</strong> będzie aktywne do {activeUntil()}.
      </>
    );
  else
    sentence = (
      <>
        Publikacja <strong>{title}</strong> została odłożona:{" "}
        {declineReasonLabels[request.declineReason!].toLowerCase()}
        {request.declineNote ? ` („${request.declineNote}”)` : ""}. Draft zostaje zapisany.
      </>
    );
  return (
    <section className="ds-card" aria-labelledby="request-title">
      <div className="ds-card-head">
        <h2 id="request-title" ref={headingRef} tabIndex={-1}>
          {request ? "Twój wniosek o zgodę" : "Publikacja"}
        </h2>
        {status ? (
          <StatusPill tone={status.tone}>
            {status.label}
            {request?.status === "opened"
              ? ` · ${since(request.openedAt!).replace("od ", "")}`
              : ""}
          </StatusPill>
        ) : (
          <StatusPill tone="neutral">Draft</StatusPill>
        )}
      </div>
      <p className="ds-sentence">{sentence}</p>
      <div className="ds-amount-row">
        <Amount value={PUBLICATION_PRICE_NET} />
        <span className="ds-meta">
          {request ? `wniosek z ${formatShortDate(request.createdAt)}` : `${PUBLICATION_DAYS} dni`}
        </span>
      </div>
      {request && (request.status === "ready" || request.status === "opened") && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <label className="ds-field">
            <span>Link do wniosku (bez logowania)</span>
            <Input readOnly value={url} aria-label="Link do wniosku" />
          </label>
          <p role="status" className="ds-meta" style={{ margin: "var(--space-2) 0 0" }}>
            {copied}
          </p>
        </div>
      )}
      <div className="ds-actions">
        {!request && (
          <button type="button" className={btn("ask")} onClick={onAsk}>
            Poproś o zgodę
          </button>
        )}
        {request && (request.status === "ready" || request.status === "opened") && (
          <button type="button" className={btn("copy")} onClick={copy}>
            Kopiuj link do wniosku
          </button>
        )}
        {request?.status === "declined" && (
          <>
            <button type="button" className="ds-btn ds-btn-secondary" onClick={onAsk}>
              Utwórz nowy wniosek
            </button>
            <button type="button" className="ds-btn ds-btn-secondary" onClick={onMoveDate}>
              Przesuń datę
            </button>
          </>
        )}
        {request?.status !== "declined" && (
          <button type="button" className={btn("pay")} onClick={onPay}>
            Opublikuj i zapłać
          </button>
        )}
        {request && (
          <a className="ds-link" href={url} target="_blank" rel="noreferrer">
            Zobacz wniosek
          </a>
        )}
      </div>
      <p className="ds-caption">cena: jak single_ad w purchases.csv · płatność: DEMO</p>
    </section>
  );
}

function ComposeRequest({
  flow,
  title,
  onDone,
}: {
  flow: PurchaseFlow;
  title: string;
  onDone: () => void;
}) {
  const { state, run } = usePrototype();
  const previous = previousResult(state, flow);
  const [approver, setApprover] = useState("");
  const [message, setMessage] = useState(
    previous
      ? `Kolejne ogłoszenie „${title}” jest gotowe. Poprzednie dało ${previous.result.applications} aplikacji i ${previous.result.continued} ${previous.result.continued === 1 ? "osobę" : "osób"} w kolejnym etapie. Czy zatwierdzasz zakup publikacji?`
      : "",
  );
  return (
    <section className="ds-card" aria-labelledby="compose-title">
      <div className="ds-card-head">
        <h2 id="compose-title">Wniosek o zgodę</h2>
      </div>
      <p className="ds-sentence">
        Osoba od budżetu zobaczy jedną stronę: wynik poprzedniego ogłoszenia, podgląd draftu i cenę.
        Nie musi zakładać konta.
      </p>
      <form
        className="ds-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (run({ type: "request_approval", jobId: flow.jobId, approver, message })) onDone();
        }}
      >
        <label className="ds-field">
          <span>Kto zatwierdza zakup? (opcjonalnie)</span>
          <Input
            maxLength={200}
            value={approver}
            placeholder="np. Ewa, dyrektorka operacji"
            onChange={(e) => setApprover(e.target.value)}
          />
        </label>
        <label className="ds-field">
          <span>Wiadomość dla tej osoby</span>
          <Textarea
            maxLength={2000}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <div className="ds-actions">
          <button type="submit" className="ds-btn ds-btn-primary">
            Utwórz wniosek
          </button>
          <button type="button" className="ds-link" onClick={onDone}>
            Anuluj
          </button>
        </div>
      </form>
    </section>
  );
}

export function DraftPublicationPage() {
  const { id } = useParams();
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const flow = state.purchaseFlows.find((x) => x.jobId === id && x.companyId === person.companyId);
  const job = state.jobs.find((x) => x.id === id && x.companyId === person.companyId);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const requestHeading = useRef<HTMLHeadingElement>(null);
  const focusRequest = useRef(false);
  // Links from the editor and reminders ask this page to open one dialog once it is shown.
  const [requested] = useState(() =>
    params.get("zapisano") === "1" && !flow?.blocker
      ? "reason"
      : params.get("termin") === "1"
        ? "date"
        : params.get("platnosc") === "1"
          ? "pay"
          : null,
  );
  useEffect(() => {
    if (!requested) return;
    const timer = window.setTimeout(() => {
      if (requested === "reason") setReasonOpen(true);
      else if (requested === "date") setDateOpen(true);
      else setPayOpen(true);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [requested]);
  useEffect(() => {
    if (params.toString()) setParams({}, { replace: true });
  }, [params, setParams]);
  useEffect(() => {
    if (focusRequest.current) {
      focusRequest.current = false;
      requestHeading.current?.focus();
    }
  });
  if (!flow || !job) return <NotFound />;
  const previous = previousResult(state, flow);
  const dueToday = isDecisionDay(flow);
  const step = currentStep(flow);

  const back = (
    <Link className="ds-back" to="/app/oferty">
      ← Wróć do ogłoszeń
    </Link>
  );
  if (flow.paidAt && job.publicationStatus === "published")
    return (
      <>
        {back}
        <h1 className="ds-title">{job.title}</h1>
        <StepBar label="Etapy publikacji" steps={publicationSteps} current="publication" />
        <section className="ds-card" aria-labelledby="done-title">
          <div className="ds-card-head">
            <h2 id="done-title">Ogłoszenie jest opublikowane</h2>
            <StatusPill tone="pos">Opublikowane</StatusPill>
          </div>
          <p className="ds-sentence">
            Kandydaci widzą ogłoszenie do {formatLongDay(job.expiryAt)}. Zapłacono{" "}
            {formatMoney(grossPrice())} brutto {formatDay(flow.paidAt)}.
          </p>
          <div className="ds-actions">
            <Link className="ds-btn ds-btn-primary" to={`/oferty/${job.slug}`}>
              Zobacz ogłoszenie
            </Link>
            <Link className="ds-btn ds-btn-secondary" to="/app/oferty">
              Wróć do ogłoszeń
            </Link>
          </div>
          <p className="ds-caption">płatność: DEMO</p>
        </section>
        <p role="status" className="ds-sr-only">
          {announcement}
        </p>
      </>
    );

  // One primary per view: the action that moves the process forward for the recruiter.
  const request = flow.request;
  const primary: "ask" | "copy" | "pay" | null = dueToday
    ? null
    : !request
      ? flow.blocker === "budget" || flow.blocker === "role"
        ? "ask"
        : "pay"
      : request.status === "ready"
        ? "copy"
        : request.status === "approved"
          ? "pay"
          : null;

  return (
    <>
      {back}
      <div className="ds-page-head">
        <div>
          <p className="ds-meta" style={{ margin: 0 }}>
            Draft ogłoszenia · zapisany{" "}
            {formatShortDate(flow.events.at(-1)?.at ?? new Date().toISOString())}
          </p>
          <h1 className="ds-title">{job.title}</h1>
        </div>
        <Link className="ds-btn ds-btn-secondary" to={`/app/oferty/${job.id}`}>
          Edytuj draft
        </Link>
      </div>
      {step && <StepBar label="Etapy publikacji" steps={publicationSteps} current={step} />}
      {dueToday && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <DecisionDayCard
            flow={flow}
            title={job.title}
            onPay={() => setPayOpen(true)}
            onMoveDate={() => setDateOpen(true)}
          />
        </div>
      )}
      <div className="ds-grid2">
        <div className="ds-stack">
          {composing ? (
            <ComposeRequest flow={flow} title={job.title} onDone={() => setComposing(false)} />
          ) : (
            <RequestCard
              flow={flow}
              title={job.title}
              primary={primary}
              onAsk={() => setComposing(true)}
              onPay={() => setPayOpen(true)}
              onMoveDate={() => setDateOpen(true)}
              headingRef={requestHeading}
            />
          )}
          <section className="ds-card" aria-labelledby="reason-title">
            <div className="ds-card-head">
              <h2 id="reason-title">Co wstrzymuje publikację</h2>
            </div>
            {request?.status === "approved" ? (
              <p className="ds-sentence">Zgoda na zakup jest. Nic już nie wstrzymuje publikacji.</p>
            ) : flow.blocker ? (
              <p className="ds-sentence">
                <strong>{blockerLabels[flow.blocker]}.</strong>{" "}
                {flow.decisionDate &&
                  `Przypomnimy Ci ${formatLongDay(flow.decisionDate)}. Draft będzie gotowy do publikacji jednym kliknięciem.`}
              </p>
            ) : (
              <p className="ds-sentence">
                Nie podano powodu. Jeśli publikacja musi poczekać, podaj powód i dzień decyzji, a
                tego dnia wrócimy z gotowym draftem.
              </p>
            )}
            {request?.status !== "approved" && (
              <div className="ds-actions" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className="ds-btn ds-btn-secondary ds-btn-sm"
                  onClick={() => setReasonOpen(true)}
                >
                  {flow.blocker ? "Zmień powód" : "Podaj powód"}
                </button>
                {flow.decisionDate && (
                  <button
                    type="button"
                    className="ds-btn ds-btn-secondary ds-btn-sm"
                    onClick={() => setDateOpen(true)}
                  >
                    Przesuń datę
                  </button>
                )}
              </div>
            )}
          </section>
          <section className="ds-card" aria-labelledby="history-title">
            <div className="ds-card-head">
              <h2 id="history-title">Historia</h2>
            </div>
            <ol className="ds-list ds-timeline">
              {[...flow.events].reverse().map((event, index) => (
                <li key={index}>
                  <span>{eventLabels[event.type]}</span>
                  <time dateTime={event.at}>
                    {new Intl.DateTimeFormat("pl-PL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(event.at))}
                  </time>
                  {event.note && <span className="ds-meta">{event.note}</span>}
                </li>
              ))}
            </ol>
          </section>
          {flow.reminder && !dueToday && (
            <aside className="ds-info" aria-label="Symulacja">
              <span>
                <strong>Tylko w prototypie:</strong> zobacz, co pokażemy w dniu decyzji.
              </span>
              <button
                type="button"
                className="ds-btn ds-btn-secondary ds-btn-sm"
                onClick={() => {
                  if (run({ type: "decision_day", jobId: flow.jobId }))
                    setAnnouncement("Symulacja: nadszedł dzień decyzji.");
                }}
              >
                Przejdź do dnia decyzji
              </button>
            </aside>
          )}
        </div>
        {previous && (
          <section className="ds-card" aria-labelledby="previous-title">
            <div className="ds-card-head">
              <h2 id="previous-title">Wynik poprzedniego ogłoszenia</h2>
              <StatusPill tone="neutral">Wygasło</StatusPill>
            </div>
            <PreviousResultLedger
              result={previous.result}
              title={previous.job.title}
              expiryAt={previous.job.expiryAt}
            />
          </section>
        )}
      </div>
      <DraftReasonDialog
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        flow={flow}
        mode="reason"
        onSaved={(blocker) => {
          setAnnouncement("Zapisano. Przypomnimy Ci w dniu decyzji.");
          if (blocker === "budget" || blocker === "role") focusRequest.current = true;
        }}
      />
      <DraftReasonDialog
        open={dateOpen}
        onOpenChange={setDateOpen}
        flow={flow}
        mode="date"
        onSaved={() => setAnnouncement("Przesunięto dzień decyzji.")}
      />
      <PayDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        flow={flow}
        title={job.title}
        onPaid={() => {
          setAnnouncement("Ogłoszenie jest opublikowane.");
          navigate(`/app/oferty/${job.id}/publikacja`, { replace: true });
        }}
      />
      <p role="status" className="ds-sr-only">
        {announcement}
      </p>
    </>
  );
}
