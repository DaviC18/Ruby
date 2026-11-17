# Ruby — Fase 1: Fundação, Auth e Tenants — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monorepo funcionando com Postgres local, API Fastify com Better Auth (Google + e-mail/senha), criação de negócio (tenant) com isolamento de dados, e painel Next.js com login, onboarding inicial e configuração de horários e serviços.

**Architecture:** Monorepo pnpm + Turborepo. `apps/api` (Fastify) é a única porta para o banco; `apps/web` (Next.js) consome a API com cookies de sessão do Better Auth. `packages/db` tem o schema Drizzle; `packages/shared` tem schemas Zod e constantes usados por ambos. Toda tabela de negócio carrega `tenant_id` e é acessada por repositórios que exigem `tenantId`.

**Tech Stack:** pnpm, Turborepo, TypeScript (strict), Biome, Docker Compose (Postgres 16), Drizzle ORM + drizzle-kit, Zod, Fastify 5, Better Auth, Next.js (App Router), React, Tailwind, shadcn/ui, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-ruby-design.md`

## Global Constraints

- **Commits são feitos pelo Davi.** Nenhum agente roda `git add`, `git commit`, `git push` ou altera branches. Cada task termina com as mudanças no working tree.

- Interface do usuário em **português (pt-BR)**; código, nomes de arquivos e identificadores em inglês.
- TypeScript `strict: true` em todos os pacotes; `tsc --noEmit` sem erros.
- Biome sem erros (`pnpm biome check .`) antes de cada commit.
- Todo horário armazenado em **UTC**; cada tenant tem `timezone` (default `America/Sao_Paulo`).
- Toda tabela de negócio tem coluna `tenant_id` não nula; nenhuma query de negócio sem `tenantId`.
- Validação de toda entrada HTTP com Zod (schemas em `packages/shared`).
- Segredos só via env; `.env.example` versionado; nunca commitar `.env`.
- Login: Better Auth com **Google** e **e-mail/senha**. O login com Google pede só escopos de identidade (`openid email profile`); Calendar/Drive ficam para a Fase 4 (passo separado).
- Skills: `better-auth` para auth; `next-best-practices`, `vercel-react-best-practices`, `shadcn` e `impeccable` no web; `web-design-guidelines` antes de concluir cada tela.
- Constantes de plano (Free 30 / Pro R$90 300 / Empresarial R$300 1.500 atendimentos/mês) em `packages/shared/src/plans.ts`.

## Review Focus

1. **Usuário autenticado tentando acessar dados de outro tenant** (trocando o id na URL ou no header) → deve receber 404, nunca os dados. Teste: Task 6.
2. **Mesmo e-mail cadastrado por senha e depois entrando com Google** → deve cair na mesma conta (account linking), não criar usuário duplicado. Teste: Task 5.
3. **Horário de funcionamento com fechamento antes da abertura ou intervalos sobrepostos no mesmo dia** → rejeitado com mensagem em pt-BR. Teste: Task 7.
4. **Usuário logado sem nenhum negócio criado acessando o painel** → redirecionado ao onboarding, sem erro 500. Teste: Task 9.
5. **Sessão expirada no meio do uso do painel** → redirecionado ao login, preservando a página de retorno. Teste: Task 9.

---

## File Structure

```
ruby/
├─ package.json                 scripts raiz (dev, build, test, lint, typecheck)
├─ pnpm-workspace.yaml
├─ turbo.json
├─ biome.json
├─ docker-compose.yml           postgres:16 (dev 5432, test 5433)
├─ .env.example
├─ packages/
│  ├─ config/tsconfig.base.json
│  ├─ shared/src/
│  │  ├─ plans.ts               PLANS, PlanId
│  │  ├─ tenant.ts              createTenantInput, tenantDto
│  │  ├─ business-hours.ts      businessHoursInput (+ validação de intervalos)
│  │  ├─ service.ts             serviceInput, serviceDto
│  │  └─ index.ts
│  └─ db/src/
│     ├─ client.ts              createDb(url) → Db
│     ├─ schema/auth.ts         tabelas Better Auth (geradas)
│     ├─ schema/tenant.ts       tenant, membership
│     ├─ schema/business.ts     business_hours, service
│     ├─ schema/index.ts
│     └─ migrations/
├─ apps/
│  ├─ api/src/
│  │  ├─ env.ts                 loadEnv() (Zod)
│  │  ├─ app.ts                 buildApp(deps) → FastifyInstance
│  │  ├─ server.ts              entrypoint HTTP
│  │  ├─ auth/auth.ts           createAuth(db, env)
│  │  ├─ auth/plugin.ts         plugin Fastify: monta /auth/*, decora request.session
│  │  ├─ tenancy/plugin.ts      resolve tenant do header x-tenant-id + membership
│  │  ├─ modules/tenants/{routes,repo}.ts
│  │  ├─ modules/business-hours/{routes,repo}.ts
│  │  ├─ modules/services/{routes,repo}.ts
│  │  └─ test/helpers.ts        testDb(), signUpAndLogin(), createTenantFor()
│  └─ web/
│     ├─ src/lib/api.ts         apiFetch<T>()
│     ├─ src/lib/auth-client.ts createAuthClient (better-auth/react)
│     ├─ src/middleware.ts      proteção de rotas
│     ├─ src/app/(auth)/entrar/page.tsx
│     ├─ src/app/(auth)/cadastro/page.tsx
│     ├─ src/app/onboarding/page.tsx
│     ├─ src/app/(painel)/layout.tsx
│     ├─ src/app/(painel)/inicio/page.tsx
│     ├─ src/app/(painel)/configuracoes/horarios/page.tsx
│     ├─ src/app/(painel)/configuracoes/servicos/page.tsx
│     └─ e2e/*.spec.ts
```

---

### Task 1: Monorepo, ferramentas e Postgres local

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `biome.json`, `docker-compose.yml`, `.env.example`, `.gitignore`, `packages/config/tsconfig.base.json`, `packages/config/package.json`

**Interfaces:**
- Produces: scripts raiz `pnpm dev | build | test | lint | typecheck | db:up | db:down`; Postgres dev em `postgres://ruby:ruby@localhost:5432/ruby`, teste em `postgres://ruby:ruby@localhost:5433/ruby_test`.

- [ ] **Step 1:** Criar arquivos acima (repo git já existe; não rodar `git init`). `pnpm-workspace.yaml` com `apps/*` e `packages/*`. `turbo.json` com pipelines `build`, `dev` (persistent, sem cache), `test`, `lint`, `typecheck`. `biome.json` com formatter (2 espaços, aspas duplas) e linter recomendado; ignorar `**/migrations/**`, `.next`, `dist`.
- [ ] **Step 2:** `docker-compose.yml` com dois serviços `postgres:16`: `db` (5432, volume) e `db_test` (5433, tmpfs).
- [ ] **Step 3:** Verificar: `pnpm install && pnpm db:up && docker compose ps` → ambos `healthy`; `pnpm biome check .` → sem erros.
- [ ] **Step 4: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `chore: bootstrap monorepo (pnpm, turbo, biome, docker)`.

---

### Task 2: `packages/shared` — planos e schemas Zod

**Files:**
- Create: `packages/shared/{package.json,tsconfig.json,vitest.config.ts}`, `src/plans.ts`, `src/tenant.ts`, `src/business-hours.ts`, `src/service.ts`, `src/index.ts`
- Test: `packages/shared/src/*.test.ts`

**Interfaces:**
- Produces:
  - `type PlanId = "free" | "pro" | "business"`
  - `PLANS: Record<PlanId, { name: string; priceBrlCents: number; attendancesPerMonth: number; broadcastsPerMonth: number }>`
  - `createTenantInput` (Zod): `{ name: string(2..80), timezone: string (IANA, default "America/Sao_Paulo") }`
  - `businessHoursInput` (Zod): `{ days: Array<{ weekday: 0..6, intervals: Array<{ open: "HH:mm", close: "HH:mm" }> }> }`
  - `serviceInput` (Zod): `{ name: string(2..80), durationMin: int 5..480, priceBrlCents?: int ≥0, modality: "in_person" | "online" }`

- [ ] **Step 1: Testes que falham**

```ts
// plans.test.ts
expect(PLANS.free).toMatchObject({ priceBrlCents: 0, attendancesPerMonth: 30, broadcastsPerMonth: 0 });
expect(PLANS.pro).toMatchObject({ priceBrlCents: 9000, attendancesPerMonth: 300, broadcastsPerMonth: 500 });
expect(PLANS.business).toMatchObject({ priceBrlCents: 30000, attendancesPerMonth: 1500, broadcastsPerMonth: 3000 });

// business-hours.test.ts
test("rejeita fechamento antes da abertura", () => {
  const r = businessHoursInput.safeParse({ days: [{ weekday: 1, intervals: [{ open: "18:00", close: "09:00" }] }] });
  expect(r.success).toBe(false);
  expect(r.error!.issues[0].message).toBe("O horário de fechamento deve ser depois da abertura");
});
test("rejeita intervalos sobrepostos", () => {
  const r = businessHoursInput.safeParse({ days: [{ weekday: 1, intervals: [{ open: "09:00", close: "12:00" }, { open: "11:00", close: "14:00" }] }] });
  expect(r.error!.issues[0].message).toBe("Os intervalos do mesmo dia não podem se sobrepor");
});
test("aceita dia com almoço", () => {
  expect(businessHoursInput.safeParse({ days: [{ weekday: 1, intervals: [{ open: "09:00", close: "12:00" }, { open: "13:00", close: "18:00" }] }] }).success).toBe(true);
});
test("rejeita weekday duplicado", () => { /* dois objetos weekday 1 → "Dia da semana repetido" */ });

// tenant.test.ts
test("timezone inválido", () => expect(createTenantInput.safeParse({ name: "Barbearia X", timezone: "Mars/Base" }).success).toBe(false));
test("timezone default", () => expect(createTenantInput.parse({ name: "Barbearia X" }).timezone).toBe("America/Sao_Paulo"));
```

- [ ] **Step 2:** `pnpm --filter @ruby/shared test` → FAIL (módulos inexistentes).
- [ ] **Step 3:** Implementar. Timezone válido = `Intl.supportedValuesOf("timeZone").includes(tz)`. Sobreposição via `superRefine` após ordenar por `open`.
- [ ] **Step 4:** Testes → PASS.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(shared): plans and core zod schemas`.

---

### Task 3: `packages/db` — client, schema de tenant/negócio e migrações

**Files:**
- Create: `packages/db/{package.json,drizzle.config.ts}`, `src/client.ts`, `src/schema/{tenant,business,index}.ts`
- Test: `packages/db/src/schema.test.ts`

**Interfaces:**
- Produces:
  - `createDb(url: string): Db` (drizzle + `postgres` driver); `type Db`
  - Tabelas: `tenant(id uuid pk, name text, slug text unique, timezone text, plan_id text default 'free', created_at timestamptz)`; `membership(id, tenant_id fk, user_id text fk→user.id, role text 'owner', unique(tenant_id,user_id))`; `business_hours(id, tenant_id fk, weekday smallint, open time, close time)`; `service(id, tenant_id fk, name, duration_min int, price_brl_cents int null, modality text, active bool default true, created_at)`
  - Índice em `tenant_id` em todas as tabelas de negócio; `on delete cascade` a partir de `tenant`.
  - Scripts: `db:generate`, `db:migrate` (lê `DATABASE_URL`).

- [ ] **Step 1: Teste que falha** — contra `DATABASE_URL` de teste: rodar migrações, inserir tenant + service, deletar tenant e esperar `service` vazio (cascade); inserir `membership` duplicado (mesmo tenant/user) e esperar erro de unicidade.
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Escrever schema; `pnpm db:generate` gera migração em `src/migrations`. (A tabela `user` vem na Task 5; aqui crie `membership.user_id` como `text` e adicione a FK na migração da Task 5.)
- [ ] **Step 4:** Teste → PASS.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(db): tenant, membership, business_hours, service schema`.

---

### Task 4: `apps/api` — Fastify base, env e health

**Files:**
- Create: `apps/api/{package.json,tsconfig.json,vitest.config.ts}`, `src/env.ts`, `src/app.ts`, `src/server.ts`, `src/test/helpers.ts`
- Test: `apps/api/src/app.test.ts`

**Interfaces:**
- Consumes: `createDb` (Task 3)
- Produces:
  - `loadEnv(): Env` — Zod: `DATABASE_URL`, `API_URL`, `WEB_URL`, `BETTER_AUTH_SECRET` (min 32), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NODE_ENV`
  - `buildApp(deps: { db: Db; env: Env }): Promise<FastifyInstance>` — registra `@fastify/cors` (origin `WEB_URL`, credentials true), `@fastify/helmet`, `@fastify/rate-limit`, error handler que converte `ZodError` em `400 { error: "validation", issues }`
  - `GET /health` → `200 { status: "ok" }`
  - `test/helpers.ts`: `testDb(): Promise<Db>` (migra + trunca tabelas), `testApp(): Promise<FastifyInstance>`

- [ ] **Step 1: Testes que falham** — `GET /health` → 200 `{status:"ok"}`; rota de teste que faz `schema.parse` inválido → 400 com `error: "validation"`; `loadEnv` sem `BETTER_AUTH_SECRET` lança.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** PASS; `pnpm --filter @ruby/api dev` responde em `/health`.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(api): fastify base, env validation, health`.

---

### Task 5: Better Auth na API (Google + e-mail/senha)

**Files:**
- Create: `apps/api/src/auth/auth.ts`, `apps/api/src/auth/plugin.ts`, `packages/db/src/schema/auth.ts` (gerado por `@better-auth/cli generate`)
- Modify: `apps/api/src/app.ts`, `packages/db/src/schema/index.ts`
- Test: `apps/api/src/auth/auth.test.ts`

**Interfaces:**
- Consumes: `buildApp`, `Db`, `Env`
- Produces:
  - `createAuth(db: Db, env: Env)` — `betterAuth({ database: drizzleAdapter(db, { provider: "pg" }), emailAndPassword: { enabled: true, minPasswordLength: 8 }, socialProviders: { google: { clientId, clientSecret, scope: ["openid","email","profile"] } }, account: { accountLinking: { enabled: true, trustedProviders: ["google"] } }, trustedOrigins: [env.WEB_URL], baseURL: env.API_URL, basePath: "/auth" })`
  - Rotas `/auth/*` montadas via bridge Fastify → `Request` Web (`auth.handler(webRequest)`)
  - Decorator `request.session: { user: { id: string; email: string; name: string } } | null` (via `auth.api.getSession({ headers })` em `onRequest`)
  - Hook `requireAuth` → 401 `{ error: "unauthorized" }`
  - `test/helpers.ts`: `signUpAndLogin(app, email): Promise<{ cookie: string; userId: string }>`

- [ ] **Step 1: Testes que falham**
  - cadastro por e-mail/senha → 200 e cookie de sessão; `GET /v1/me` com cookie → `{ id, email }`
  - `GET /v1/me` sem cookie → 401
  - senha com 7 caracteres → 400
  - **Review Focus #2:** criar usuário por senha com `ana@x.com`; simular callback do Google para o mesmo e-mail (usar `auth.api` interno ou mock do provider) → `user` count = 1 e `account` count = 2
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar; gerar schema de auth; migração adicionando FK `membership.user_id → user.id`. Criar `GET /v1/me`.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(api): better-auth with google and email/password`.

---

### Task 6: Tenancy — criação de negócio e isolamento

**Files:**
- Create: `apps/api/src/tenancy/plugin.ts`, `apps/api/src/modules/tenants/{routes,repo}.ts`
- Test: `apps/api/src/modules/tenants/tenants.test.ts`, `apps/api/src/tenancy/isolation.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `createTenantInput`
- Produces:
  - `POST /v1/tenants` (auth) body `createTenantInput` → 201 `{ id, name, slug, timezone, planId }`; cria `membership(role:"owner")`; `slug` = kebab do nome + sufixo curto se repetido
  - `GET /v1/tenants` → lista dos tenants do usuário
  - Plugin `tenancy`: lê header `x-tenant-id`; se usuário não tem membership → **404** `{ error: "not_found" }`; decora `request.tenant: { id: string; timezone: string; planId: PlanId }`
  - Hook `requireTenant`
  - Convenção de repositório: toda função recebe `tenantId: string` como 1º parâmetro e inclui `eq(table.tenantId, tenantId)` no `where`

- [ ] **Step 1: Testes que falham**
  - criar tenant → 201, membership owner existe
  - dois tenants com mesmo nome → slugs diferentes
  - **Review Focus #1:** usuário A cria tenant TA; usuário B cria TB; B chama `GET /v1/services` com `x-tenant-id: TA` → 404; A com `x-tenant-id: TB` → 404
  - sem header `x-tenant-id` em rota que exige → 400 `{ error: "tenant_required" }`
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar (a rota `/v1/services` de teste pode ser stub até a Task 7; o teste de isolamento é repetido na Task 7 com dados reais).
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(api): tenant creation and tenancy isolation`.

---

### Task 7: Horários de funcionamento e serviços (API)

**Files:**
- Create: `apps/api/src/modules/business-hours/{routes,repo}.ts`, `apps/api/src/modules/services/{routes,repo}.ts`
- Test: `.../business-hours.test.ts`, `.../services.test.ts`

**Interfaces:**
- Consumes: `requireTenant`, `businessHoursInput`, `serviceInput`
- Produces:
  - `GET /v1/business-hours` → `{ days: [...] }` (formato do input)
  - `PUT /v1/business-hours` body `businessHoursInput` → substitui tudo em transação → 200
  - `GET /v1/services` → `serviceDto[]` (só ativos, ordem por nome)
  - `POST /v1/services` → 201; `PATCH /v1/services/:id` → 200; `DELETE /v1/services/:id` → 204 (soft delete: `active=false`)
  - `serviceDto = { id, name, durationMin, priceBrlCents: number | null, modality }`

- [ ] **Step 1: Testes que falham**
  - PUT horários válidos → GET devolve igual
  - **Review Focus #3:** PUT com close < open → 400 com mensagem "O horário de fechamento deve ser depois da abertura"; sobreposição → 400 "Os intervalos do mesmo dia não podem se sobrepor"
  - CRUD de serviço; DELETE some da listagem
  - isolamento: PATCH em serviço de outro tenant → 404
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(api): business hours and services`.

---

### Task 8: `apps/web` — Next.js base, auth client e telas de login/cadastro

**Files:**
- Create: `apps/web` (Next App Router, Tailwind, shadcn init), `src/lib/auth-client.ts`, `src/lib/api.ts`, `src/app/(auth)/entrar/page.tsx`, `src/app/(auth)/cadastro/page.tsx`
- Test: `apps/web/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: `/auth/*`, `/v1/me` (Task 5)
- Produces:
  - `authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_API_URL + "/auth" })`
  - `apiFetch<T>(path: string, init?: RequestInit & { tenantId?: string }): Promise<T>` — `credentials: "include"`, adiciona `x-tenant-id`, lança `ApiError { status, body }`
  - Telas: "Entrar" (botão "Continuar com Google" + e-mail/senha) e "Criar conta"

- [ ] **Step 1:** Antes de desenhar telas, rodar `/impeccable init` e criar `PRODUCT.md`/`DESIGN.md` (tom: confiável, simples, para dono de negócio local; pt-BR).
- [ ] **Step 2: E2E que falha** — Playwright: cadastrar `teste+{ts}@ruby.dev` / senha 8+ → redireciona para `/onboarding`; sair; entrar com mesma senha → redireciona; senha errada → texto "E-mail ou senha incorretos".
- [ ] **Step 3:** FAIL.
- [ ] **Step 4:** Implementar com componentes shadcn (Form + Zod).
- [ ] **Step 5:** PASS; rodar `web-design-guidelines` nas duas telas e corrigir achados.
- [ ] **Step 6: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(web): auth screens`.

---

### Task 9: Proteção de rotas, onboarding e painel base

**Files:**
- Create: `src/middleware.ts`, `src/app/onboarding/page.tsx`, `src/app/(painel)/layout.tsx`, `src/app/(painel)/inicio/page.tsx`, `src/lib/current-tenant.ts`
- Test: `apps/web/e2e/onboarding.spec.ts`

**Interfaces:**
- Consumes: `POST/GET /v1/tenants`, `apiFetch`
- Produces:
  - Middleware: rotas `(painel)` e `/onboarding` exigem cookie de sessão; senão → `/entrar?next=<path>`
  - `getCurrentTenantId(): string | null` — cookie `ruby_tenant` (setado após criar/selecionar)
  - Layout do painel: navegação lateral (Início, Configurações › Horários, Serviços), nome do negócio, menu do usuário (Sair)
  - Onboarding passo 1: nome do negócio + fuso (select, default São Paulo) → cria tenant → `/configuracoes/horarios`
  - Início: card "Complete a configuração" com checklist (Negócio ✓, Horários, Serviços, WhatsApp [em breve], Google [em breve])

- [ ] **Step 1: E2E que falham**
  - **Review Focus #4:** usuário recém-cadastrado acessa `/inicio` → vai para `/onboarding` (sem 500)
  - criar negócio "Barbearia do Zé" → painel mostra o nome
  - **Review Focus #5:** apagar cookie de sessão e navegar para `/configuracoes/servicos` → `/entrar?next=%2Fconfiguracoes%2Fservicos`; após login volta para `/configuracoes/servicos`
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(web): route protection, onboarding and dashboard shell`.

---

### Task 10: Telas de horários e serviços

**Files:**
- Create: `src/app/(painel)/configuracoes/horarios/page.tsx`, `src/app/(painel)/configuracoes/servicos/page.tsx`, componentes em `src/components/settings/`
- Test: `apps/web/e2e/settings.spec.ts`

**Interfaces:**
- Consumes: `/v1/business-hours`, `/v1/services`, schemas Zod de `@ruby/shared` (validação no client com as mesmas mensagens)

- [ ] **Step 1: E2E que falham**
  - Horários: marcar seg–sex 09:00–18:00 com almoço 12:00–13:00, salvar, recarregar → persiste; tentar 18:00–09:00 → mensagem "O horário de fechamento deve ser depois da abertura"
  - Serviços: criar "Corte" 30 min R$ 40,00 presencial → aparece na lista com "30 min · R$ 40,00"; editar; remover (com confirmação)
  - Checklist do Início marca Horários e Serviços como concluídos
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar. Preço digitado em reais, enviado em centavos.
- [ ] **Step 4:** PASS; rodar `/audit` do Impeccable e `web-design-guidelines`; corrigir.
- [ ] **Step 5: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `feat(web): business hours and services settings`.

---

### Task 11: CI e verificação final da fase

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md` (como rodar local)

- [ ] **Step 1:** CI: Postgres service 16, `pnpm install --frozen-lockfile`, `pnpm biome check .`, `pnpm typecheck`, `pnpm test`, `pnpm --filter @ruby/web exec playwright test`.
- [ ] **Step 2:** Rodar localmente toda a sequência → tudo verde (usar `superpowers:verification-before-completion`).
- [ ] **Step 3:** `superpowers:requesting-code-review` na branch inteira.
- [ ] **Step 4: Entregar sem commit** — NÃO rodar `git add`/`git commit`. Deixar as mudanças no working tree; o Davi faz o commit com a mensagem sugerida `chore: ci and readme`.
