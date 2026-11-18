import { expect, type Page, test } from "@playwright/test";

// Runs against the servers started by playwright.config.ts: web on 3100 and
// the Fastify API (Better Auth at /auth/*) on 3433, backed by ruby_test.
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3433";

/** Calls the API from inside the page, so the browser's own cookies are used. */
function apiFromPage(page: Page, path: string, init: RequestInit = {}) {
  return page.evaluate(
    async ({ url, init }) => {
      const res = await fetch(url, { ...init, credentials: "include" });
      return { status: res.status, body: await res.json().catch(() => null) };
    },
    { url: `${API_URL}${path}`, init },
  );
}

async function fillLogin(page: Page, email: string, password: string) {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

test("cadastro, saída e entrada por e-mail e senha", async ({ page }) => {
  const email = `teste+${Date.now()}@ruby.dev`;
  const password = "senha-segura-123";

  await page.goto("/cadastro");
  await page.getByLabel("Seu nome").fill("Teste Ruby");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Vamos configurar seu negócio",
    }),
  ).toBeVisible();

  // The cross-origin session cookie (web 3100 -> API 3433) reaches the API.
  const me = await apiFromPage(page, "/v1/me");
  expect(me).toMatchObject({ status: 200, body: { email } });

  // Sair: Better Auth sign-out, as the auth client sends it.
  const out = await apiFromPage(page, "/auth/sign-out", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  expect(out.status).toBe(200);
  expect((await apiFromPage(page, "/v1/me")).status).toBe(401);

  await page.goto("/entrar");
  await fillLogin(page, email, password);
  await expect(page).toHaveURL(/\/onboarding$/);
  expect((await apiFromPage(page, "/v1/me")).status).toBe(200);

  // Senha errada para uma conta que existe.
  await page.context().clearCookies();
  await page.goto("/entrar");
  await fillLogin(page, email, "senha-errada-123");
  await expect(
    page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/entrar/);
});

test("e-mail desconhecido mostra o mesmo erro", async ({ page }) => {
  await page.goto("/entrar");
  await fillLogin(page, `ninguem+${Date.now()}@ruby.dev`, "senha-errada-123");
  await expect(
    page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos." }),
  ).toBeVisible();
});

test("entrar volta para ?next= quando é um caminho interno", async ({
  page,
}) => {
  const email = `next+${Date.now()}@ruby.dev`;
  const password = "senha-segura-123";
  await page.goto("/cadastro");
  await page.getByLabel("Seu nome").fill("Teste Next");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.context().clearCookies();

  // Off-site targets are ignored.
  for (const offSite of [
    "//evil.example/x",
    "/\\evil.example/x",
    "/\t/evil.example/x",
    "/\n/evil.example/x",
    "https://evil.example/x",
    "javascript:alert(1)",
    "/..//evil.example/x",
    "/.//evil.example/x",
    "/a/..//evil.example/x",
    "http://ruby.invalid//evil.example/x",
  ]) {
    await page.goto(`/entrar?next=${encodeURIComponent(offSite)}`);
    await fillLogin(page, email, password);
    await expect(page).toHaveURL(/^http:\/\/localhost:3100\/onboarding$/);
    await page.context().clearCookies();
  }

  await page.goto("/entrar?next=/onboarding?de=next");
  await fillLogin(page, email, password);
  await expect(page).toHaveURL(/\/onboarding\?de=next$/);
});
