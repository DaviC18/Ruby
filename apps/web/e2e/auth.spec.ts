import { expect, test } from "@playwright/test";

// Needs apps/api running with Better Auth (Fase 1, Task 5) at NEXT_PUBLIC_API_URL.
test("cadastro, saída e entrada por e-mail e senha", async ({ page }) => {
  const email = `teste+${Date.now()}@ruby.dev`;
  const password = "senha-segura-123";

  await page.goto("/cadastro");
  await page.getByLabel("Seu nome").fill("Teste Ruby");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/onboarding/);

  await page.context().clearCookies();

  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
});

test("senha errada mostra erro", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("ninguem@ruby.dev");
  await page.getByLabel("Senha", { exact: true }).fill("senha-errada-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("E-mail ou senha incorretos")).toBeVisible();
});
