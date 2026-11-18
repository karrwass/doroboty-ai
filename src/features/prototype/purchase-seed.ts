/**
 * Scenario for the "next job draft → approval → payment" test.
 *
 * Each employer persona returns about 65 days after buying a single job ad, which is when
 * the case data shows the next draft being created (median 61–63 days). The previous ad has
 * expired and a draft of the next one is waiting. Dates are relative to the scenario reset,
 * so the 90-day repeat-purchase window always has about 25 days left.
 *
 * Previous-publication results are aggregates of real rows from the AIPH3 case CSV files
 * (fictional case data), attached to the prototype companies:
 * - BrightLabs ← co-001185, purchase pur-002374, publication pub-003956 (strong result)
 * - Northstar Health ← co-000930, purchase pur-002304, publication pub-003844 (no "continue")
 */
const DAY = 86_400_000;
const BRIGHTLABS = "10000000-0000-4000-8000-000000000001";
const NORTHSTAR = "10000000-0000-4000-8000-000000000002";

export function purchaseScenario(now: string) {
  const at = (days: number) => new Date(new Date(now).getTime() + days * DAY).toISOString();
  const purchasedAt = at(-65);
  const common = {
    verificationStatus: "employer_verified",
    salaryCurrency: "PLN",
    salaryPeriod: "month",
    seniority: "senior",
    remoteStatus: "hybrid",
  } as const;
  const jobs = [
    {
      ...common,
      id: "20000000-0000-4000-8000-000000000101",
      slug: "senior-ai-automation-engineer-czerwiec",
      companyId: BRIGHTLABS,
      title: "Senior AI Automation Engineer",
      summary:
        "Zbudujesz komponent wyszukiwania dla zespołu obsługi zgłoszeń, z testami i ewaluacją.",
      description:
        "O roli\nPrzez pierwsze tygodnie przygotujesz komponent wyszukiwania dla obszaru obsługi zgłoszeń, z zestawem testów. Odpowiadasz za własny komponent, ewaluację i jego utrzymanie.\n\nZespół\nPracujesz z osobą odpowiedzialną za operacje i drugim inżynierem.",
      category: "build",
      function: "engineering",
      locations: ["Wrocław"],
      contract: "employment",
      salaryMin: 20500,
      salaryMax: 24500,
      salaryKind: "gross",
      publicationStatus: "expired",
      publishedAt: purchasedAt,
      expiryAt: at(-35),
    },
    {
      ...common,
      id: "20000000-0000-4000-8000-000000000102",
      slug: "senior-ai-automation-engineer-integracje",
      companyId: BRIGHTLABS,
      title: "Senior AI Automation Engineer — integracje",
      summary:
        "Połączysz komponent wyszukiwania z systemem zgłoszeń i zmierzysz, czy skraca czas obsługi.",
      description:
        "O roli\nPierwsze zadanie to integracja istniejącego komponentu wyszukiwania z systemem zgłoszeń. Odpowiadasz za integrację, ewaluację i monitoring w pierwszym zespole.\n\nZespół\nPracujesz z osobą odpowiedzialną za operacje i inżynierem, który zbudował komponent.\n\nProces rekrutacji\nRozmowa z rekruterką, potem rozmowa o jednym projekcie z Twojego doświadczenia.",
      category: "build",
      function: "engineering",
      locations: ["Wrocław"],
      contract: "employment",
      salaryMin: 21000,
      salaryMax: 25000,
      salaryKind: "gross",
      publicationStatus: "draft",
      publishedAt: at(0),
      expiryAt: at(30),
    },
    {
      ...common,
      id: "20000000-0000-4000-8000-000000000103",
      slug: "ai-adoption-lead-czerwiec",
      companyId: NORTHSTAR,
      title: "AI Adoption Lead",
      summary: "Wdrożysz automatyzację w jednym procesie i sprawdzisz, czy zespół z niej korzysta.",
      description:
        "O roli\nPierwsze zadanie to wdrożenie automatyzacji w obszarze wiedzy zespołu, razem z osobą odpowiedzialną za proces. Odpowiadasz za zmianę jednego procesu i pracę z użytkownikami.",
      category: "apply",
      function: "operations",
      locations: ["Poznań"],
      contract: "b2b",
      salaryMin: 23500,
      salaryMax: 27500,
      salaryKind: "net",
      publicationStatus: "expired",
      publishedAt: purchasedAt,
      expiryAt: at(-35),
    },
    {
      ...common,
      id: "20000000-0000-4000-8000-000000000104",
      slug: "ai-adoption-lead-drugi-proces",
      companyId: NORTHSTAR,
      title: "AI Adoption Lead — drugi proces",
      summary: "Przeniesiesz sprawdzoną automatyzację do drugiego zespołu i zmierzysz jej użycie.",
      description:
        "O roli\nPrzeniesiesz automatyzację z pierwszego procesu do zespołu obsługi pacjentów. Odpowiadasz za wdrożenie, szkolenie użytkowników i pomiar użycia.\n\nProces rekrutacji\nRozmowa z hiring managerem i omówienie jednego wdrożenia z Twojego doświadczenia.",
      category: "apply",
      function: "operations",
      locations: ["Poznań"],
      contract: "b2b",
      salaryMin: 23500,
      salaryMax: 27500,
      salaryKind: "net",
      publicationStatus: "draft",
      publishedAt: at(0),
      expiryAt: at(30),
    },
  ];
  const publicationResults = [
    {
      jobId: jobs[0].id,
      applications: 35,
      interviews: 6,
      continued: 5,
      medianFirstContactDays: 2.5,
      purchasedAt,
      source:
        "Dane przykładowe z case'u AIPH3: firma co-001185, zakup pur-002374 (pojedyncze ogłoszenie, 16.06.2026), publikacja pub-003956.",
    },
    {
      jobId: jobs[2].id,
      applications: 37,
      interviews: 5,
      continued: 0,
      medianFirstContactDays: 2.5,
      purchasedAt,
      source:
        "Dane przykładowe z case'u AIPH3: firma co-000930, zakup pur-002304 (pojedyncze ogłoszenie, 14.06.2026), publikacja pub-003844.",
    },
  ];
  const purchaseFlows = [
    { draft: jobs[1], previous: jobs[0] },
    { draft: jobs[3], previous: jobs[2] },
  ].map(({ draft, previous }) => ({
    jobId: draft.id,
    companyId: draft.companyId,
    previousJobId: previous.id,
    reminder: false,
    decisionDayReached: false,
    events: [{ type: "draft_saved" as const, at: at(-1), note: "" }],
  }));
  return { jobs, publicationResults, purchaseFlows };
}
