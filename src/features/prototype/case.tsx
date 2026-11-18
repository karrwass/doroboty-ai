import { PageTitle } from "./shell";
/** Operator material, register "Praca". */
export function CasePage() {
  return (
    <>
      <PageTitle lead="Materiały dla prowadzącego. Dane historyczne nie zmieniają się od działań w prototypie.">
        Materiały case study
      </PageTitle>
      <section className="ds-card" aria-labelledby="case-stage">
        <div className="ds-card-head">
          <h2 id="case-stage">Etap początkowy</h2>
        </div>
        <p className="ds-sentence">
          Zespół chce zwiększyć liczbę ukończonych aplikacji. Sprawdź, gdzie użytkownicy rezygnują i
          co dzieje się po wysłaniu zgłoszenia.
        </p>
        <div className="ds-actions" style={{ marginTop: 0 }}>
          <a
            className="ds-btn ds-btn-secondary"
            href={`${import.meta.env.BASE_URL}case/baseline.csv`}
            download
          >
            Pobierz dane etapu początkowego
          </a>
        </div>
        <p className="ds-caption">baseline.csv · dane fikcyjnego case’u AIPH3</p>
      </section>
    </>
  );
}
