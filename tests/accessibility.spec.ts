import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test("landing page has no detected accessibility violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

test("diagnostic empty form has no detected accessibility violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/diagnostic");
  await expect(page.getByRole("heading", { name: "Your diagnostic." })).toBeVisible();
  await expectNoViolations(page);
});

test("diagnostic validation errors have no detected accessibility violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/diagnostic");
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(page.getByText("Please add your name.")).toBeVisible();
  await expectNoViolations(page);
});

test("diagnostic review step has no detected accessibility violations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/diagnostic");
  await page.getByLabel("Your name", { exact: true }).fill("Test migration");
  await page.getByLabel("Work email", { exact: true }).fill("test@example.com");
  await page.locator("#website").fill("example.com");
  await page.getByText("Starting from scratch", { exact: true }).click();
  await page.getByText("Brand", { exact: true }).click();
  await page.getByText("A clearer story", { exact: true }).click();
  await page.getByText("Founder / CEO", { exact: true }).click();
  await page.getByRole("button", { name: "Review my request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your starting point." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Your name, email, website and answers are stored so Small can reply to this request.",
    ),
  ).toBeVisible();
  await expectNoViolations(page);
});
