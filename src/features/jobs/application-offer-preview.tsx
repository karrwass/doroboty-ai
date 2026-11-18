import { CategoryTag } from "@/design-system/components";
import { CompanyLogo } from "./company-logo";
import { JobDescription } from "./job-description";
import { salaryBasis, salaryRange } from "./salary-fact";
import { remoteLabels, seniorityLabels } from "./presentation";
import type { JobWithCompany } from "./types";

/** Job ad card in compact form, shown next to the application form (same component family). */
export function ApplicationOfferPreview({ job }: { job: JobWithCompany }) {
  const pay = salaryRange(job);
  return (
    <aside className="ds-card" aria-labelledby="application-offer-title">
      <p className="ds-eyebrow">Oferta, na którą aplikujesz</p>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
        <CompanyLogo company={job.company} size="small" />
        <div style={{ minWidth: 0 }}>
          <h2 id="application-offer-title" className="ds-jobcard-title">
            {job.title}
          </h2>
          <p className="ds-meta" style={{ margin: "2px 0 0" }}>
            {job.company.name} · {job.locations.join(" / ")}
          </p>
        </div>
      </div>
      <ul className="ds-tags" aria-label="Najważniejsze fakty">
        <CategoryTag category={job.category} />
        <li className="ds-tag">{remoteLabels[job.remoteStatus]}</li>
        <li className="ds-tag">{seniorityLabels[job.seniority]}</li>
        <li className="ds-tag">
          {pay ? `${pay} · ${salaryBasis(job)}` : "Nie podano wynagrodzenia"}
        </li>
      </ul>
      <p style={{ marginBottom: 0 }}>{job.summary}</p>
      <details className="ds-details">
        <summary>Pełny opis oferty</summary>
        <div className="ds-reading">
          <JobDescription description={job.description} compact />
        </div>
      </details>
    </aside>
  );
}
