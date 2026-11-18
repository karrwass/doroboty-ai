import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form-select";
import {
  categoryLabels,
  functionLabels,
  remoteLabels,
  seniorityLabels,
  contractLabels,
} from "@/features/jobs/presentation";
import { PUBLICATION_PRICE_NET, currentPerson, jobSchema, type State } from "./model";
import { usePrototype } from "./store";
import { Field } from "./workspace";
import { NotFound, PageTitle } from "./shell";
import {
  DecisionDayNotices,
  currentStep,
  draftStatusText,
  formatLongDay,
  formatShortDate,
  isDecisionDay,
  publicationSteps,
} from "./purchase";
import { publicationStatusLabel } from "@/features/jobs/presentation";
import { Amount, StatusPill, StepBar } from "@/design-system/components";

const statusPills = {
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Opublikowane", tone: "pos" },
  expired: { label: "Wygasło", tone: "neutral" },
} as const;
function JobStatus({ status }: { status: string }) {
  const pill = statusPills[status as keyof typeof statusPills];
  return pill ? (
    <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
  ) : (
    <StatusPill tone="neutral">{publicationStatusLabel(status)}</StatusPill>
  );
}
function companyJobs(state: State, companyId: string | undefined) {
  const order = { draft: 0, published: 1 } as Record<string, number>;
  return state.jobs
    .filter((x) => x.companyId === companyId)
    .sort((a, b) => (order[a.publicationStatus] ?? 2) - (order[b.publicationStatus] ?? 2));
}

/** Pulpit (DoRoboty Design, Praca): where am I → what needs me → the facts. */
export function EmployerDashboard() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const jobs = companyJobs(state, person.companyId);
  const published = jobs.filter((x) => x.publicationStatus === "published");
  const expired = jobs
    .filter((x) => x.publicationStatus === "expired")
    .sort((a, b) => b.expiryAt.localeCompare(a.expiryAt));
  const flows = state.purchaseFlows.filter(
    (x) =>
      x.companyId === person.companyId &&
      !x.paidAt &&
      state.jobs.find((j) => j.id === x.jobId)?.publicationStatus === "draft",
  );
  const pending = flows.filter(
    (x) => x.request?.status === "ready" || x.request?.status === "opened",
  );
  const actNow = flows.some((x) => x.request?.status === "approved" || isDecisionDay(x));
  const first = flows[0];
  const firstJob = first && state.jobs.find((x) => x.id === first.jobId);
  const step = first ? currentStep(first) : null;
  const applications = state.applications.filter((a) => a.companyId === person.companyId);
  const inProcess = applications.filter(
    (x) => !["rejected", "withdrawn", "hired"].includes(x.stage),
  ).length;
  const lastResult = expired[0] && state.publicationResults.find((r) => r.jobId === expired[0].id);
  return (
    <>
      <h1 className="ds-title">Pulpit</h1>
      <p className="ds-lead">
        Dzień dobry, {person.name.split(" ")[0]}.{" "}
        {lastResult
          ? `Ostatni zakup: jedno ogłoszenie, ${formatLongDay(lastResult.purchasedAt)}. `
          : ""}
        {flows.length === 1
          ? "Od tego czasu jeden draft czeka na publikację."
          : flows.length > 1
            ? `Na publikację czeka ${flows.length} draftów.`
            : "Żaden draft nie czeka na publikację."}
      </p>
      {first && firstJob && step && (
        <StepBar
          label={`Draft ${firstJob.title}: etapy publikacji`}
          steps={publicationSteps}
          current={step}
        />
      )}
      <DecisionDayNotices />
      <section className="ds-tiles" aria-label="Stan konta">
        <div className="ds-tile">
          <div className="big">{published.length}</div>
          <div className="label">Aktywne ogłoszenia</div>
          <div className="sub">
            {expired[0] ? `ostatnie wygasło ${formatShortDate(expired[0].expiryAt)}` : " "}
          </div>
        </div>
        <div className="ds-tile">
          <div className={`big${actNow ? " warn" : ""}`}>{flows.length}</div>
          <div className="label">Drafty</div>
          <div className="sub">
            {firstJob ? `niezapłacony: ${firstJob.title}` : "brak niezapłaconych"}
          </div>
        </div>
        <div className="ds-tile">
          <div className="big">{pending.length}</div>
          <div className="label">Wnioski czekające</div>
          <div className="sub">
            {pending[0]
              ? `u osoby zatwierdzającej${pending[0].request!.approver ? ` (${pending[0].request!.approver})` : ""}`
              : "brak"}
          </div>
        </div>
      </section>
      <div className="ds-grid2">
        <section className="ds-card" aria-labelledby="drafts-title">
          <div className="ds-card-head">
            <h2 id="drafts-title">Drafty do publikacji</h2>
          </div>
          {flows.length ? (
            <ul className="ds-list">
              {flows.map((flow) => {
                const job = state.jobs.find((x) => x.id === flow.jobId)!;
                return (
                  <li key={flow.jobId}>
                    <div className="ds-row-main">
                      <Link className="ds-row-title" to={`/app/oferty/${job.id}/publikacja`}>
                        {job.title}
                      </Link>
                      <div className="ds-meta">{draftStatusText(flow)}</div>
                    </div>
                    <Link
                      className="ds-btn ds-btn-primary ds-btn-sm"
                      to={`/app/oferty/${job.id}/publikacja`}
                    >
                      Dokończ publikację
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="ds-sentence">Wszystkie drafty są opublikowane.</p>
          )}
        </section>
        <section className="ds-card" aria-labelledby="candidates-title">
          <div className="ds-card-head">
            <h2 id="candidates-title">Kandydaci</h2>
          </div>
          <p className="ds-sentence">
            {inProcess} z {applications.length} aplikacji jest w trakcie procesu.
          </p>
          <div className="ds-actions" style={{ marginTop: 0 }}>
            <Link className="ds-btn ds-btn-secondary" to="/app/kandydaci">
              Przejrzyj kandydatów
            </Link>
          </div>
          <p className="ds-caption">dane przykładowe</p>
        </section>
      </div>
    </>
  );
}

export function EmployerJobs() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const jobs = companyJobs(state, person.companyId);
  return (
    <>
      <div className="ds-page-head">
        <div>
          <h1 className="ds-title">Ogłoszenia</h1>
          <p className="ds-lead">Drafty, aktywne i wygasłe ogłoszenia Twojej firmy.</p>
        </div>
        <Link to="/app/oferty/nowa" className="ds-btn ds-btn-secondary">
          Dodaj ogłoszenie
        </Link>
      </div>
      <DecisionDayNotices />
      <section className="ds-card" aria-label="Lista ogłoszeń">
        {jobs.length ? (
          <ul className="ds-list">
            {jobs.map((job) => {
              const flow = state.purchaseFlows.find((x) => x.jobId === job.id);
              const draft = job.publicationStatus === "draft";
              const count =
                state.publicationResults.find((x) => x.jobId === job.id)?.applications ??
                state.applications.filter((x) => x.jobId === job.id).length;
              return (
                <li key={job.id}>
                  <div className="ds-row-main">
                    <div className="ds-card-head" style={{ margin: 0, justifyContent: "start" }}>
                      <Link
                        className="ds-row-title"
                        to={`/app/oferty/${job.id}${draft && flow ? "/publikacja" : ""}`}
                      >
                        {job.title}
                      </Link>
                      <JobStatus status={job.publicationStatus} />
                    </div>
                    <div className="ds-meta">
                      {draft && flow
                        ? draftStatusText(flow)
                        : `${count} aplikacji · ${formatShortDate(job.publishedAt)}–${formatShortDate(job.expiryAt)}`}
                    </div>
                  </div>
                  {draft && flow ? (
                    <Link
                      to={`/app/oferty/${job.id}/publikacja`}
                      className="ds-btn ds-btn-primary ds-btn-sm"
                    >
                      Dokończ publikację
                    </Link>
                  ) : job.publicationStatus === "published" ? (
                    <Link to={`/oferty/${job.slug}`} className="ds-link">
                      Zobacz ogłoszenie
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="ds-sentence">
            Nie masz jeszcze ogłoszeń. Jeśli dodasz pierwsze, kandydaci zobaczą je po publikacji.
          </p>
        )}
        <p className="ds-caption">ogłoszenia i firma: PRZYKŁAD</p>
      </section>
    </>
  );
}
export function EmployerJobEditor() {
  const { id } = useParams();
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const navigate = useNavigate();
  const existing = state.jobs.find((x) => x.id === id && x.companyId === person.companyId);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [source, setSource] = useState(existing?.sourceBrief ?? "");
  const [generated, setGenerated] = useState(existing?.generatedDescription ?? "");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  if (id !== "nowa" && !existing) return <NotFound />;
  // New and draft jobs are paid before publication; published jobs are only edited.
  const unpublished = !existing || existing.publicationStatus === "draft";
  function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = unpublished ? (submitter?.value === "draft" ? "draft" : "pay") : "publish";
    if (intent !== "draft" && !approved) {
      setError("Zatwierdź opis przed publikacją.");
      return;
    }
    const data = new FormData(e.currentTarget);
    const newId = existing?.id ?? crypto.randomUUID();
    const parsed = jobSchema.safeParse({
      id: newId,
      slug: existing?.slug ?? `oferta-${newId}`,
      companyId: person.companyId,
      title,
      summary,
      description,
      sourceBrief: source,
      generatedDescription: generated,
      category: data.get("category"),
      function: data.get("function"),
      remoteStatus: data.get("remoteStatus"),
      locations: [String(data.get("location")).trim()],
      seniority: data.get("seniority"),
      contract: data.get("contract"),
      salaryMin: data.get("salaryMin") ? Number(data.get("salaryMin")) : undefined,
      salaryMax: data.get("salaryMax") ? Number(data.get("salaryMax")) : undefined,
      salaryCurrency: existing?.salaryCurrency ?? "PLN",
      salaryPeriod: existing?.salaryPeriod ?? "month",
      salaryKind: existing?.salaryKind ?? "gross",
      coordinates: (
        {
          warszawa: { latitude: 52.2297, longitude: 21.0122 },
          kraków: { latitude: 50.0647, longitude: 19.945 },
          wrocław: { latitude: 51.1079, longitude: 17.0385 },
          gdańsk: { latitude: 54.352, longitude: 18.6466 },
          poznań: { latitude: 52.4064, longitude: 16.9252 },
        } as Record<string, { latitude: number; longitude: number }>
      )[String(data.get("location")).trim().toLocaleLowerCase("pl")],
      publicationStatus: unpublished ? "draft" : "published",
      publishedAt: existing?.publishedAt ?? new Date().toISOString(),
      expiryAt: existing?.expiryAt ?? "2099-12-31T23:59:59.000Z",
      verificationStatus: "employer_verified",
    });
    if (
      !parsed.success ||
      (parsed.data.salaryMin !== undefined &&
        parsed.data.salaryMax !== undefined &&
        parsed.data.salaryMin > parsed.data.salaryMax)
    ) {
      setError(
        "Sprawdź formularz: tytuł, lokalizacja, podsumowanie (min. 10 znaków), opis (min. 30 znaków) i widełki wynagrodzenia.",
      );
      return;
    }
    if (intent === "publish") {
      if (run({ type: "publish", job: parsed.data })) navigate("/app/oferty");
    } else if (run({ type: "save_job_draft", job: parsed.data }))
      navigate(
        `/app/oferty/${parsed.data.id}/publikacja?${intent === "draft" ? "zapisano" : "platnosc"}=1`,
      );
  }
  const backTo =
    existing?.publicationStatus === "draft"
      ? `/app/oferty/${existing.id}/publikacja`
      : "/app/oferty";
  return (
    <>
      <Link className="ds-back" to={backTo}>
        ← {existing?.publicationStatus === "draft" ? "Wróć do draftu" : "Wróć do ogłoszeń"}
      </Link>
      <h1 className="ds-title">
        {!existing
          ? "Nowe ogłoszenie"
          : existing.publicationStatus === "draft"
            ? "Draft ogłoszenia"
            : "Edytuj ogłoszenie"}
      </h1>
      <p className="ds-lead">
        {unpublished
          ? "Zapisz draft, jeśli publikacja musi poczekać. Opublikujesz go po zatwierdzeniu treści i opłaceniu."
          : "Zmiany w opublikowanym ogłoszeniu zobaczą kandydaci od razu po zapisaniu."}
      </p>
      <form className="ds-stack" onSubmit={publish} noValidate>
        <section className="ds-card ds-form" aria-labelledby="editor-content">
          <h2 id="editor-content">Treść</h2>
          <Field label="Nazwa stanowiska">
            <Input
              required
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setApproved(false);
              }}
            />
          </Field>
          <Field label="Brief — kogo szukasz i do jakiego zadania?">
            <Textarea
              maxLength={12000}
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setGenerated("");
                setApproved(false);
              }}
            />
          </Field>
          <div>
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-sm"
              disabled={source.trim().length < 20 || title.trim().length < 3}
              onClick={() => {
                setGenerated(
                  `${title}\n\nO roli\n${source.trim().slice(0, 10000)}\n\nJak pracujemy\nŁączymy potrzeby użytkowników, odpowiedzialne wykorzystanie AI i mierzalne efekty.\n\nProces rekrutacji\nPrześlij aplikację i opowiedz o projekcie, w którym Twoje decyzje wpłynęły na wynik.`,
                );
                setApproved(false);
              }}
            >
              Przygotuj opis z AI
            </button>
          </div>
          {generated && (
            <div className="ds-quote">
              <p className="ds-meta" style={{ marginBottom: "var(--space-2)" }}>
                Propozycja opisu · DEMO: szablon w prototypie, nie odpowiedź modelu
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{generated}</p>
              <button
                type="button"
                className="ds-btn ds-btn-secondary ds-btn-sm"
                style={{ marginTop: "var(--space-3)" }}
                onClick={() => {
                  setDescription(generated);
                  if (!summary) setSummary(source.slice(0, 180));
                  setApproved(false);
                }}
              >
                Użyj propozycji
              </button>
            </div>
          )}
          <Field label="Krótkie podsumowanie">
            <Textarea
              required
              minLength={10}
              maxLength={12000}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                setApproved(false);
              }}
            />
          </Field>
          <Field label="Opis ogłoszenia">
            <Textarea
              required
              minLength={30}
              maxLength={12000}
              rows={8}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setApproved(false);
              }}
            />
          </Field>
        </section>
        <section className="ds-card" aria-labelledby="editor-terms">
          <h2 id="editor-terms" style={{ marginBottom: "var(--space-4)" }}>
            Warunki
          </h2>
          <div className="ds-form-grid">
            {(
              [
                ["category", "Kategoria", categoryLabels, existing?.category ?? "build"],
                ["function", "Funkcja", functionLabels, existing?.function ?? "engineering"],
                ["remoteStatus", "Tryb pracy", remoteLabels, existing?.remoteStatus ?? "hybrid"],
                ["seniority", "Poziom", seniorityLabels, existing?.seniority ?? "mid"],
                ["contract", "Umowa", contractLabels, existing?.contract ?? "employment"],
              ] as const
            ).map(([name, label, values, value]) => (
              <Field key={name} label={label}>
                <FormSelect
                  name={name}
                  ariaLabel={label}
                  defaultValue={value}
                  options={Object.entries(values).map(([value, label]) => ({ value, label }))}
                />
              </Field>
            ))}
            <Field label="Lokalizacja">
              <Input
                name="location"
                required
                maxLength={200}
                defaultValue={existing?.locations.join(" / ") ?? "Warszawa"}
              />
            </Field>
            <Field label="Wynagrodzenie od (PLN brutto / mies.)">
              <Input name="salaryMin" type="number" min="0" defaultValue={existing?.salaryMin} />
            </Field>
            <Field label="Wynagrodzenie do (PLN brutto / mies.)">
              <Input name="salaryMax" type="number" min="0" defaultValue={existing?.salaryMax} />
            </Field>
          </div>
        </section>
        <section className="ds-card ds-form" aria-labelledby="editor-publish">
          <h2 id="editor-publish">{unpublished ? "Publikacja" : "Zapis zmian"}</h2>
          {unpublished && (
            <div className="ds-amount-row">
              <Amount value={PUBLICATION_PRICE_NET} />
              <span className="ds-meta">ogłoszenie pojedyncze · 30 dni · płatność DEMO</span>
            </div>
          )}
          <label className="ds-check">
            <Checkbox
              checked={approved}
              onCheckedChange={setApproved}
              aria-label="Zatwierdzam treść ogłoszenia"
            />
            <span>Zatwierdzam treść ogłoszenia do publikacji.</span>
          </label>
          {error && (
            <p role="alert" className="ds-error">
              {error}
            </p>
          )}
          <div className="ds-actions" style={{ marginTop: 0 }}>
            {unpublished ? (
              <>
                <button
                  type="submit"
                  value="pay"
                  className="ds-btn ds-btn-primary"
                  disabled={!approved}
                >
                  Opublikuj i zapłać
                </button>
                <button type="submit" value="draft" className="ds-btn ds-btn-secondary">
                  Zapisz draft
                </button>
              </>
            ) : (
              <button type="submit" className="ds-btn ds-btn-primary" disabled={!approved}>
                Opublikuj ogłoszenie
              </button>
            )}
            {!approved && <span className="ds-reason">Zatwierdź treść, aby opublikować.</span>}
          </div>
        </section>
      </form>
    </>
  );
}
export function CompanyEditor() {
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const company = state.companies.find((x) => x.id === person.companyId)!;
  const [message, setMessage] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (
      run({
        type: "company",
        name: String(data.get("name")),
        description: String(data.get("description")),
      })
    )
      setMessage("Dane firmy zostały zapisane.");
  }
  return (
    <>
      <PageTitle
        lead="Kandydaci widzą te dane na profilu firmy i przy każdym ogłoszeniu."
        action={
          <Link className="ds-btn ds-btn-secondary" to={`/firmy/${company.slug}`}>
            Zobacz profil firmy
          </Link>
        }
      >
        Organizacja
      </PageTitle>
      <form className="ds-card ds-form" onSubmit={save} aria-label="Dane firmy">
        <Field label="Nazwa firmy">
          <Input name="name" required maxLength={200} defaultValue={company.name} />
        </Field>
        <Field label="Opis firmy">
          <Textarea name="description" maxLength={12000} defaultValue={company.description} />
        </Field>
        <div className="ds-actions" style={{ marginTop: 0 }}>
          <Button type="submit">Zapisz dane firmy</Button>
        </div>
        {message && (
          <p role="status" className="ds-meta" style={{ margin: 0 }}>
            {message}
          </p>
        )}
        <p className="ds-caption">firma: PRZYKŁAD</p>
      </form>
    </>
  );
}
