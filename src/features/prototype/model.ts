import { z } from "zod";
import marketplace from "./data/marketplace.json" with { type: "json" };
import people from "./data/people.json" with { type: "json" };
import type { JobWithCompany } from "@/features/jobs/types";
import { purchaseScenario } from "./purchase-seed";

const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
const shortText = z.string().trim().min(1).max(200);
const text = z.string().trim().max(12000);
export const MIN_APPLICATION_ANSWER_LENGTH = 20;
const companySchema = z.object({
  id,
  slug: id,
  name: shortText,
  summary: text,
  description: text,
  websiteUrl: z.string().max(500),
  location: shortText,
  sizeLabel: shortText,
  logoUrl: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional(),
});
export const jobSchema = z
  .object({
    id,
    slug: id,
    companyId: id,
    title: shortText,
    summary: text.min(10),
    description: text.min(30),
    category: z.enum(["build", "apply", "lead"]),
    function: z.enum(["product", "engineering", "data", "design", "marketing", "operations"]),
    remoteStatus: z.enum(["onsite", "hybrid", "remote"]),
    locations: z.array(shortText).min(1).max(10),
    coordinates: z
      .object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
      .optional(),
    seniority: z.enum(["junior", "mid", "senior", "lead"]),
    contract: z.enum(["employment", "b2b", "mandate"]),
    salaryMin: z.number().nonnegative().optional(),
    salaryMax: z.number().nonnegative().optional(),
    salaryCurrency: z.enum(["PLN", "EUR"]).optional(),
    salaryPeriod: z.enum(["month", "year"]).optional(),
    salaryKind: z.enum(["gross", "net"]).optional(),
    publicationStatus: z.enum(["draft", "review", "published", "hidden", "expired", "archived"]),
    publishedAt: z.iso.datetime(),
    expiryAt: z.iso.datetime(),
    verificationStatus: z.enum(["unverified", "editorial", "employer_verified"]),
    sourceBrief: text.optional(),
    generatedDescription: text.optional(),
  })
  .refine(
    (job) =>
      job.salaryMin === undefined || job.salaryMax === undefined || job.salaryMin <= job.salaryMax,
    { path: ["salaryMax"], message: "Salary maximum must not be below minimum" },
  );
export const profileSchema = z.object({
  name: shortText,
  headline: shortText,
  bio: text,
  location: shortText,
});
const personSchema = profileSchema.extend({
  id,
  role: z.enum(["candidate", "employer", "operator"]),
  companyId: id.optional(),
  cv: text,
  exampleScore: z.number().int().min(0).max(100),
  exampleSummary: text,
});
export const stages = [
  "submitted",
  "reviewed",
  "interview_invited",
  "first_conversation_held",
  "continued",
  "rejected",
  "withdrawn",
  "hired",
] as const;
export type Stage = (typeof stages)[number];
export const stageLabels: Record<Stage, string> = {
  submitted: "Aplikacja wysłana",
  reviewed: "W przeglądzie",
  interview_invited: "Zaproszenie na rozmowę",
  first_conversation_held: "Pierwsza rozmowa odbyta",
  continued: "Kolejny etap",
  rejected: "Proces zakończony",
  withdrawn: "Wycofana",
  hired: "Zatrudnienie",
};
export const nextStages: Record<Stage, Stage[]> = {
  submitted: ["reviewed", "rejected"],
  reviewed: ["interview_invited", "rejected"],
  interview_invited: ["first_conversation_held", "rejected"],
  first_conversation_held: ["continued", "rejected"],
  continued: ["hired", "rejected"],
  rejected: [],
  withdrawn: [],
  hired: [],
};
const applicationSchema = z.object({
  id,
  candidateId: id,
  jobId: id,
  companyId: id,
  jobTitle: shortText,
  candidateName: shortText,
  cv: text.min(20),
  answer: text.min(MIN_APPLICATION_ANSWER_LENGTH),
  sourceNotes: text,
  generatedAnswer: text,
  score: z.number().int().min(0).max(100),
  summary: text,
  stage: z.enum(stages),
  events: z
    .array(z.object({ stage: z.enum(stages), at: z.iso.datetime(), note: text }))
    .min(1)
    .max(30),
});
const draftSchema = z.object({
  candidateId: id,
  jobId: id,
  notes: text,
  generated: text,
  answer: text,
});
/** Single job ad, net PLN. Same list price as `single_ad` in the case purchases data. */
export const PUBLICATION_PRICE_NET = 1620;
export const PUBLICATION_DAYS = 30;
export const VAT_RATE = 0.23;
/** A repeat purchase counts when paid within this many days of the previous purchase. */
export const REPEAT_WINDOW_DAYS = 90;
export const blockers = ["role", "budget", "other_channel", "other"] as const;
export type Blocker = (typeof blockers)[number];
export const blockerLabels: Record<Blocker, string> = {
  role: "Rola czeka na zatwierdzenie",
  budget: "Budżet czeka na zatwierdzenie",
  other_channel: "Szukam inaczej (polecenia, inny portal)",
  other: "Inny powód",
};
export const declineReasons = ["no_role", "no_budget", "other_channel", "other"] as const;
export type DeclineReason = (typeof declineReasons)[number];
export const declineReasonLabels: Record<DeclineReason, string> = {
  no_role: "Nie ma zatwierdzonej roli",
  no_budget: "Nie ma budżetu",
  other_channel: "Szukamy innym kanałem",
  other: "Inny powód",
};
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** Outcome of an expired publication, shown to the person who approves the next purchase. */
const publicationResultSchema = z.object({
  jobId: id,
  applications: z.number().int().nonnegative(),
  interviews: z.number().int().nonnegative(),
  continued: z.number().int().nonnegative(),
  medianFirstContactDays: z.number().nonnegative().nullable(),
  purchasedAt: z.iso.datetime(),
  source: text,
});
const purchaseEventSchema = z.object({
  type: z.enum([
    "draft_saved",
    "reason_given",
    "request_created",
    "request_opened",
    "request_approved",
    "request_declined",
    "decision_day",
    "date_moved",
    "paid",
  ]),
  at: z.iso.datetime(),
  note: text,
});
const purchaseRequestSchema = z.object({
  token: id,
  approver: z.string().trim().max(200),
  message: text,
  status: z.enum(["ready", "opened", "approved", "declined"]),
  createdAt: z.iso.datetime(),
  openedAt: z.iso.datetime().optional(),
  decidedAt: z.iso.datetime().optional(),
  declineReason: z.enum(declineReasons).optional(),
  declineNote: text.optional(),
});
/** Everything between saving the next job draft and paying for its publication. */
const purchaseFlowSchema = z.object({
  jobId: id,
  companyId: id,
  previousJobId: id.optional(),
  blocker: z.enum(blockers).optional(),
  decisionDate: day.optional(),
  reminder: z.boolean(),
  decisionDayReached: z.boolean(),
  request: purchaseRequestSchema.optional(),
  paidAt: z.iso.datetime().optional(),
  events: z.array(purchaseEventSchema).max(100),
});
export type PurchaseFlow = z.infer<typeof purchaseFlowSchema>;
export type PurchaseEvent = PurchaseFlow["events"][number];
export type PublicationResult = z.infer<typeof publicationResultSchema>;
export const stateSchema = z
  .object({
    version: z.literal(1),
    activePersonId: id.nullable(),
    companies: z.array(companySchema).min(1).max(200),
    jobs: z.array(jobSchema).min(1).max(1000),
    people: z.array(personSchema).min(1).max(100),
    applications: z.array(applicationSchema).max(2000),
    saved: z.array(z.object({ candidateId: id, jobId: id })).max(5000),
    drafts: z.array(draftSchema).max(1000),
    publicationResults: z.array(publicationResultSchema).max(1000).default([]),
    purchaseFlows: z.array(purchaseFlowSchema).max(1000).default([]),
  })
  .superRefine((s, ctx) => {
    const problem = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const list of [s.companies, s.jobs, s.people, s.applications]) {
      if (new Set(list.map((x) => x.id)).size !== list.length) problem("Duplicate identifiers");
    }
    if (
      new Set(s.jobs.map((x) => x.slug)).size !== s.jobs.length ||
      new Set(s.companies.map((x) => x.slug)).size !== s.companies.length
    )
      problem("Duplicate slugs");
    const companyIds = new Set(s.companies.map((x) => x.id));
    const jobs = new Map(s.jobs.map((x) => [x.id, x]));
    const candidates = new Set(s.people.filter((x) => x.role === "candidate").map((x) => x.id));
    if (s.activePersonId !== null && !s.people.some((x) => x.id === s.activePersonId))
      problem("Unknown active person");
    for (const p of s.people)
      if (p.role === "employer" && (!p.companyId || !companyIds.has(p.companyId)))
        problem("Unknown employer company");
    for (const j of s.jobs) if (!companyIds.has(j.companyId)) problem("Unknown job company");
    const keys = new Set<string>();
    for (const a of s.applications) {
      const key = `${a.candidateId}:${a.jobId}`;
      if (
        !candidates.has(a.candidateId) ||
        jobs.get(a.jobId)?.companyId !== a.companyId ||
        keys.has(key)
      )
        problem("Invalid application reference");
      keys.add(key);
      if (a.events[0]?.stage !== "submitted" || a.events.at(-1)?.stage !== a.stage)
        problem("Invalid application history");
      for (let i = 1; i < a.events.length; i++) {
        const before = a.events[i - 1];
        const after = a.events[i];
        if (!(
          nextStages[before.stage].includes(after.stage) ||
          (after.stage === "withdrawn" &&
            !["hired", "rejected", "withdrawn"].includes(before.stage))
        ))
          problem("Invalid stage transition");
        if (after.at < before.at) problem("Invalid event order");
      }
    }
    const tokens = new Set<string>();
    for (const flow of s.purchaseFlows) {
      if (jobs.get(flow.jobId)?.companyId !== flow.companyId) problem("Invalid purchase reference");
      if (flow.request) {
        if (tokens.has(flow.request.token)) problem("Duplicate request token");
        tokens.add(flow.request.token);
      }
    }
    if (new Set(s.purchaseFlows.map((x) => x.jobId)).size !== s.purchaseFlows.length)
      problem("Duplicate purchase flow");
    for (const r of s.publicationResults)
      if (!jobs.has(r.jobId)) problem("Invalid publication result reference");
    for (const list of [s.saved, s.drafts]) {
      const pairs = new Set<string>();
      for (const item of list) {
        const key = `${item.candidateId}:${item.jobId}`;
        if (!candidates.has(item.candidateId) || !jobs.has(item.jobId) || pairs.has(key))
          problem("Invalid candidate/job reference");
        pairs.add(key);
      }
    }
  });
export type State = z.infer<typeof stateSchema>;
export type Person = State["people"][number];
export type Application = State["applications"][number];
export type Action =
  | { type: "select_person"; id: string | null }
  | { type: "profile"; value: z.infer<typeof profileSchema> }
  | { type: "toggle_saved"; jobId: string }
  | { type: "draft"; jobId: string; notes: string; generated: string; answer: string }
  | {
      type: "submit";
      jobId: string;
      notes: string;
      generated: string;
      answer: string;
      consent: boolean;
    }
  | { type: "stage"; applicationId: string; stage: Stage; note: string }
  | { type: "withdraw"; applicationId: string }
  | { type: "publish"; job: z.infer<typeof jobSchema> }
  | { type: "company"; name: string; description: string }
  | { type: "save_job_draft"; job: z.infer<typeof jobSchema> }
  | { type: "draft_reason"; jobId: string; blocker: Blocker; decisionDate: string }
  | { type: "request_approval"; jobId: string; approver: string; message: string }
  | { type: "request_opened"; token: string }
  | {
      type: "request_decision";
      token: string;
      decision: "approved" | "declined";
      reason?: DeclineReason;
      note?: string;
    }
  | { type: "decision_day"; jobId: string }
  | { type: "move_date"; jobId: string; decisionDate: string }
  | { type: "pay_and_publish"; jobId: string };

export function addDays(iso: string, days: number) {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}
export function grossPrice(net = PUBLICATION_PRICE_NET) {
  return Math.round(net * (1 + VAT_RATE) * 100) / 100;
}
export function previousResult(state: State, flow: PurchaseFlow) {
  const job = state.jobs.find((x) => x.id === flow.previousJobId);
  const result = state.publicationResults.find((x) => x.jobId === flow.previousJobId);
  return job && result ? { job, result } : null;
}
/** Last day a payment still counts as a repeat purchase (90 days after the previous one). */
export function repeatWindowEnd(state: State, flow: PurchaseFlow) {
  const previous = previousResult(state, flow);
  return previous ? addDays(previous.result.purchasedAt, REPEAT_WINDOW_DAYS) : null;
}
export function flowByToken(state: State, token: string) {
  return state.purchaseFlows.find((x) => x.request?.token === token);
}

export function initialState(now = new Date().toISOString()): State {
  const scenario = purchaseScenario(now);
  const state = stateSchema.parse({
    version: 1,
    activePersonId: null,
    ...marketplace,
    jobs: [...marketplace.jobs, ...scenario.jobs],
    people,
    applications: [],
    saved: [],
    drafts: [],
    publicationResults: scenario.publicationResults,
    purchaseFlows: scenario.purchaseFlows,
  });
  const bob = state.people.find((x) => x.id === "candidate-marek")!;
  const job = state.jobs[0];
  state.applications.push({
    id: "application-example",
    candidateId: bob.id,
    jobId: job.id,
    companyId: job.companyId,
    jobTitle: job.title,
    candidateName: bob.name,
    cv: bob.cv,
    answer:
      "Pracowałem nad automatyzacją obsługi zgłoszeń. Poprowadziłem badania z użytkownikami i wdrożenie, które skróciło czas odpowiedzi o 25%. Chętnie opowiem o decyzjach i ograniczeniach tego projektu.",
    sourceNotes: "",
    generatedAnswer: "",
    score: bob.exampleScore,
    summary: bob.exampleSummary,
    stage: "submitted",
    events: [{ stage: "submitted", at: "2026-11-02T09:00:00.000Z", note: "" }],
  });
  return stateSchema.parse(state);
}
export function publishedJobs(state: State): JobWithCompany[] {
  return state.jobs
    .filter((x) => x.publicationStatus === "published")
    .map((job) => ({ ...job, company: state.companies.find((x) => x.id === job.companyId)! }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function currentPerson(state: State) {
  return state.people.find((x) => x.id === state.activePersonId);
}
export function transition(
  state: State,
  action: Action,
  now = new Date().toISOString(),
  newId: string = crypto.randomUUID(),
): State {
  const s = structuredClone(state);
  const person = currentPerson(s);
  const fail = (message: string): never => {
    throw new Error(message);
  };
  const candidate = () => {
    if (person?.role !== "candidate") return fail("Wybierz profil kandydata.");
    return person;
  };
  const employer = () => {
    if (person?.role !== "employer") return fail("Wybierz profil pracodawcy.");
    return person;
  };
  if (action.type === "select_person") {
    if (action.id !== null && !s.people.some((x) => x.id === action.id))
      fail("Nie znaleziono osoby.");
    s.activePersonId = action.id;
  } else if (action.type === "profile")
    Object.assign(candidate(), profileSchema.parse(action.value));
  else if (action.type === "toggle_saved") {
    const p = candidate();
    if (!s.jobs.some((x) => x.id === action.jobId)) fail("Nie znaleziono oferty.");
    const index = s.saved.findIndex((x) => x.candidateId === p.id && x.jobId === action.jobId);
    if (index >= 0) s.saved.splice(index, 1);
    else s.saved.push({ candidateId: p.id, jobId: action.jobId });
  } else if (action.type === "draft") {
    const p = candidate();
    const draft = draftSchema.parse({ candidateId: p.id, ...action });
    s.drafts = s.drafts.filter((x) => !(x.candidateId === p.id && x.jobId === action.jobId));
    s.drafts.push(draft);
  } else if (action.type === "submit") {
    const p = candidate();
    const job = s.jobs.find((x) => x.id === action.jobId && x.publicationStatus === "published");
    if (!job) return fail("Oferta nie jest dostępna.");
    if (!action.consent) fail("Zatwierdź treść i zgodę na przesłanie aplikacji.");
    if (s.applications.some((x) => x.candidateId === p.id && x.jobId === job.id))
      fail("Aplikacja na tę ofertę została już wysłana.");
    s.applications.push(
      applicationSchema.parse({
        id: newId,
        candidateId: p.id,
        jobId: job.id,
        companyId: job.companyId,
        jobTitle: job.title,
        candidateName: p.name,
        cv: p.cv,
        answer: action.answer,
        sourceNotes: action.notes,
        generatedAnswer: action.generated,
        score: p.exampleScore,
        summary: p.exampleSummary,
        stage: "submitted",
        events: [{ stage: "submitted", at: now, note: "" }],
      }),
    );
    s.drafts = s.drafts.filter((x) => !(x.candidateId === p.id && x.jobId === job.id));
  } else if (action.type === "stage" || action.type === "withdraw") {
    const application = s.applications.find((x) => x.id === action.applicationId);
    if (!application) return fail("Nie znaleziono aplikacji.");
    const stage = action.type === "withdraw" ? "withdrawn" : action.stage;
    if (action.type === "withdraw") {
      const p = candidate();
      if (
        application.candidateId !== p.id ||
        ["hired", "rejected", "withdrawn"].includes(application.stage)
      )
        fail("Nie można wycofać tej aplikacji.");
    } else {
      const p = employer();
      if (application.companyId !== p.companyId || !nextStages[application.stage].includes(stage))
        fail("Ta zmiana etapu nie jest dostępna.");
    }
    application.stage = stage;
    application.events.push({ stage, at: now, note: action.type === "stage" ? action.note : "" });
  } else if (action.type === "publish") {
    const p = employer();
    const job = jobSchema.parse(action.job);
    if (job.companyId !== p.companyId) fail("Wybierz ofertę własnej firmy.");
    const index = s.jobs.findIndex((x) => x.id === job.id);
    if (index >= 0) {
      if (s.jobs[index].companyId !== p.companyId) fail("Nie można zmienić tej oferty.");
      s.jobs[index] = job;
    } else s.jobs.unshift(job);
  } else if (action.type === "save_job_draft") {
    const p = employer();
    const job = jobSchema.parse({ ...action.job, publicationStatus: "draft" });
    if (job.companyId !== p.companyId) fail("Wybierz ofertę własnej firmy.");
    const index = s.jobs.findIndex((x) => x.id === job.id);
    if (index >= 0) {
      if (s.jobs[index].companyId !== p.companyId || s.jobs[index].publicationStatus !== "draft")
        fail("Szkic można zapisać tylko dla nieopublikowanej oferty.");
      s.jobs[index] = job;
    } else s.jobs.unshift(job);
    let flow = s.purchaseFlows.find((x) => x.jobId === job.id);
    if (!flow) {
      const previous = s.jobs
        .filter((x) => x.companyId === job.companyId && x.publicationStatus === "expired")
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
      flow = {
        jobId: job.id,
        companyId: job.companyId,
        previousJobId: previous?.id,
        reminder: false,
        decisionDayReached: false,
        events: [],
      };
      s.purchaseFlows.push(flow);
    }
    flow.events.push({ type: "draft_saved", at: now, note: "" });
  } else if (action.type === "draft_reason" || action.type === "move_date") {
    const p = employer();
    const flow = s.purchaseFlows.find(
      (x) => x.jobId === action.jobId && x.companyId === p.companyId && !x.paidAt,
    );
    if (!flow) return fail("Nie znaleziono szkicu.");
    flow.decisionDate = day.parse(action.decisionDate);
    flow.reminder = true;
    flow.decisionDayReached = false;
    if (action.type === "draft_reason") {
      flow.blocker = z.enum(blockers).parse(action.blocker);
      flow.events.push({ type: "reason_given", at: now, note: blockerLabels[flow.blocker] });
    } else flow.events.push({ type: "date_moved", at: now, note: flow.decisionDate });
  } else if (action.type === "request_approval") {
    const p = employer();
    const flow = s.purchaseFlows.find(
      (x) => x.jobId === action.jobId && x.companyId === p.companyId && !x.paidAt,
    );
    if (!flow) return fail("Nie znaleziono szkicu.");
    if (!flow.previousJobId) fail("Wniosek wymaga wyniku poprzedniej publikacji.");
    flow.request = purchaseRequestSchema.parse({
      token: newId,
      approver: action.approver,
      message: action.message,
      status: "ready",
      createdAt: now,
    });
    flow.events.push({ type: "request_created", at: now, note: action.approver.trim() });
  } else if (action.type === "request_opened" || action.type === "request_decision") {
    // The link itself is the authority here: the approver has no account in the prototype.
    const flow = flowByToken(s, action.token);
    const request = flow?.request;
    if (!flow || !request) return fail("Ten wniosek nie istnieje albo został zastąpiony nowym.");
    if (action.type === "request_opened") {
      if (request.status === "ready") {
        request.status = "opened";
        request.openedAt = now;
        flow.events.push({ type: "request_opened", at: now, note: "" });
      }
    } else {
      if (request.status === "approved" || request.status === "declined" || flow.paidAt)
        fail("Decyzja w sprawie tego wniosku została już zapisana.");
      request.status = action.decision;
      request.decidedAt = now;
      request.openedAt ??= now;
      if (action.decision === "declined") {
        request.declineReason = z.enum(declineReasons).parse(action.reason);
        request.declineNote = text.parse(action.note ?? "");
        flow.events.push({
          type: "request_declined",
          at: now,
          note: [declineReasonLabels[request.declineReason], request.declineNote]
            .filter(Boolean)
            .join(" · "),
        });
      } else flow.events.push({ type: "request_approved", at: now, note: "" });
    }
  } else if (action.type === "decision_day") {
    const p = employer();
    const flow = s.purchaseFlows.find(
      (x) => x.jobId === action.jobId && x.companyId === p.companyId && !x.paidAt,
    );
    if (!flow?.reminder) return fail("Najpierw ustaw dzień decyzji.");
    flow.decisionDayReached = true;
    flow.events.push({ type: "decision_day", at: now, note: "" });
  } else if (action.type === "pay_and_publish") {
    const p = employer();
    const flow = s.purchaseFlows.find(
      (x) => x.jobId === action.jobId && x.companyId === p.companyId,
    );
    const job = s.jobs.find((x) => x.id === action.jobId && x.companyId === p.companyId);
    if (!flow || !job || job.publicationStatus !== "draft" || flow.paidAt)
      return fail("Ten szkic został już opublikowany.");
    job.publicationStatus = "published";
    job.publishedAt = now;
    job.expiryAt = addDays(now, PUBLICATION_DAYS);
    job.verificationStatus = "employer_verified";
    flow.paidAt = now;
    flow.reminder = false;
    flow.events.push({
      type: "paid",
      at: now,
      note: `${PUBLICATION_PRICE_NET} zł netto`,
    });
  } else if (action.type === "company") {
    const p = employer();
    Object.assign(
      s.companies.find((x) => x.id === p.companyId)!,
      { name: shortText.parse(action.name), description: text.parse(action.description) },
    );
  }
  return stateSchema.parse(s);
}
