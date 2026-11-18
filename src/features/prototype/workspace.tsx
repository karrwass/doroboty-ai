/**
 * Person selection and the candidate workspace in DoRoboty Design.
 * Candidate screens use register "Komfort"; the employer list of candidates uses "Praca".
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { ConfettiBurst, type ConfettiOrigin } from "@/components/confetti-burst";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StepBar } from "@/design-system/components";
import { JobCard } from "@/features/jobs/job-card";
import { ApplicationOfferPreview } from "@/features/jobs/application-offer-preview";
import { usePrototype } from "./store";
import {
  currentPerson,
  publishedJobs,
  stageLabels,
  MIN_APPLICATION_ANSWER_LENGTH,
  type Stage,
} from "./model";
import { PageTitle, Empty, NotFound, Notice, Page } from "./shell";
import { CvAttachment } from "./cv-attachment";
import { MatchScore } from "./match-score";
import { RecruitingApplication } from "./recruiting-application";
import { CandidateApplication } from "./candidate-application";
import { EmployerDashboard } from "./employer";
import { candidateSteps } from "./marketplace";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ds-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
/** Stage as a status pill: waiting (rust), positive, rejected, neutral. */
export function stageTone(stage: Stage) {
  return stage === "continued" || stage === "hired"
    ? "pos"
    : stage === "rejected"
      ? "err"
      : stage === "withdrawn"
        ? "neutral"
        : "warn";
}
export function StagePill({ stage }: { stage: Stage }) {
  return (
    <span className="ds-pill" data-tone={stageTone(stage)}>
      {stageLabels[stage]}
    </span>
  );
}
const roleNames = { candidate: "Kandydat", employer: "Pracodawca", operator: "Prowadzący" };

export function PersonPicker() {
  const { state, run } = usePrototype();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const audience = params.get("audience");
  const people =
    audience === "candidate" || audience === "employer"
      ? state.people.filter((person) => person.role === audience)
      : state.people;
  const safeNext = next && /^\/(?!\/)/.test(next) && !next.startsWith("/auth") ? next : null;
  return (
    <Page wide>
      <PageTitle lead="Wybierz profil, z którego chcesz korzystać w prototypie. Hasło nie jest potrzebne.">
        Wybierz osobę
      </PageTitle>
      <div className="ds-grid3">
        {people.map((person) => (
          <article key={person.id} className="ds-card">
            <div className="ds-card-head">
              <h2 style={{ fontSize: 19 }}>{person.name}</h2>
              <span className="ds-pill" data-tone="neutral">
                {roleNames[person.role]}
              </span>
            </div>
            <p style={{ marginTop: 0, color: "var(--ink-2)" }}>{person.headline}</p>
            <Button
              onClick={() => {
                run({ type: "select_person", id: person.id });
                navigate(
                  person.role === "candidate"
                    ? (safeNext ?? "/app")
                    : person.role === "employer"
                      ? "/app/oferty"
                      : "/app/case",
                );
              }}
            >
              Wejdź jako {person.name}
            </Button>
          </article>
        ))}
      </div>
      <p className="ds-caption">osoby i firmy: PRZYKŁAD · wybór osoby zastępuje logowanie</p>
    </Page>
  );
}
export function RequireRole({
  role,
  children,
}: {
  role?: "candidate" | "employer" | "operator";
  children: ReactNode;
}) {
  const { state } = usePrototype();
  const person = currentPerson(state);
  if (!person) return <PersonPicker />;
  if (role && person.role !== role)
    return (
      <Page>
        <Empty>
          <p>
            Ten widok jest dostępny dla{" "}
            {role === "candidate"
              ? "kandydata"
              : role === "employer"
                ? "pracodawcy"
                : "prowadzącego"}
            .
          </p>
          <Link className="ds-btn ds-btn-secondary" to="/auth/sign-in">
            Zmień osobę
          </Link>
        </Empty>
      </Page>
    );
  return children;
}
export function WorkspaceHome() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  if (person.role === "operator") return <Navigate to="/app/case" replace />;
  if (person.role === "employer") return <EmployerDashboard />;
  const applications = state.applications.filter((a) => a.candidateId === person.id);
  const saved = state.saved.filter((x) => x.candidateId === person.id).length;
  return (
    <Page>
      <PageTitle
        lead={`Dzień dobry, ${person.name.split(" ")[0]}. Tu widzisz swoje aplikacje i zapisane oferty.`}
      >
        Twoje konto
      </PageTitle>
      <section className="ds-card" aria-labelledby="home-apps">
        <h2 id="home-apps" className="ds-h2c">
          <span className="ds-icon-tile">
            <FileText aria-hidden="true" />
          </span>
          Aplikacje
        </h2>
        {applications.length ? (
          <ul className="ds-list">
            {applications.map((a) => (
              <li key={a.id}>
                <div className="ds-row-main">
                  <Link className="ds-row-title" to={`/app/aplikacje/${a.id}`}>
                    {a.jobTitle}
                  </Link>
                  <div className="ds-meta">
                    {state.companies.find((x) => x.id === a.companyId)?.name}
                  </div>
                </div>
                <StagePill stage={a.stage} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="ds-sentence">
            Nie masz jeszcze aplikacji. Jeśli znajdziesz ofertę, możesz zaaplikować w kilka minut.
          </p>
        )}
        <div className="ds-actions">
          <Link className="ds-btn ds-btn-primary" to="/oferty">
            Przeglądaj oferty
          </Link>
          <Link className="ds-btn ds-btn-secondary" to="/app/profil">
            Edytuj profil
          </Link>
        </div>
      </section>
      <section className="ds-card ds-section" aria-labelledby="home-saved">
        <h2 id="home-saved" className="ds-h2c">
          Zapisane oferty
        </h2>
        <p style={{ margin: 0 }}>
          {saved === 0
            ? "Nie masz zapisanych ofert."
            : `Masz ${saved} ${saved === 1 ? "zapisaną ofertę" : "zapisane oferty"}.`}{" "}
          <Link className="ds-link" style={{ minHeight: 0 }} to="/app/zapisane">
            Zobacz zapisane
          </Link>
        </p>
      </section>
    </Page>
  );
}
export function ProfilePage({ preview = false }: { preview?: boolean }) {
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const [message, setMessage] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (
      run({
        type: "profile",
        value: {
          name: String(data.get("name")),
          headline: String(data.get("headline")),
          bio: String(data.get("bio")),
          location: String(data.get("location")),
        },
      })
    )
      setMessage("Profil został zapisany.");
  }
  return (
    <Page>
      <PageTitle
        lead={
          preview
            ? "Tak widzi Cię firma, do której aplikujesz."
            : "Firma zobaczy te dane i CV razem z aplikacją."
        }
        action={
          <Link
            to={preview ? "/app/profil" : "/app/profil/podglad"}
            className="ds-btn ds-btn-secondary"
          >
            {preview ? "Edytuj profil" : "Podgląd profilu"}
          </Link>
        }
      >
        {preview ? person.name : "Twój profil"}
      </PageTitle>
      {preview ? (
        <section className="ds-card" aria-label="Podgląd profilu">
          <h2 className="ds-h2c">{person.headline}</h2>
          <p className="ds-meta" style={{ margin: 0 }}>
            {person.location}
          </p>
          <p style={{ marginBottom: 0 }}>{person.bio}</p>
        </section>
      ) : (
        <form onSubmit={save} className="ds-card ds-form" aria-label="Twój profil">
          <Field label="Imię i nazwisko">
            <Input name="name" required maxLength={200} defaultValue={person.name} />
          </Field>
          <Field label="Nagłówek zawodowy">
            <Input name="headline" required maxLength={200} defaultValue={person.headline} />
          </Field>
          <Field label="Lokalizacja">
            <Input name="location" required maxLength={200} defaultValue={person.location} />
          </Field>
          <Field label="O mnie">
            <Textarea name="bio" maxLength={12000} defaultValue={person.bio} />
          </Field>
          <div className="ds-actions" style={{ marginTop: 0 }}>
            <Button type="submit">Zapisz profil</Button>
          </div>
          {message && (
            <p role="status" className="ds-meta" style={{ margin: 0 }}>
              {message}
            </p>
          )}
        </form>
      )}
      <section className="ds-card ds-section" aria-labelledby="profile-cv">
        <h2 id="profile-cv" className="ds-h2c">
          <span className="ds-icon-tile">
            <FileText aria-hidden="true" />
          </span>
          CV
        </h2>
        <CvAttachment candidateId={person.id} fallbackText={person.cv} />
        <p className="ds-caption">CV przykładowe · PRZYKŁAD</p>
      </section>
    </Page>
  );
}
export function SavedPage() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const jobs = publishedJobs(state).filter((job) =>
    state.saved.some((x) => x.candidateId === person.id && x.jobId === job.id),
  );
  return (
    <Page>
      <PageTitle>Zapisane oferty</PageTitle>
      {jobs.length ? (
        <div className="ds-joblist">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} saved />
          ))}
        </div>
      ) : (
        <Empty>
          <p>Nie masz jeszcze zapisanych ofert. Zapisz ofertę, żeby wrócić do niej później.</p>
          <Link className="ds-btn ds-btn-primary" to="/oferty">
            Przeglądaj oferty
          </Link>
        </Empty>
      )}
    </Page>
  );
}
export function ApplyPage() {
  const { slug } = useParams();
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const navigate = useNavigate();
  const job = publishedJobs(state).find((x) => x.slug === slug);
  const draft = state.drafts.find((x) => x.jobId === job?.id && x.candidateId === person.id);
  const notes = draft?.notes ?? "";
  const generated = draft?.generated ?? "";
  const [answer, setAnswer] = useState(draft?.answer ?? "");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [attempted, setAttempted] = useState(false);
  const answerInput = useRef<HTMLTextAreaElement>(null);
  const sendButton = useRef<HTMLButtonElement>(null);
  const submittedOnce = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState<ConfettiOrigin | null>(null);
  useEffect(() => {
    if (!submitted) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    const timeout = window.setTimeout(() => navigate("/app/aplikacje?wyslano=1"), delay);
    return () => window.clearTimeout(timeout);
  }, [submitted, navigate]);
  const answerLength = answer.trim().length;
  const answerInvalid = attempted && answerLength < MIN_APPLICATION_ANSWER_LENGTH;
  const consentInvalid = attempted && !consent;
  if (!job) return <NotFound />;
  const existing = state.applications.find(
    (x) => x.jobId === job.id && x.candidateId === person.id,
  );
  if (existing && !submitted)
    return (
      <Page>
        <Notice>Aplikacja na tę ofertę została już wysłana.</Notice>
        <Link to={`/app/aplikacje/${existing.id}`} className="ds-btn ds-btn-primary">
          Zobacz aplikację
        </Link>
      </Page>
    );
  function submit(e: FormEvent) {
    e.preventDefault();
    if (submittedOnce.current) return;
    setAttempted(true);
    if (answerLength < MIN_APPLICATION_ANSWER_LENGTH) {
      answerInput.current?.focus();
      return;
    }
    if (!consent) {
      document.getElementById("application-consent")?.focus();
      return;
    }
    if (run({ type: "submit", jobId: job!.id, notes, generated, answer, consent })) {
      submittedOnce.current = true;
      setSubmitted(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const rect = sendButton.current?.getBoundingClientRect();
        if (rect)
          setConfettiOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
    }
  }
  return (
    <Page>
      <BackLink to={`/oferty/${job.slug}`}>Wróć do oferty</BackLink>
      <StepBar label="Etapy aplikowania" steps={candidateSteps} current="application" />
      <h1 className="ds-title">Aplikuj na ofertę</h1>
      <p className="ds-lead">
        Jeśli wyślesz aplikację, {job.company.name} zobaczy Twoją odpowiedź i CV z profilu. Możesz
        ją wycofać w każdej chwili.
      </p>
      <ApplicationOfferPreview job={job} />
      <form
        noValidate
        onSubmit={submit}
        className="ds-card ds-form ds-section"
        aria-labelledby="application-form-title"
      >
        <div>
          <h2 id="application-form-title" className="ds-h2c" style={{ marginBottom: 4 }}>
            Twoja aplikacja
          </h2>
          <p className="ds-meta" style={{ margin: 0 }}>
            Aplikujesz jako <strong>{person.name}</strong>.
          </p>
        </div>
        <section aria-labelledby="application-cv-title">
          <h3 id="application-cv-title" style={{ margin: "0 0 4px", fontSize: 16 }}>
            Twoje CV
          </h3>
          <p className="ds-meta" style={{ margin: "0 0 var(--space-2)" }}>
            Do aplikacji dołączymy CV z Twojego profilu.
          </p>
          <CvAttachment
            candidateId={person.id}
            fallbackText={person.cv}
            layout="row"
            contextLabel="CV z Twojego profilu"
          />
        </section>
        <section aria-label="Odpowiedź do aplikacji" className="ds-form" style={{ gap: 6 }}>
          <Field label="Dlaczego pasujesz do tej roli?">
            <Textarea
              disabled={submitted}
              ref={answerInput}
              required
              minLength={MIN_APPLICATION_ANSWER_LENGTH}
              maxLength={12000}
              rows={6}
              aria-invalid={answerInvalid || undefined}
              aria-describedby="application-answer-help"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setConsent(false);
              }}
            />
          </Field>
          <p
            id="application-answer-help"
            role={answerInvalid ? "alert" : undefined}
            className={answerInvalid ? "ds-error" : "ds-meta"}
            style={{ margin: 0 }}
          >
            {answerInvalid
              ? `Odpowiedź jest za krótka. Wpisz co najmniej ${MIN_APPLICATION_ANSWER_LENGTH} znaków (obecnie: ${answerLength}).`
              : `Minimum ${MIN_APPLICATION_ANSWER_LENGTH} znaków. Obecnie: ${answerLength}.`}
          </p>
        </section>
        <label className="ds-check">
          <Checkbox
            id="application-consent"
            disabled={submitted}
            checked={consent}
            onCheckedChange={(v) => setConsent(v)}
            aria-invalid={consentInvalid || undefined}
            aria-describedby={consentInvalid ? "application-consent-error" : undefined}
            aria-label="Zatwierdzam treść i przesłanie aplikacji"
          />
          <span>
            Zatwierdzam treść aplikacji i przesłanie profilu oraz przykładowego CV pracodawcy.
          </span>
        </label>
        {consentInvalid && (
          <p id="application-consent-error" className="ds-error" role="alert">
            Zatwierdź treść aplikacji i jej przesłanie pracodawcy.
          </p>
        )}
        <div className="ds-actions" style={{ marginTop: 0 }}>
          <Button ref={sendButton} type="submit" disabled={submitted}>
            {submitted && <CheckCircle2 aria-hidden="true" />}
            {submitted ? "Wysłano!" : "Wyślij aplikację"}
          </Button>
          <Button
            type="button"
            disabled={submitted}
            variant="outline"
            onClick={() => {
              if (run({ type: "draft", jobId: job.id, notes, generated, answer }))
                setMessage("Szkic został zapisany.");
            }}
          >
            Zapisz szkic
          </Button>
        </div>
        <p
          role="status"
          className={submitted || !message ? "sr-only" : "ds-meta"}
          style={{ margin: 0 }}
        >
          {submitted ? "Wysłano aplikację. Otwieramy listę Twoich aplikacji." : message}
        </p>
        <p className="ds-safe" style={{ margin: 0 }}>
          <ShieldCheck aria-hidden="true" />
          <span>
            Twoje CV zobaczy tylko {job.company.name}. Prototyp: aplikacja zostaje w tej
            przeglądarce.
          </span>
        </p>
      </form>
      <ConfettiBurst origin={confettiOrigin} />
    </Page>
  );
}
export function ApplicationsPage({ employer = false }: { employer?: boolean }) {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const [query, setQuery] = useState("");
  const [params] = useSearchParams();
  const applications = state.applications.filter(
    (x) =>
      (employer ? x.companyId === person.companyId : x.candidateId === person.id) &&
      `${x.candidateName} ${x.jobTitle}`
        .toLocaleLowerCase("pl")
        .includes(query.toLocaleLowerCase("pl")),
  );
  return (
    <Page>
      <PageTitle
        lead={
          employer
            ? "Aplikacje do ogłoszeń Twojej firmy. Match Score to ocena zgodności tekstów 0–100, nie szansa na zatrudnienie."
            : "Stan Twoich aplikacji. Możesz wycofać aplikację, dopóki proces trwa."
        }
      >
        {employer ? "Kandydaci" : "Moje aplikacje"}
      </PageTitle>
      {params.has("wyslano") && (
        <Notice>
          <CheckCircle2 className="inline size-5" aria-hidden="true" /> Aplikacja została wysłana.
          Firma zobaczy ją w swoim panelu.
        </Notice>
      )}
      <div style={{ maxWidth: 420, marginBottom: "var(--space-4)" }}>
        <Field label={employer ? "Szukaj kandydata lub oferty" : "Szukaj oferty"}>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} />
        </Field>
      </div>
      {applications.length ? (
        <section className="ds-card" aria-label={employer ? "Lista kandydatów" : "Lista aplikacji"}>
          <ul className="ds-list">
            {applications.map((a) => (
              <li key={a.id}>
                <div className="ds-row-main">
                  <Link
                    className="ds-row-title"
                    to={`${employer ? "/app/kandydaci" : "/app/aplikacje"}/${a.id}`}
                  >
                    {employer ? a.candidateName : a.jobTitle}
                  </Link>
                  <div className="ds-meta">
                    {employer
                      ? a.jobTitle
                      : state.companies.find((x) => x.id === a.companyId)?.name}
                  </div>
                  {employer && (
                    <p
                      style={{ margin: "var(--space-1) 0 0", color: "var(--ink-2)", fontSize: 14 }}
                    >
                      {a.summary}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <StagePill stage={a.stage} />
                  <MatchScore score={a.score} />
                </div>
              </li>
            ))}
          </ul>
          <p className="ds-caption">osoby i aplikacje: PRZYKŁAD · Match Score: DEMO</p>
        </section>
      ) : (
        <Empty>
          <p>
            {query
              ? "Brak aplikacji spełniających kryteria. Zmień wyszukiwanie."
              : employer
                ? "Brak aplikacji. Pojawią się, gdy kandydaci odpowiedzą na Twoje ogłoszenia."
                : "Nie masz jeszcze aplikacji."}
          </p>
          {!employer && (
            <Link className="ds-btn ds-btn-primary" to="/oferty">
              Przeglądaj oferty
            </Link>
          )}
        </Empty>
      )}
    </Page>
  );
}
export function ApplicationDetail({ employer = false }: { employer?: boolean }) {
  const { id } = useParams();
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const application = state.applications.find(
    (x) =>
      x.id === id && (employer ? x.companyId === person.companyId : x.candidateId === person.id),
  );
  if (!application) return <NotFound />;
  if (employer) return <RecruitingApplication key={application.id} application={application} />;
  return <CandidateApplication key={application.id} application={application} />;
}
