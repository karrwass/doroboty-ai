import { test, expect } from "@playwright/test";

const draft = "20000000-0000-4000-8000-000000000102";

test("next draft: blocker and date → approval link → approver decision → paid publication", async ({
  page,
  context,
}) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await page.getByRole("link", { name: "Dokończ publikację" }).click();
  await page.getByRole("link", { name: "Edytuj draft" }).click();
  await page.getByRole("button", { name: "Zapisz draft" }).click();

  const reason = page.getByRole("dialog", { name: "Co wstrzymuje publikację?" });
  await expect(reason).toBeVisible();
  await reason.getByLabel("Budżet czeka na zatwierdzenie").check();
  await reason.getByLabel("Kiedy spodziewasz się decyzji?").fill("2099-01-15");
  await reason.getByRole("button", { name: "Przypomnij mi tego dnia" }).click();
  await expect(page.getByText("Budżet czeka na zatwierdzenie.")).toBeVisible();

  await page.getByRole("button", { name: "Poproś o zgodę" }).click();
  await page.getByLabel("Kto zatwierdza zakup? (opcjonalnie)").fill("Ewa");
  await page.getByRole("button", { name: "Utwórz wniosek" }).click();
  const url = await page.getByLabel("Link do wniosku").inputValue();
  expect(url).toContain("#/zgoda/");

  const approver = await context.newPage();
  await approver.goto(url);
  await expect(approver.getByRole("heading", { level: 1 })).toHaveText("Wniosek o publikację");
  await expect(
    approver.getByText("Senior AI Automation Engineer — integracje").first(),
  ).toBeVisible();
  await expect(approver.getByText("5 z 6 rozmów", { exact: false })).toBeVisible();
  await approver.getByRole("button", { name: "Zatwierdzam publikację" }).first().click();
  await expect(approver.getByRole("heading", { name: "Zatwierdzono zakup" })).toBeFocused();

  // The recruiter tab picks up the decision through the storage event.
  await expect(page.getByText("Zatwierdzono", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Przejdź do dnia decyzji" }).click();
  await page.goto("/#/app");
  await page.getByRole("link", { name: "Opublikuj i zapłać" }).first().click();
  await page.getByRole("button", { name: /^Zapłać .* i opublikuj$/ }).click();
  await expect(page.getByRole("heading", { name: "Ogłoszenie jest opublikowane" })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#/app/oferty/${draft}/publikacja$`));
});

test("approver can decline with a reason that the recruiter sees", async ({ page, context }) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Tomasz Zieliński", exact: true }).click();
  await page.getByRole("link", { name: "Dokończ publikację" }).click();
  await page.getByRole("button", { name: "Poproś o zgodę" }).click();
  await page.getByRole("button", { name: "Utwórz wniosek" }).click();
  const url = await page.getByLabel("Link do wniosku").inputValue();

  const approver = await context.newPage();
  await approver.goto(url);
  await expect(approver.getByText("nikt nie przeszedł dalej po rozmowie")).toBeVisible();
  await approver.getByRole("button", { name: "Nie teraz" }).first().click();
  await approver.getByRole("button", { name: "Wyślij odpowiedź" }).click();
  await expect(approver.getByRole("alert")).toContainText("Wybierz powód");
  await approver.getByLabel("Nie ma zatwierdzonej roli").check();
  await approver.getByRole("button", { name: "Wyślij odpowiedź" }).click();
  await expect(
    page.getByText("została odłożona: nie ma zatwierdzonej roli", { exact: false }),
  ).toBeVisible();
});

test("unknown approval link explains recovery", async ({ page }) => {
  await page.goto("/#/zgoda/brak-takiego-wniosku");
  await expect(page.getByRole("heading", { name: "Nie znaleziono wniosku" })).toBeVisible();
});
