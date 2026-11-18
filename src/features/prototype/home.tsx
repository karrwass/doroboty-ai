/** Home page, DoRoboty Design register "Komfort". Graphics: CSS band only (no illustration). */
import { Link } from "react-router";
import { CategoryTag } from "@/design-system/components";
import { JobCard } from "@/features/jobs/job-card";
import { usePrototype } from "./store";
import { publishedJobs } from "./model";
import { Page } from "./shell";

const categories = [
  {
    slug: "build",
    description: "Tworzysz modele, systemy i produkty wykorzystujące AI.",
  },
  {
    slug: "apply",
    description: "Używasz AI, żeby lepiej wykonywać swoją właściwą pracę.",
  },
  {
    slug: "lead",
    description: "Prowadzisz zmianę, decyzje i zespoły w świecie AI.",
  },
] as const;

export default function HomePage() {
  const { state } = usePrototype();
  const latestJobs = publishedJobs(state).slice(0, 4);
  return (
    <Page wide>
      <section className="ds-card ds-card-flush" aria-labelledby="home-title">
        <div className="ds-band" aria-hidden="true" />
        <div className="ds-card-body ds-home-hero">
          <p className="ds-eyebrow">Dobra robota. Z AI w środku.</p>
          <h1 id="home-title">Praca dla ludzi, którzy dowożą z AI.</h1>
          <p>
            Wybrane role, w których AI jest częścią odpowiedzialności, decyzji i wyniku pracy — nie
            dopiskiem w employer brandingu.
          </p>
          <div className="ds-actions" style={{ marginTop: "var(--space-2)" }}>
            <Link to="/oferty" className="ds-btn ds-btn-primary">
              Zobacz oferty
            </Link>
            <Link to="/metodologia" className="ds-btn ds-btn-secondary">
              Jak wybieramy role
            </Link>
          </div>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ways-title">
        <p className="ds-eyebrow">Trzy sposoby pracy z AI</p>
        <h2 id="ways-title" className="ds-h2c">
          Build. Apply. Lead.
        </h2>
        <div className="ds-grid3">
          {categories.map((category) => (
            <article key={category.slug} className="ds-card">
              <ul className="ds-tags" style={{ marginTop: 0 }}>
                <CategoryTag category={category.slug} />
              </ul>
              <p>{category.description}</p>
              <Link className="ds-link" to={`/oferty?category=${category.slug}`}>
                Przeglądaj role
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="ds-section" aria-labelledby="latest-title">
        <div className="ds-section-head">
          <div>
            <p className="ds-eyebrow">Aktualne role</p>
            <h2 id="latest-title" className="ds-h2c" style={{ margin: 0 }}>
              Najnowsze oferty
            </h2>
          </div>
          <Link className="ds-link" to="/oferty">
            Wszystkie oferty
          </Link>
        </div>
        <div className="ds-joblist">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <p className="ds-caption">oferty i firmy: PRZYKŁAD</p>
      </section>
    </Page>
  );
}
