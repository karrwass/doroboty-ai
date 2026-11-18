/**
 * Public marketplace in DoRoboty Design, register "Komfort" (the candidate is looking).
 * Offer anatomy follows the Komfort reference screen (oferta-kandydat.html).
 */
import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  ListChecks,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/back-link";
import { ResponsivePanel } from "@/components/responsive-panel";
import { CategoryTag, StepBar, StickyActions } from "@/design-system/components";
import { SalaryFact, salaryRange } from "@/features/jobs/salary-fact";
import {
  categoryLabels,
  contractLabels,
  functionLabels,
  remoteLabels,
  seniorityLabels,
} from "@/features/jobs/presentation";
import { CompanyLogo } from "@/features/jobs/company-logo";
import { JobCard } from "@/features/jobs/job-card";
import { JobFiltersForm } from "@/features/jobs/job-filters";
import { JobPagination } from "@/features/jobs/job-pagination";
import { JobDescription } from "@/features/jobs/job-description";
import { filterJobs, parseJobFilters } from "@/features/jobs/filters";
import { paginateJobs, jobListingHref } from "@/features/jobs/pagination";
import type { JobWithCompany } from "@/features/jobs/types";
import { usePrototype } from "./store";
import { currentPerson, publishedJobs } from "./model";
import { NotFound, Page } from "./shell";

export const candidateSteps = [
  { key: "offer", label: "Oferta" },
  { key: "application", label: "Aplikacja" },
  { key: "answer", label: "Odpowiedź firmy" },
];
const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function LocalMap({ jobs }: { jobs: JobWithCompany[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const job = jobs.find((x) => x.id === selected);
  const located = jobs.filter((x) => x.coordinates);
  const locationKey = (x: JobWithCompany) => x.locations[0].trim().toLocaleLowerCase("pl");
  const markers = located.filter(
    (x, index) => located.findIndex((other) => locationKey(other) === locationKey(x)) === index,
  );
  const locationCount = (x: JobWithCompany) =>
    located.filter((other) => locationKey(other) === locationKey(x)).length;
  return (
    <div className="ds-map-layout">
      <div className="ds-map" role="region" aria-label="Mapa ofert w Polsce">
        <svg viewBox="0 0 600 520" aria-hidden="true">
          <path
            d="M140 45 220 65 320 40 375 60 440 50 505 150 480 240 520 335 440 420 355 435 310 480 230 435 150 445 90 350 70 260 95 160Z"
            fill="var(--tag-warm)"
            stroke="var(--border-control)"
            strokeWidth="1.5"
          />
        </svg>
        {markers.map((x) => (
          <Button
            key={x.id}
            className="ds-map-pin"
            size="icon-sm"
            variant={selected === x.id ? "default" : "outline"}
            style={{
              left: `${((x.coordinates!.longitude - 14) / 11) * 80 + 10}%`,
              top: `${((55 - x.coordinates!.latitude) / 6) * 80 + 10}%`,
            }}
            aria-label={`${x.locations.join(" / ")}: ${locationCount(x)} ofert`}
            aria-pressed={selected === x.id}
            onClick={() => setSelected(x.id)}
          >
            {locationCount(x) > 1 ? locationCount(x) : <MapPin />}
          </Button>
        ))}
      </div>
      <div className="ds-card">
        {job ? (
          <>
            <h2 className="ds-h2c">{job.title}</h2>
            <p className="ds-meta" style={{ margin: 0 }}>
              Oferty w tej lokalizacji: {locationCount(job)}
            </p>
            <p>
              {job.company.name} · {job.locations.join(" / ")}
            </p>
            <Link to={`/oferty/${job.slug}`} className="ds-btn ds-btn-secondary">
              Zobacz rolę
            </Link>
          </>
        ) : (
          <p style={{ marginTop: 0 }}>Wybierz znacznik, aby zobaczyć ofertę.</p>
        )}
        <ul className="ds-list" style={{ marginTop: "var(--space-4)" }}>
          {jobs.map((x) => (
            <li key={x.id}>
              <Link className="ds-link" style={{ minHeight: 0 }} to={`/oferty/${x.slug}`}>
                {x.title} · {x.company.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function JobsPage() {
  const { state } = usePrototype();
  const person = currentPerson(state);
  const [params, setParams] = useSearchParams();
  const filters = parseJobFilters(Object.fromEntries(params));
  const chipButtons = useRef(new Map<string, HTMLButtonElement>());
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const pendingChipFocus = useRef<string | null>(null);
  useEffect(() => {
    const target = pendingChipFocus.current;
    if (!target) return;
    (chipButtons.current.get(target) ?? resultsHeading.current)?.focus();
    pendingChipFocus.current = null;
  }, [params]);
  const all = publishedJobs(state);
  const jobs = filterJobs(all, filters);
  const pagination = paginateJobs(jobs, filters.page);
  const view = params.get("view") === "map" ? "map" : "list";
  const savedIds =
    person?.role === "candidate"
      ? new Set(state.saved.filter((x) => x.candidateId === person.id).map((x) => x.jobId))
      : undefined;
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }
  function removeFilter(key: string) {
    const keys = Object.entries(filters)
      .filter(([name, value]) => name !== "page" && value)
      .map(([name]) => name);
    const index = keys.indexOf(key);
    pendingChipFocus.current = keys[index + 1] ?? keys[index - 1] ?? "results";
    change(key, "");
  }
  function reset() {
    setParams(view === "map" ? { view: "map" } : {});
  }
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams(params);
    next.delete("page");
    for (const key of ["query", "location"]) {
      const value = String(data.get(key) ?? "").trim();
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  }
  const locations = [...new Set(all.flatMap((x) => x.locations))];
  const active = Object.entries(filters).filter(([k, v]) => k !== "page" && v);
  return (
    <Page wide>
      <div className="ds-hero">
        <h1 className="ds-title" style={{ margin: 0 }}>
          Oferty pracy z AI w środku
        </h1>
        <p className="ds-lead" style={{ margin: 0 }}>
          Role, w których AI jest częścią odpowiedzialności i wyniku pracy. Znajdź taką, w której
          zrobisz coś dobrego.
        </p>
      </div>
      <form
        key={`${filters.query ?? ""}:${filters.location ?? ""}`}
        className="ds-search"
        onSubmit={search}
        role="search"
      >
        <label className="ds-search-field">
          <Search aria-hidden="true" />
          <span className="sr-only">Szukaj ofert</span>
          <input
            className="ds-input"
            name="query"
            aria-label="Szukaj ofert"
            maxLength={100}
            defaultValue={filters.query ?? ""}
            placeholder="Stanowisko, firma lub słowo kluczowe"
          />
        </label>
        <label className="ds-search-field">
          <MapPin aria-hidden="true" />
          <select
            className="ds-input"
            name="location"
            aria-label="Lokalizacja"
            defaultValue={filters.location ?? ""}
          >
            <option value="">Cała Polska</option>
            {[...new Set([...locations, ...(filters.location ? [filters.location] : [])])].map(
              (x) => (
                <option key={x}>{x}</option>
              ),
            )}
          </select>
        </label>
        <button type="submit" className="ds-btn ds-btn-primary">
          Szukaj
        </button>
      </form>
      <div className="ds-categories" aria-label="Kategorie ofert">
        {(
          [
            ["", "Wszystkie oferty", ""],
            ["build", "Build", "Twórz AI"],
            ["apply", "Apply", "Wdrażaj AI"],
            ["lead", "Lead", "Wyznaczaj kierunek"],
          ] as const
        ).map(([key, label, description]) => (
          <button
            key={key}
            type="button"
            className="ds-category"
            data-category={key || undefined}
            aria-pressed={(filters.category ?? "") === key}
            onClick={() => change("category", key)}
          >
            <span>
              {label}
              {description && <small> · {description}</small>}
            </span>
            <span className="count">
              {filterJobs(all, { ...filters, category: key || undefined }).length}
            </span>
          </button>
        ))}
      </div>
      <div className="ds-board">
        <div>
          <ResponsivePanel
            title="Filtry"
            description="Wyniki zmieniają się od razu. W każdej grupie wybierz jeden warunek."
            resultCount={jobs.length}
          >
            <JobFiltersForm filters={filters} onChange={change} onReset={reset} />
          </ResponsivePanel>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="ds-results-head">
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
              <h2 ref={resultsHeading} tabIndex={-1} className="ds-h2c" style={{ margin: 0 }}>
                Oferty pracy
              </h2>
              <span role="status" className="ds-meta">
                {jobs.length}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span className="ds-meta">Najnowsze</span>
              <span className="ds-view-switch">
                <Link
                  aria-current={view === "list" ? "page" : undefined}
                  to={jobListingHref(filters)}
                >
                  Lista
                </Link>
                <Link
                  aria-current={view === "map" ? "page" : undefined}
                  to={jobListingHref(filters, 1, "map")}
                >
                  Mapa
                </Link>
              </span>
            </div>
          </div>
          {active.length > 0 && (
            <div className="ds-chips">
              {active.map(([key, value]) => (
                <button
                  type="button"
                  className="ds-chip"
                  key={key}
                  aria-label={`Usuń filtr: ${value}`}
                  ref={(element) => {
                    if (element) chipButtons.current.set(key, element);
                    else chipButtons.current.delete(key);
                  }}
                  onClick={() => removeFilter(key)}
                >
                  {String(value)} <X aria-hidden="true" />
                </button>
              ))}
              <button type="button" className="ds-link" onClick={reset}>
                Wyczyść
              </button>
            </div>
          )}
          {jobs.length ? (
            view === "map" ? (
              <LocalMap jobs={jobs} />
            ) : (
              <>
                <div className="ds-joblist">
                  {pagination.items.map((job) => (
                    <JobCard key={job.id} job={job} saved={savedIds?.has(job.id)} />
                  ))}
                </div>
                <JobPagination pagination={pagination} filters={filters} />
              </>
            )
          ) : (
            <div className="ds-empty">
              <h3 style={{ margin: 0 }}>Brak ofert dla tych filtrów</h3>
              <p>Wyczyść część kryteriów, a zobaczysz więcej ofert.</p>
              <button type="button" className="ds-btn ds-btn-primary" onClick={reset}>
                Pokaż wszystkie oferty
              </button>
            </div>
          )}
          <p className="ds-caption">oferty i firmy: PRZYKŁAD</p>
        </div>
      </div>
    </Page>
  );
}

export function JobPage() {
  const { slug } = useParams();
  const location = useLocation();
  useEffect(() => {
    const target =
      location.hash === "#role" ? "role" : location.hash === "#employer" ? "employer" : null;
    if (!target) return;
    // Run after the shell's route focus handling, including direct deep links.
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(target);
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key, slug]);
  const { state, run } = usePrototype();
  const person = currentPerson(state);
  const actions = useRef<HTMLDivElement>(null);
  const job = publishedJobs(state).find((x) => x.slug === slug);
  if (!job) return <NotFound />;
  const saved = state.saved.some((x) => x.candidateId === person?.id && x.jobId === job.id);
  const submitted = state.applications.find(
    (x) => x.candidateId === person?.id && x.jobId === job.id,
  );
  const related = publishedJobs(state)
    .filter((x) => x.id !== job.id)
    .sort((a, b) => Number(b.category === job.category) - Number(a.category === job.category))
    .slice(0, 3);
  const candidate = person?.role === "candidate";
  const applyTo = submitted ? `/app/aplikacje/${submitted.id}` : `/aplikuj/${job.slug}`;
  const saveButton = (
    <Button
      variant="outline"
      aria-label="Zapisz ofertę"
      aria-pressed={saved}
      onClick={() => run({ type: "toggle_saved", jobId: job.id })}
    >
      <Bookmark className={saved ? "fill-current" : undefined} />
      {saved ? "Zapisana" : "Zapisz ofertę"}
    </Button>
  );
  return (
    <Page>
      <BackLink to="/oferty">Wróć do ofert</BackLink>
      <StepBar
        label="Etapy aplikowania"
        steps={candidateSteps}
        current={submitted ? "answer" : "offer"}
      />
      <article className="ds-card ds-card-flush" aria-labelledby="offer-title">
        <div className="ds-band" aria-hidden="true" />
        <div className="ds-card-body">
          <CompanyLogo company={job.company} size="large" />
          <h1
            id="offer-title"
            className="ds-title"
            style={{ margin: "var(--space-3) 0 var(--space-1)" }}
          >
            {job.title}
          </h1>
          <p className="ds-company-line">
            <Link to={`/firmy/${job.company.slug}`}>{job.company.name}</Link> ·{" "}
            {job.locations.join(" / ")} <span className="ds-label-demo">PRZYKŁAD</span>
          </p>
          <ul
            className="ds-tags"
            aria-label="Najważniejsze fakty"
            style={{ marginTop: "var(--space-4)" }}
          >
            <CategoryTag category={job.category} />
            <li className="ds-tag">{remoteLabels[job.remoteStatus]}</li>
            <li className="ds-tag">{contractLabels[job.contract]}</li>
            <li className="ds-tag">{seniorityLabels[job.seniority]}</li>
            <li className="ds-tag">{functionLabels[job.function]}</li>
          </ul>
          <p className="ds-lead-sentence">
            {job.summary}{" "}
            <b>
              {submitted
                ? "Twoja aplikacja jest już u firmy; jej stan zobaczysz w „Moich aplikacjach”."
                : "Jeśli zaaplikujesz, firma zobaczy Twoją odpowiedź i CV z profilu."}
            </b>
          </p>
          <SalaryFact job={job} />
          <div className="ds-actions" ref={actions}>
            {candidate ? (
              <>
                <Link className="ds-btn ds-btn-primary" to={applyTo}>
                  {submitted ? "Zobacz swoją aplikację" : "Aplikuj"}
                </Link>
                {saveButton}
              </>
            ) : !person ? (
              <Link
                className="ds-btn ds-btn-primary"
                to={`/auth/sign-in?audience=candidate&next=${encodeURIComponent(`/aplikuj/${job.slug}`)}`}
              >
                Wybierz osobę i aplikuj
              </Link>
            ) : (
              <p style={{ margin: 0 }}>Aplikacje są dostępne z profilu kandydata.</p>
            )}
          </div>
          <p className="ds-safe">
            <ShieldCheck aria-hidden="true" />
            <span>
              Twoje CV zobaczy tylko {job.company.name}. Możesz wycofać aplikację w każdej chwili w
              „Moich aplikacjach”. Prototyp: dane zostają w tej przeglądarce.
            </span>
          </p>

          <div className="ds-match" role="note" aria-labelledby="match-title">
            <h2 id="match-title" className="ds-h2c">
              <span className="ds-icon-tile">
                <Sparkles aria-hidden="true" />
              </span>
              Co sprawdza dopasowanie
            </h2>
            <p>
              Po wysłaniu aplikacji zobaczysz Match Score od 0 do 100. To ocena zgodności tekstów:
              Twojego profilu i tej oferty. <b>Nie jest to szansa na zatrudnienie.</b>
            </p>
            <ul className="ds-weights">
              <li>
                <b>35%</b>umiejętności
              </li>
              <li>
                <b>30%</b>zadania
              </li>
              <li>
                <b>20%</b>doświadczenie
              </li>
              <li>
                <b>15%</b>warunki
              </li>
            </ul>
            <p className="ds-caption">wagi: opis Match Score w materiałach case’u DoRoboty.ai</p>
          </div>

          <nav className="ds-anchor-nav" aria-label="Sekcje oferty">
            <Link to={{ pathname: `/oferty/${job.slug}`, hash: "#role" }}>O roli</Link>
            <Link to={{ pathname: `/oferty/${job.slug}`, hash: "#employer" }}>O firmie</Link>
          </nav>

          <section
            id="role"
            tabIndex={-1}
            className="ds-section ds-section-target"
            aria-labelledby="role-title"
          >
            <h2 id="role-title" className="ds-h2c">
              <span className="ds-icon-tile" data-tone="sage">
                <ListChecks aria-hidden="true" />
              </span>
              O roli
            </h2>
            <div className="ds-reading">
              <JobDescription description={job.description} />
            </div>
          </section>

          <aside className="ds-section" aria-labelledby="facts-title">
            <h2 id="facts-title" className="ds-h2c">
              <span className="ds-icon-tile">
                <BriefcaseBusiness aria-hidden="true" />
              </span>
              Konkrety
            </h2>
            <dl className="ds-rows">
              {[
                ["Wynagrodzenie", salaryRange(job) || "Nie podano wynagrodzenia"],
                ["Forma współpracy", contractLabels[job.contract]],
                ["Tryb pracy", remoteLabels[job.remoteStatus]],
                ["Lokalizacja", job.locations.join(" / ")],
                ["Doświadczenie", seniorityLabels[job.seniority]],
                ["Kategoria", categoryLabels[job.category]],
                ["Opublikowano", dateFormat.format(new Date(job.publishedAt))],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <section
            id="employer"
            tabIndex={-1}
            className="ds-section ds-section-target"
            aria-labelledby="employer-title"
          >
            <h2 id="employer-title" className="ds-h2c">
              <span className="ds-icon-tile" data-tone="lavender">
                <Building2 aria-hidden="true" />
              </span>
              O firmie: {job.company.name}
            </h2>
            <p style={{ marginTop: 0, maxWidth: "72ch" }}>{job.company.description}</p>
            <Link className="ds-link" to={`/firmy/${job.company.slug}`}>
              Oferty tej firmy
            </Link>
          </section>
          <p className="ds-caption">oferta i firma: PRZYKŁAD · warunki: DEMO</p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="ds-section" aria-labelledby="related-title">
          <div className="ds-section-head">
            <h2 id="related-title" className="ds-h2c" style={{ margin: 0 }}>
              Może też Cię zainteresować
            </h2>
            <Link className="ds-link" to="/oferty">
              Wszystkie oferty
            </Link>
          </div>
          <div className="ds-joblist">
            {related.map((x) => (
              <JobCard key={x.id} job={x} />
            ))}
          </div>
        </section>
      )}
      {candidate && (
        <StickyActions target={actions}>
          <div className="ds-sticky-in">
            <span className="ds-sticky-title">
              <b>{job.title}</b> · {job.company.name}
              {salaryRange(job) ? ` · ${salaryRange(job)}` : ""}
            </span>
            <Link className="ds-btn ds-btn-primary" to={applyTo}>
              {submitted ? "Zobacz aplikację" : "Aplikuj teraz"}
            </Link>
          </div>
        </StickyActions>
      )}
    </Page>
  );
}

export function CompanyPage() {
  const { slug } = useParams();
  const { state } = usePrototype();
  const company = state.companies.find((x) => x.slug === slug);
  if (!company) return <NotFound />;
  const jobs = publishedJobs(state).filter((x) => x.companyId === company.id);
  return (
    <Page>
      <BackLink to="/oferty">Wróć do ofert</BackLink>
      <article
        className="ds-card ds-card-flush"
        aria-labelledby="company-title"
        style={{ marginTop: "var(--space-3)" }}
      >
        <div className="ds-band" aria-hidden="true" />
        <div className="ds-card-body">
          <CompanyLogo company={company} size="large" />
          <h1
            id="company-title"
            className="ds-title"
            style={{ margin: "var(--space-3) 0 var(--space-1)" }}
          >
            {company.name}
          </h1>
          <p className="ds-company-line">
            {company.location} <span className="ds-label-demo">PRZYKŁAD</span>
          </p>
          <p className="ds-lead-sentence">{company.summary}</p>
          <p style={{ maxWidth: "72ch", color: "var(--ink-2)" }}>{company.description}</p>
          <dl className="ds-rows">
            <div>
              <dt>Lokalizacja</dt>
              <dd>{company.location}</dd>
            </div>
            <div>
              <dt>Wielkość</dt>
              <dd>{company.sizeLabel}</dd>
            </div>
          </dl>
          {/^https?:\/\//i.test(company.websiteUrl) && (
            <a className="ds-link" href={company.websiteUrl} target="_blank" rel="noreferrer">
              Strona firmy (nowa karta)
            </a>
          )}
        </div>
      </article>
      <section className="ds-section" aria-labelledby="open-roles">
        <h2 id="open-roles" className="ds-h2c">
          Otwarte role
        </h2>
        {jobs.length > 0 ? (
          <div className="ds-joblist">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="ds-empty">
            <p>Ta firma nie ma teraz aktywnych ofert.</p>
            <Link className="ds-btn ds-btn-secondary" to="/oferty">
              Przeglądaj inne oferty
            </Link>
          </div>
        )}
      </section>
    </Page>
  );
}
