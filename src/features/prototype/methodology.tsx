/** Selection criteria page, register "Komfort". */
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Page } from "./shell";

const criteria = [
  ["AI zmienia pracę", "Technologia wpływa na odpowiedzialność, decyzje lub rezultat stanowiska."],
  [
    "Wynik da się zobaczyć",
    "Opis roli wskazuje problem, odbiorcę i efekt, a nie samą listę narzędzi.",
  ],
  [
    "Człowiek zachowuje odpowiedzialność",
    "Automatyzacja wspiera decyzję; nie ukrywa jej autora ani konsekwencji.",
  ],
  [
    "Oferta daje konkret",
    "Pokazuje tryb pracy, poziom, formę współpracy i — kiedy to możliwe — wynagrodzenie.",
  ],
] as const;

export default function MethodologyPage() {
  return (
    <Page>
      <p className="ds-eyebrow">Nasze kryteria</p>
      <h1 className="ds-title">Nie każda praca z chatbotem jest pracą z AI.</h1>
      <p className="ds-lead">
        DoRoboty.ai pokazuje role, w których AI jest częścią realnej odpowiedzialności i mierzalnego
        wyniku.
      </p>
      <section className="ds-card" aria-labelledby="criteria-title">
        <h2 id="criteria-title" className="ds-h2c">
          <span className="ds-icon-tile" data-tone="sage">
            <CheckCircle2 aria-hidden="true" />
          </span>
          Cztery kryteria oferty
        </h2>
        <dl className="ds-rows">
          {criteria.map(([title, body]) => (
            <div key={title} style={{ flexDirection: "column", gap: 2 }}>
              <dt style={{ color: "var(--ink)", fontWeight: 600 }}>{title}</dt>
              <dd style={{ textAlign: "left", fontWeight: 400, color: "var(--ink-2)" }}>{body}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ds-card ds-section" aria-labelledby="verify-title">
        <h2 id="verify-title" className="ds-h2c">
          <span className="ds-icon-tile">
            <ShieldCheck aria-hidden="true" />
          </span>
          Weryfikacja nie jest rekomendacją
        </h2>
        <p style={{ margin: 0 }}>
          Sprawdzamy źródło i kompletność informacji. Firmę, warunki i dopasowanie roli nadal
          oceniasz samodzielnie.
        </p>
      </section>
    </Page>
  );
}
