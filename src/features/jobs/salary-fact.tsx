import type { Job } from "./types";
import { contractLabels } from "./presentation";

const thousands = (value: number) =>
  new Intl.NumberFormat("pl-PL").format(value).replace(/\s/g, " ");

/** "14 000–18 000 zł" + agreement basis and period; explicit text when salary is missing. */
export function salaryRange(job: Job) {
  const amount = [job.salaryMin, job.salaryMax]
    .filter((x): x is number => x !== undefined)
    .map(thousands)
    .join("–");
  return amount ? `${amount} ${job.salaryCurrency === "EUR" ? "EUR" : "zł"}` : "";
}
export function salaryBasis(job: Job) {
  return `${job.salaryKind === "net" ? "netto" + (job.contract === "b2b" ? " + VAT" : "") : "brutto"} / ${job.salaryPeriod === "year" ? "rok" : "mies."} · ${contractLabels[job.contract]}`;
}

/** Large amount for the offer page (money block from the Komfort reference). */
export function SalaryFact({ job }: { job: Job }) {
  const amount = salaryRange(job);
  if (!amount) return <p className="ds-money ds-money-missing">Nie podano wynagrodzenia</p>;
  const [value, currency] = [
    amount.slice(0, amount.lastIndexOf(" ")),
    amount.slice(amount.lastIndexOf(" ") + 1),
  ];
  return (
    <div className="ds-money">
      <span className="ds-amount">
        {value}
        <span className="unit" style={{ fontSize: "0.6em", marginLeft: 4 }}>
          {currency}
        </span>
      </span>
      <span className="per">{salaryBasis(job)}</span>
    </div>
  );
}
