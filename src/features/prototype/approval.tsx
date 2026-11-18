/**
 * Idea A: one page for the person who approves the purchase (DoRoboty Design, register "Praca").
 * Opened from a link the recruiter forwards; the approver needs no persona or account here.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { Textarea } from "@/components/ui/textarea";
import {
  Amount,
  BrandMark,
  CategoryTag,
  StatusPill,
  StepBar,
  StickyActions,
  Wordmark,
} from "@/design-system/components";
import { contractLabels, remoteLabels, seniorityLabels } from "@/features/jobs/presentation";
import type { Job } from "@/features/jobs/types";
import {
  PUBLICATION_DAYS,
  PUBLICATION_PRICE_NET,
  declineReasonLabels,
  declineReasons,
  flowByToken,
  grossPrice,
  previousResult,
  type DeclineReason,
} from "./model";
import { usePrototype } from "./store";
import {
  PreviousResultLedger,
  formatDay,
  formatMoney,
  publicationSteps,
  requester,
} from "./purchase";

/** "21–25 tys. zł brutto · UoP" (copy rules: en dash, no spaces). */
function salaryTag(job: Job) {
  if (job.salaryMin === undefined && job.salaryMax === undefined) return "Nie podano widełek";
  const k = (v: number) => new Intl.NumberFormat("pl-PL").format(v / 1000);
  const range = [job.salaryMin, job.salaryMax]
    .filter((x): x is number => x !== undefined)
    .map(k)
    .join("–");
  const kind = job.salaryKind === "net" ? "netto" : "brutto";
  return `${range} tys. zł ${kind} · ${contractLabels[job.contract]}`;
}

export function ApprovalPage() {
  const { token = "" } = useParams();
  const { state, run, error } = usePrototype();
  const flow = flowByToken(state, token);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState<DeclineReason | "">("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const result = useRef<HTMLHeadingElement>(null);
  const main = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const decidedHere = useRef(false);
  const exists = !!flow;
  useEffect(() => {
    if (exists && !opened.current) {
      opened.current = true;
      run({ type: "request_opened", token });
    }
    // run is recreated on every render; opening is recorded once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exists, token]);
  useEffect(() => {
    document.title = "Wniosek o publikację — DoRoboty.ai";
    main.current?.focus({ preventScroll: true });
  }, []);
  const status = flow?.request?.status;
  useEffect(() => {
    if (decidedHere.current && (status === "approved" || status === "declined")) {
      decidedHere.current = false;
      result.current?.focus();
    }
  }, [status]);

  const job = flow && state.jobs.find((x) => x.id === flow.jobId);
  const company = flow && state.companies.find((x) => x.id === flow.companyId);
  const previous = flow && previousResult(state, flow);
  const request = flow?.request;
  const author = flow && requester(state, flow);
  const firstName = author?.name.split(" ")[0] ?? "Rekruter";

  function decide(decision: "approved" | "declined") {
    decidedHere.current = run({
      type: "request_decision",
      token,
      decision,
      reason: reason || undefined,
      note,
    });
  }
  function decline(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason) return setFormError("Wybierz powód, żeby rekruter wiedział, co dalej.");
    decide("declined");
  }
  const decided = request?.status === "approved" || request?.status === "declined";

  return (
    <div className="ds ds-canvas">
      <header className="ds-appbar ds-on-dark">
        <Link className="ds-brand" to="/" aria-label="Strona główna DoRoboty.ai">
          <BrandMark />
          <Wordmark />
        </Link>
        <span className="ds-sep" aria-hidden="true" />
        <span className="ds-prod">Wniosek o zgodę</span>
        {company && (
          <div className="ds-right">
            <span className="ds-org">
              {company.name} <span className="ds-label">PRZYKŁAD</span>
            </span>
          </div>
        )}
      </header>
      <main
        id="main"
        ref={main}
        tabIndex={-1}
        className="ds-main"
        style={{ maxWidth: 1104, margin: "0 auto" }}
      >
        {!flow || !job || !company || !request || !previous ? (
          <section className="ds-card" style={{ maxWidth: 640 }}>
            <h1 className="ds-title">Nie znaleziono wniosku</h1>
            <p className="ds-sentence">
              Ten link nie prowadzi do aktualnego wniosku. Mógł zostać zastąpiony nowym. Poproś
              osobę, która go wysłała, o aktualny link.
            </p>
          </section>
        ) : (
          <>
            <h1 className="ds-title">Wniosek o publikację</h1>
            <p className="ds-lead">
              Od: {author?.name}, {author?.headline} (PRZYKŁAD). Decyzja zajmie około minuty.
            </p>
            <StepBar
              label={`Draft ${job.title}: etapy publikacji`}
              steps={publicationSteps}
              current={request.status === "approved" ? "publication" : "decision"}
            />
            <div className="ds-grid2">
              <div className="ds-stack">
                <section className="ds-card" aria-labelledby="decision-title">
                  <div className="ds-card-head">
                    <h2 id="decision-title" ref={result} tabIndex={-1}>
                      {request.status === "approved"
                        ? "Zatwierdzono zakup"
                        : request.status === "declined"
                          ? "Odpowiedź wysłana: nie teraz"
                          : "Twoja decyzja"}
                    </h2>
                    {request.status === "approved" ? (
                      <StatusPill tone="pos">Zatwierdzono</StatusPill>
                    ) : request.status === "declined" ? (
                      <StatusPill tone="err">Odrzucono</StatusPill>
                    ) : (
                      <StatusPill tone="warn">Czeka na Twoją decyzję</StatusPill>
                    )}
                  </div>
                  <p className="ds-sentence">
                    {request.status === "approved" ? (
                      <>
                        Zgoda zapisana {formatDay(request.decidedAt!)}. {firstName} widzi ją w
                        panelu firmy i może opublikować ogłoszenie <strong>{job.title}</strong>.
                      </>
                    ) : request.status === "declined" ? (
                      <>
                        Powód: {declineReasonLabels[request.declineReason!].toLowerCase()}.{" "}
                        {firstName} zobaczy go w panelu firmy, a draft zostanie zapisany.
                      </>
                    ) : (
                      <>
                        <strong>{author?.name}</strong> prosi o publikację ogłoszenia{" "}
                        <strong>{job.title}</strong>. Jeśli zatwierdzisz, {firstName} opublikuje je
                        i zapłaci w panelu firmy, a ogłoszenie będzie aktywne przez{" "}
                        {PUBLICATION_DAYS} dni.
                      </>
                    )}
                  </p>
                  <div className="ds-amount-row">
                    <Amount value={PUBLICATION_PRICE_NET} />
                    <span className="ds-meta">{formatMoney(grossPrice())} brutto z VAT 23%</span>
                  </div>
                  {request.message && !decided && (
                    <blockquote className="ds-quote" style={{ marginTop: "var(--space-4)" }}>
                      <p>„{request.message}”</p>
                      <p className="ds-meta">— {author?.name}</p>
                    </blockquote>
                  )}
                  {!decided &&
                    (!declining ? (
                      <div className="ds-actions" ref={actions}>
                        <button
                          type="button"
                          className="ds-btn ds-btn-primary"
                          onClick={() => decide("approved")}
                        >
                          Zatwierdzam publikację
                        </button>
                        <button
                          type="button"
                          className="ds-btn ds-btn-secondary"
                          onClick={() => setDeclining(true)}
                        >
                          Nie teraz
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={decline}
                        className="ds-form"
                        noValidate
                        style={{ marginTop: "var(--space-4)" }}
                      >
                        <fieldset className="ds-choices">
                          <legend>Dlaczego nie teraz?</legend>
                          {declineReasons.map((value) => (
                            <label key={value}>
                              <input
                                type="radio"
                                name="reason"
                                value={value}
                                checked={reason === value}
                                onChange={() => {
                                  setReason(value);
                                  setFormError("");
                                }}
                              />
                              {declineReasonLabels[value]}
                            </label>
                          ))}
                        </fieldset>
                        <label className="ds-field">
                          <span>Komentarz (opcjonalnie)</span>
                          <Textarea
                            maxLength={2000}
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </label>
                        {formError && (
                          <p role="alert" className="ds-error">
                            {formError}
                          </p>
                        )}
                        <div className="ds-actions" style={{ marginTop: 0 }}>
                          <button type="submit" className="ds-btn ds-btn-primary">
                            Wyślij odpowiedź
                          </button>
                          <button
                            type="button"
                            className="ds-link"
                            onClick={() => {
                              setDeclining(false);
                              setFormError("");
                            }}
                          >
                            Wróć do decyzji
                          </button>
                        </div>
                      </form>
                    ))}
                  {error && (
                    <p role="alert" className="ds-error" style={{ marginTop: "var(--space-3)" }}>
                      {error}
                    </p>
                  )}
                  <p className="ds-caption">
                    osoby i firma: PRZYKŁAD · cena: jak single_ad w purchases.csv · płatność: DEMO
                  </p>
                </section>

                <section className="ds-card" aria-labelledby="ad-title">
                  <div className="ds-card-head">
                    <h2 id="ad-title">Ogłoszenie do publikacji</h2>
                    <StatusPill tone="neutral">Draft</StatusPill>
                  </div>
                  <div className="ds-adcard" style={{ marginTop: 0 }}>
                    <p className="role">{job.title}</p>
                    <p className="ds-meta" style={{ margin: "var(--space-1) 0 0" }}>
                      {company.name} · {job.locations.join(" / ")} · PRZYKŁAD
                    </p>
                    <ul className="ds-tags" aria-label="Najważniejsze fakty">
                      <CategoryTag category={job.category} />
                      <li className="ds-tag">{remoteLabels[job.remoteStatus]}</li>
                      <li className="ds-tag">{seniorityLabels[job.seniority]}</li>
                      <li className="ds-tag">{salaryTag(job)}</li>
                    </ul>
                    <p style={{ margin: "var(--space-4) 0 0" }}>{job.summary}</p>
                    <details className="ds-details">
                      <summary>Pełny opis ogłoszenia</summary>
                      <p className="ds-prose">{job.description}</p>
                    </details>
                  </div>
                </section>
              </div>

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
            </div>
            {!decided && !declining && (
              <StickyActions target={actions}>
                <button
                  type="button"
                  className="ds-btn ds-btn-secondary"
                  onClick={() => {
                    setDeclining(true);
                    requestAnimationFrame(() =>
                      document.getElementById("decision-title")?.scrollIntoView(),
                    );
                  }}
                >
                  Nie teraz
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-primary"
                  onClick={() => decide("approved")}
                >
                  Zatwierdzam publikację
                </button>
              </StickyActions>
            )}
          </>
        )}
      </main>
    </div>
  );
}
