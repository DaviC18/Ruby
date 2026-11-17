# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the **owner (subscriber)** of a local business or clinic — barbershops, cafés, snack bars, medical/therapy offices; no niche. Non-technical. Uses the web panel (desktop/browser) in short glances **between serving customers**: checks today's agenda, conversations needing attention, and plan usage, then returns to work. Configures menu, automations, and connections once and expects to forget about them.

Secondary audiences:
- **The owner's customers** never see the panel; they interact with Ruby only through WhatsApp.
- **Platform operator (Davi)** uses an internal admin view (`platform_admin`) for subscribers, plans, usage, and webhook/job errors.

Staff members are a future feature (not v1).

## Product Purpose

Ruby is a subscription SaaS that automates WhatsApp customer service for local businesses and clinics, integrated with Google Calendar, Google Meet, and Google Sheets. It answers customers through a guided menu, books, confirms, reminds, and records everything — so the owner never touches predictable replies.

Success: the owner signs up alone, connects WhatsApp and Google, builds the menu, and starts serving customers **without asking anyone for help**.

## Positioning

**Zero effort for the owner.** Self-service setup in minutes with sensible defaults (pre-filled menu, ready-made automation templates), after which Ruby handles every predictable conversation. Supporting facts: official WhatsApp Cloud API with coexistence (owner keeps the WhatsApp Business app on the phone), and data lives in the owner's own Google Calendar and Sheets.

## Operating Context

- Owner's customers chat on WhatsApp: guided menu (1 Agendar · 2 Remarcar/Cancelar · 3 Falar com atendente), interactive buttons/lists, fixed-answer options.
- Owner may reply manually from the WhatsApp Business phone app (coexistence) or from the panel within the 24h window; "falar com atendente" pauses the bot for that customer.
- Appointments land in the owner's Google Calendar (with Meet when online) and as rows in a "Ruby — Agendamentos" sheet.
- Owner receives a daily summary and real-time alerts (confirmed, cancelled, attendant requested, plan limit) in the panel and by e-mail.
- Panel sections: Início, Conversas, Agendamentos, Clientes, Menu & Automações (with WhatsApp-style preview), Integrações, Plano & Cobrança, Configurações. Onboarding checklist stays visible until complete.

## Capabilities and Constraints

- Interface language: **pt-BR**. Code and technical names in English.
- Plans (billing unit = *atendimento*: one conversation with one customer within a 24h window, counted monthly): Free R$0 / 30; Pro R$90 / 300; Empresarial R$300 / 1.500. Limits live in `packages/shared/plans.ts`. Warnings at 80% and 100%; at the limit Ruby stops auto-replying new conversations.
- WhatsApp: official Cloud API only; Meta messaging costs are billed to the owner directly. Ruby-initiated messages outside 24h require Meta-approved templates.
- Automation is template-based (toggle, edit text with variables `{nome}`, `{servico}`, `{data}`, `{hora}`, `{link_meet}`, `{negocio}`, adjust timing) — no free-form flow editor in v1.
- Billing: Stripe (card). Each business has its own timezone (default `America/Sao_Paulo`).
- Not in v1: mobile app, AI/free text, owner chatting with Ruby via WhatsApp, multiple numbers per subscriber.
- Undecided: domain name and visual identity of Ruby; exact broadcast limits per plan; mobile framework.

## Brand Commitments

- Name: **Ruby**.
- Primary color: **ruby red**, pinned by the owner. It is the brand's primary color across the interface.
- Voice: **professional and sober** — cordial, formal, precise; suited to clinics and serious service businesses. Applies to the panel and to default customer-facing messages.
- Explicit anti-goal: the interface must not look like a generic "AI template".

## Evidence on Hand

None yet: no customers, testimonials, metrics, logos, or press. Future work must not fabricate any of them.

## Product Principles

1. **The owner should never need help.** Every setup step is self-explanatory and ships with a sensible default.
2. **Glanceable over exhaustive.** The panel answers "what needs me right now?" in seconds; detail is one step away.
3. **Never surprise a customer.** No duplicate messages, no sends outside configured hours, no double-booking — reliability is the product.
4. **The owner's data stays the owner's.** Their Calendar, their Sheets, their WhatsApp; strict tenant isolation, LGPD export and deletion.
5. **Sober, not generic.** Professional restraint without falling into template sameness.

## Accessibility & Inclusion

Respect `prefers-reduced-motion` for all GSAP animation. Run accessibility audits before completing each screen. No product-specific standard beyond that was established.
