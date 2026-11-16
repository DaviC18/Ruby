# Ruby — Documento de Design (Spec)

**Data:** 2026-11-16
**Autor:** Davi Curty (produto) · Claude (redação)
**Status:** Aguardando aprovação

> Legenda: itens marcados **[decisão do Davi]** foram definidos por ele. Itens marcados **[escolha do Claude]** foram propostos e aceitos em conversa ou são decisões menores tomadas na redação. Itens marcados **[a cargo do builder]** ficam livres para quem implementar.

---

## 1. Intenção e porquê

O Ruby é um **SaaS de automação de WhatsApp** para negócios locais e clínicas, integrado ao **Google Calendar, Google Meet e Google Planilhas**. O dono do negócio assina por mensalidade e o Ruby atende os clientes dele pelo WhatsApp, agenda, confirma, lembra e registra tudo — **sem o dono mexer um dedo nas respostas previsíveis**. [decisão do Davi]

- Modelo: o dono paga **mensalidade pelo serviço**; não compra um agente sob medida. [decisão do Davi]
- Referência de experiência: **Pierre** (web + app + WhatsApp). [decisão do Davi]
- Público: **qualquer negócio local ou clínica** (barbearias, cafeterias, lanchonetes, consultórios), sem nicho. [decisão do Davi]
- IA: entra **no futuro**, como plano superior, substituindo o menu guiado por compreensão de texto livre. [decisão do Davi]

## 2. Atores

| Ator | Onde usa | O que faz |
|---|---|---|
| **Dono (assinante)** | Sistema web (desktop/navegador); app mobile depois | Configura menu, automações, conexões; acompanha painel |
| **Cliente do dono** | Somente WhatsApp | Conversa com o Ruby, agenda, confirma, remarca |
| **Davi (operador da plataforma)** | Painel admin interno | Vê assinantes, planos, uso, erros |

O dono **não** conversa com o Ruby pelo WhatsApp na v1. [decisão do Davi]

## 3. Objetivos, não-objetivos e anti-objetivos

### Objetivos (v1)
1. Dono se cadastra sozinho, conecta WhatsApp Business (API oficial da Meta) e Google, monta o menu e começa a atender — sem ajuda do Davi.
2. Cliente agenda pelo WhatsApp via menu guiado; evento criado no Google Calendar (com Meet se online); linha registrada em planilha.
3. Automações por **modelos prontos e ajustáveis** (seção 6).
4. Painel mostra conversas, agendamentos, reuniões, registros em planilha e consumo do plano.
5. Cobrança recorrente via Stripe com planos e limites.
6. Isolamento total de dados entre assinantes.

### Não-objetivos (v1)
- App mobile (vem depois do web pronto; framework a definir). [decisão do Davi]
- IA / texto livre.
- Editor livre de fluxos (estilo n8n). A estrutura deve permitir adicioná-lo depois. [escolha do Claude]
- Dono conversando com o Ruby pelo WhatsApp.
- Múltiplos números de WhatsApp por assinante.
- Pix recorrente (Stripe BR não oferece Pix Automático de forma confiável; reavaliar).

### Anti-objetivos (falha mesmo que "funcione")
- Um assinante ver qualquer dado de outro.
- Mensagem automática enviada duas vezes ao mesmo cliente (lembrete duplicado) ou enviada fora do horário configurado.
- Agendamento em horário já ocupado no Calendar.
- O dono ter que pedir ajuda ao Davi para configurar o básico.
- Interface com cara genérica de "template de IA".

## 4. Restrições

- **WhatsApp:** somente **API oficial (Cloud API)**. O Ruby atua como **Meta Tech Provider** com **Embedded Signup** e **coexistência** (dono mantém o app WhatsApp Business no celular). [decisão do Davi]
- **Custos de envio da Meta** são cobrados **diretamente do dono** (forma de pagamento na WABA dele). O Ruby não revende mensagens. [escolha do Claude, aceita]
- **Mensagens iniciadas pelo Ruby** fora da janela de 24h exigem **templates aprovados pela Meta** (categoria utilidade). Lembretes/confirmações usam templates.
- **Google:** escopos de Calendar e Sheets são sensíveis → app precisa de **verificação do Google** antes do lançamento público. Preferir `drive.file` (acesso só aos arquivos criados pelo Ruby) ao escopo amplo de Sheets. [escolha do Claude]
- **Verificações (Meta Tech Provider + Google)** são responsabilidade do Davi e **bloqueiam o lançamento público**, não o desenvolvimento. [decisão do Davi]
- Fuso horário: cada negócio tem seu fuso (default `America/Sao_Paulo`); todo horário é armazenado em UTC.
- LGPD: dados de clientes finais (nome, telefone, conversas) pertencem ao assinante; prever exclusão de conta e exportação. [escolha do Claude]

## 5. Planos e limites [decisão do Davi]

Unidade de cobrança: **atendimento** = uma conversa com **um cliente** dentro de uma **janela de 24h**, independentemente do número de mensagens. Contagem **mensal** (ciclo da assinatura).

| Plano | Preço | Atendimentos/mês | Disparo para lista |
|---|---|---|---|
| Free | R$ 0 | 30 | bloqueado [escolha do Claude] |
| Pro | R$ 90 | 300 | limite separado [a definir pelo Davi; default 500 envios/mês] |
| Empresarial | R$ 300 | 1.500 | limite separado [default 3.000 envios/mês] |

- Ao atingir o limite: o Ruby **para de responder automaticamente** novas conversas, encaminha para "falar com atendente" (mensagem fixa) e avisa o dono no painel e por e-mail. Lembretes de agendamentos já criados **continuam**. [escolha do Claude]
- Aviso ao dono em 80% e 100% do limite. [escolha do Claude]
- Limites ficam em constante compartilhada (`packages/shared/plans.ts`) para valer em front e back.

## 6. Funcionalidades

### 6.1 Onboarding (self-service)
1. Cadastro/login (Google ou e-mail/senha).
2. Dados do negócio: nome, fuso, endereço, horário de funcionamento por dia da semana.
3. Serviços: nome, duração, preço (opcional), modalidade (presencial/online).
4. Conectar **WhatsApp** (Embedded Signup da Meta, com opção de coexistência).
5. Conectar **Google** (passo separado do login; pede Calendar + `drive.file`). Escolher qual calendário usar.
6. Montar o **menu** (vem pré-preenchido com um padrão).
7. Ligar automações (vêm com padrões sensatos).
8. Escolher plano (Free por padrão).

Checklist de onboarding visível no painel até ser concluído.

### 6.2 Menu guiado (atendimento do cliente)
- Primeira mensagem do cliente (ou palavra "menu") → Ruby envia saudação + opções.
- Opções padrão: **1 Agendar · 2 Remarcar/Cancelar · 3 Falar com atendente**. O dono pode renomear, reordenar, desativar e adicionar opções do tipo **"resposta fixa"** (ex.: endereço, preços, horário).
- Preferir **mensagens interativas** do WhatsApp (botões/listas); aceitar também o número digitado.
- Fluxo **Agendar**: escolher serviço → escolher dia (próximos N dias com vaga) → escolher horário livre → pedir nome (se cliente novo) → confirmar → criar evento.
- Fluxo **Remarcar/Cancelar**: lista os agendamentos futuros do telefone → cancelar ou voltar ao fluxo Agendar.
- Fluxo **Atendente**: pausa o bot para aquele cliente por X horas (configurável, default 12h) e notifica o dono. O dono responde pelo app WhatsApp Business no celular (coexistência) ou pelo painel.
- Mensagem fora do menu → reenviar menu ("Não entendi. Escolha uma opção:").
- **Disponibilidade** = horário de funcionamento − eventos ocupados no Google Calendar (free/busy) − agendamentos do Ruby, respeitando duração do serviço e antecedência mínima (default 2h). [escolha do Claude]
- Conversa tem **estado** (máquina de estados por cliente) com expiração (default 30 min sem resposta → volta ao início).

### 6.3 Automações (modelos prontos) [escolha do Claude, aceita]
Cada uma: ligar/desligar, editar texto (com variáveis `{nome}`, `{servico}`, `{data}`, `{hora}`, `{link_meet}`, `{negocio}`), ajustar tempo.

**Para clientes**
1. **Confirmação de agendamento** — imediata ao agendar; para eventos criados direto no Calendar pelo dono, pedido de confirmação "1 Confirmo / 2 Remarcar" X horas antes (default 24h).
2. **Lembrete** — X horas antes (default 2h), com link do Meet se online.
3. **Pós-atendimento** — X horas depois (default 3h), agradecimento/pedido de avaliação (link configurável).
4. **Disparo para lista** — mensagem (template) para contatos de uma planilha ou de uma tag; só planos pagos; respeita limite.

**Para o dono** (notificação no painel + e-mail; push no app futuro)
5. **Resumo do dia** — todo dia em horário configurado: agenda do dia e status de confirmação.
6. **Avisos na hora** — cliente confirmou, cancelou, pediu atendente, limite do plano.

Toda automação agendada roda via **pg-boss** com chave de idempotência (`automacao + agendamento + tipo`) para nunca enviar em dobro. Se o agendamento é cancelado/remarcado, jobs pendentes são cancelados/reagendados.

### 6.4 Integração Google
- **Calendar:** ler free/busy; criar/atualizar/cancelar eventos; adicionar **Google Meet** (conferenceData) quando serviço é online; receber mudanças feitas pelo dono direto no Calendar (push notifications/watch, com sincronização incremental via `syncToken`; fallback polling a cada 10 min). [escolha do Claude]
- **Planilhas:** o Ruby cria uma planilha "Ruby — Agendamentos" no Drive do dono e acrescenta uma linha por agendamento/alteração (data, cliente, telefone, serviço, status). Opcional: planilha "Ruby — Contatos". Disparo para lista pode ler contatos de planilha **criada ou escolhida via Picker** (compatível com `drive.file`).
- Tokens OAuth (refresh token) guardados criptografados no banco; renovação automática; se revogado → marcar integração como desconectada e avisar o dono.

### 6.5 Painel do dono (web)
- **Início:** agenda de hoje, próximos agendamentos, consumo do plano, pendências do onboarding.
- **Conversas:** lista por cliente, histórico, status (bot/atendente), botão "retomar bot", responder manualmente (dentro da janela de 24h).
- **Agendamentos:** lista/calendário, filtros, status (pendente, confirmado, cancelado, concluído, não compareceu).
- **Clientes:** contatos (nome, telefone, tags, histórico).
- **Menu & Automações:** edição com pré-visualização estilo WhatsApp.
- **Integrações:** status WhatsApp/Google, reconectar.
- **Plano & Cobrança:** plano atual, uso, upgrade, portal do Stripe.
- **Configurações:** negócio, horários, serviços, membros (futuro).

### 6.6 Admin interno (Davi)
- Lista de assinantes, plano, uso, status das integrações, erros recentes de webhook/jobs. Acesso por papel `platform_admin`.

### 6.7 Cobrança
- **Stripe Billing** (cartão) com Checkout + Customer Portal. [decisão do Davi]
- Webhooks do Stripe atualizam `subscription` local (status, plano, período).
- Inadimplência: período de tolerância (default 7 dias) → volta para Free.
- Módulo de cobrança isolado (interface `BillingProvider`) para permitir Asaas/Pix depois. [escolha do Claude]

## 7. Abordagens consideradas

| Abordagem | Prós | Contras | Resultado |
|---|---|---|---|
| **A. Next.js + Supabase (BaaS)** | Mais rápido para lançar | Menos controle; lógica espalhada | Descartada |
| **B. Next.js (web) + Fastify (API) + Postgres/Drizzle, monorepo** | Controle total; back-end único reaproveitado pelo mobile; stack que o Davi domina | Mais código para manter | **Escolhida pelo Davi** |
| C. n8n/no-code como núcleo | Rápido para protótipo | Não serve para multi-tenant com limites por plano | Descartada |

Outras escolhas: **WhatsApp** API oficial (vs. QR code não oficial — risco de banimento) [decisão do Davi]; **Auth** Better Auth no back-end (vs. Clerk — tokens Google e usuários fora do nosso banco) [decisão do Davi]; **Fila** pg-boss (vs. BullMQ — exige Redis) [decisão do Davi]; **Automação** modelos prontos (vs. editor livre) [decisão do Davi]; **Cobrança** atendimentos/mês (vs. mensagens enviadas+recebidas) [decisão do Davi].

## 8. Arquitetura técnica

### 8.1 Stack [decisão do Davi]
- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** Next.js (App Router), React, TypeScript, Tailwind, shadcn/ui; GSAP para animações (com `prefers-reduced-motion`)
- **API:** Node.js + Fastify (TypeScript)
- **Banco:** PostgreSQL; ORM **Drizzle**; validação **Zod**; hospedagem **Neon** [escolha do Claude — MongoDB descartado por não ser Postgres]
- **Fila/agendamentos:** pg-boss (no mesmo Postgres)
- **Auth:** Better Auth (Google + e-mail/senha), adapter Drizzle, rodando no Fastify
- **Cobrança:** Stripe Billing
- **Local:** Docker Compose (Postgres)
- **Qualidade:** Biome (lint + format), TypeScript strict
- **Testes:** Vitest (unidade/integração na API com Postgres de teste), Playwright (E2E web) [escolha do Claude]
- **Mobile:** depois; framework a definir [decisão do Davi]

### 8.2 Estrutura do repositório
```
ruby/
├─ apps/
│  ├─ web/          Next.js — painel do dono + admin + landing
│  ├─ api/          Fastify — REST, webhooks, Better Auth, workers pg-boss
│  └─ mobile/       (futuro)
├─ packages/
│  ├─ db/           schema Drizzle, migrações, client
│  ├─ shared/       schemas Zod, tipos, constantes de planos, utils de data
│  └─ config/       tsconfig base
├─ docker-compose.yml
├─ biome.json
├─ turbo.json
└─ pnpm-workspace.yaml
```

### 8.3 Processos
- **api (HTTP):** rotas REST `/v1/...`, `/auth/*` (Better Auth), `/webhooks/whatsapp`, `/webhooks/stripe`, `/webhooks/google-calendar`.
- **worker:** mesmo pacote `apps/api`, entrypoint separado, roda handlers do pg-boss (envio de mensagens, lembretes, sync Calendar, resumo diário, append em planilha).
- **web:** Next.js consome a API via cliente tipado (tipos/Zod do `packages/shared`). Sessão via cookie do Better Auth (domínio compartilhado, ex.: `app.ruby...` e `api.ruby...`). [escolha do Claude]

### 8.4 Fluxo de mensagem recebida
1. Meta → `POST /webhooks/whatsapp` → validar assinatura (`X-Hub-Signature-256`) → responder 200 rápido → enfileirar job `inbound.process` (dedupe por `message.id`).
2. Worker: resolver tenant pelo `phone_number_id` → upsert contato → registrar mensagem → contar atendimento (abre nova janela de 24h se não houver) → checar limite do plano → rodar máquina de estados do menu → enfileirar `outbound.send`.
3. `outbound.send`: chama Cloud API, registra status; atualiza com webhooks de status (sent/delivered/read/failed).
4. Mensagens "echo" da coexistência (enviadas pelo dono no celular) → registradas no histórico e pausam o bot para aquele cliente. [escolha do Claude]

### 8.5 Modelo de dados (inicial)
Toda tabela de negócio tem `tenant_id` e toda consulta passa por um helper que exige `tenant_id` (camada de repositório). [escolha do Claude]

- `user`, `session`, `account`, `verification` — Better Auth
- `tenant` — negócio (nome, fuso, slug)
- `membership` — user ↔ tenant, papel (`owner`; `staff` futuro)
- `business_hours` — tenant, dia da semana, abre, fecha
- `service` — nome, duração_min, preço, modalidade
- `whatsapp_connection` — waba_id, phone_number_id, número, token (criptografado), status, coexistência
- `google_connection` — google_account_email, refresh_token (criptografado), calendar_id, spreadsheet_id, watch_channel, sync_token, status
- `contact` — telefone (E.164), nome, tags, opt_out
- `conversation` — contact, estado da máquina, contexto (jsonb), bot_paused_until, last_inbound_at
- `message` — conversation, direção, tipo, conteúdo, wa_message_id (único), status
- `attendance` — contact, janela_inicio, janela_fim, ciclo (para contagem do plano)
- `appointment` — contact, service, início, fim, status, google_event_id, meet_link, origem (ruby/calendar)
- `menu` / `menu_option` — ordem, rótulo, tipo (agendar/remarcar/atendente/resposta_fixa), payload
- `automation` — tipo, ativo, offset_minutos, template_name, texto, variáveis
- `wa_template` — nome, idioma, categoria, status de aprovação na Meta
- `broadcast` — template, público (planilha/tag), status, contagens
- `subscription` — plano, status, stripe_customer_id, stripe_subscription_id, período
- `usage_counter` — tenant, ciclo, atendimentos, disparos
- `notification` — para o dono (tipo, lida)
- `audit_log` — ações relevantes

### 8.6 Segurança
- Tokens (Meta, Google) criptografados em repouso (AES-256-GCM, chave em env).
- Validação de assinatura em todos os webhooks.
- Zod em toda entrada; rate limit nas rotas públicas.
- Testes automatizados de isolamento entre tenants.
- Segredos só via variáveis de ambiente; `.env.example` versionado.

## 9. Diretrizes para agentes (Claude Code)

### 9.1 Processo — Superpowers
- `writing-plans` → plano; `subagent-driven-development` ou `executing-plans` → execução
- `test-driven-development` obrigatório no back-end crítico: webhooks, máquina de estados, disponibilidade, contagem de atendimentos, automações/pg-boss, cobrança
- `systematic-debugging` em qualquer bug; `requesting-code-review` ao fim de cada fase; `verification-before-completion` antes de dizer "pronto"
- `using-git-worktrees` para cada fase

### 9.2 Skills de tecnologia
| Área | Skill | Instalação |
|---|---|---|
| Descoberta | find-skills | `npx skills add vercel-labs/skills --skill find-skills` |
| Design do painel | impeccable | `npx skills add pbakaus/impeccable` |
| Landing page | taste-skill | `npx skills add Leonxlnx/taste-skill` |
| Animação | gsap-skills (gsap-react) | `npx skills add https://github.com/greensock/gsap-skills` |
| React/Next | vercel-react-best-practices, vercel-composition-patterns, web-design-guidelines | `npx skills add vercel-labs/agent-skills` |
| Next.js | next-best-practices | `npx skills add vercel-labs/vercel-skills --skill next-best-practices` |
| UI | shadcn | `npx skills add shadcn/ui` |
| Auth | better-auth | `npx skills add better-auth/skills` |
| Pagamento | stripe-best-practices | `npx skills add stripe/ai --skill stripe-best-practices` |
| Testes E2E | webapp-testing | `npx skills add anthropics/skills --skill webapp-testing` |

Regras: **Impeccable no painel; Taste só na landing** (evitar regras conflitantes). Fastify, Drizzle e pg-boss: seguir documentação oficial (não há skill confiável). Acessibilidade: rodar `web-design-guidelines` e `/audit` do Impeccable antes de concluir cada tela.

### 9.3 Convenções
- Idioma da interface: **português (pt-BR)**; código e nomes técnicos em inglês.
- Biome sem erros; `tsc --noEmit` sem erros; testes passando antes de cada commit.
- Commits pequenos e convencionais (`feat:`, `fix:`, `chore:`...).

## 10. Fases de entrega [escolha do Claude]
A ordem e o escopo de cada fase estão em `docs/superpowers/plans/2026-11-16-ruby-roadmap.md`. Resumo: (1) fundação + auth + tenants + horários/serviços → (2) WhatsApp → (3) menu guiado → (4) Google → (5) agendamento ponta a ponta → (6) automações → (7) planos e Stripe → (8) disparos → (9) painel completo e admin → (10) landing, polimento e lançamento → depois: mobile e IA.

## 11. Dependências externas (bloqueiam lançamento, não desenvolvimento)
- Conta Meta Business verificada + cadastro como **Tech Provider** + app Meta com WhatsApp e Embedded Signup — **Davi**.
- **Verificação do app no Google** (escopos sensíveis) + tela de consentimento — **Davi**.
- Conta **Stripe** Brasil — **Davi**.
- Durante o desenvolvimento: usar número de teste da Meta e usuários de teste do Google.

## 12. Deixado para o builder
- Bibliotecas auxiliares (ex.: cliente HTTP, date-fns vs. dayjs, componentes de calendário).
- Detalhes visuais (o Impeccable guia).
- Estrutura interna de pastas dentro de cada app.
- Estratégia de deploy (sugestão: web na Vercel; API + worker em serviço de container, ex.: Railway/Fly/Render). [escolha do Claude — o Davi pode trocar]

## 13. Questões em aberto (não bloqueiam a v1)
- Limites exatos de disparo para lista por plano.
- Framework do mobile.
- Gateway com Pix recorrente (Asaas) — depois.
- Nome de domínio e identidade visual do Ruby.
