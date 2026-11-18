import { Link } from "react-router";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTag } from "@/design-system/components";
import { usePrototype } from "@/features/prototype/store";
import type { JobWithCompany } from "./types";
import { functionLabels, remoteLabels, seniorityLabels } from "./presentation";
import { CompanyLogo } from "./company-logo";
import { salaryRange } from "./salary-fact";

/** Job ad card, list form (components.md "Job ad card"): one card everywhere a role is listed. */
export function JobCard({ job, saved }: { job: JobWithCompany; saved?: boolean }) {
  const { run } = usePrototype();
  const pay = salaryRange(job);
  return (
    <article className="ds-jobcard">
      <CompanyLogo company={job.company} size="small" />
      <div style={{ minWidth: 0 }}>
        <h3 className="ds-jobcard-title">
          <Link to={`/oferty/${job.slug}`}>{job.title}</Link>
        </h3>
        <p className="ds-meta" style={{ margin: "2px 0 0" }}>
          <Link className="ds-company-link" to={`/firmy/${job.company.slug}`}>
            {job.company.name}
          </Link>{" "}
          · {job.locations.join(" / ")}
        </p>
        <ul className="ds-tags" aria-label="Najważniejsze fakty">
          <CategoryTag category={job.category} />
          <li className="ds-tag">{remoteLabels[job.remoteStatus]}</li>
          <li className="ds-tag">{seniorityLabels[job.seniority]}</li>
          <li className="ds-tag">{functionLabels[job.function]}</li>
        </ul>
      </div>
      <div className="ds-jobcard-side">
        <span className="ds-jobcard-pay">{pay || "Nie podano wynagrodzenia"}</span>
        <span className="ds-meta">
          {new Intl.DateTimeFormat("pl-PL").format(new Date(job.publishedAt))}
        </span>
        {saved !== undefined && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Zapisz ofertę: ${job.title}`}
            aria-pressed={saved}
            title={saved ? "Zapisana" : "Zapisz"}
            onClick={() => run({ type: "toggle_saved", jobId: job.id })}
          >
            <Bookmark className={saved ? "fill-current" : undefined} />
          </Button>
        )}
      </div>
    </article>
  );
}
