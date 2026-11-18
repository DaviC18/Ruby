# Ruby — Roadmap de Planos

> Para agentes: a spec (`docs/specs/2026-11-16-ruby-design.md`) cobre vários subsistemas independentes. Cada fase abaixo vira **um plano próprio**, escrito com `superpowers:writing-plans` **somente quando a fase anterior estiver concluída e revisada**. Assim cada plano parte do código real, não de suposições.

## Regra de commits (vale para todas as fases)
- **Commits são feitos pelo Davi.** Nenhum agente roda `git add`, `git commit`, `git push` ou altera branches.
- Todo plano de fase traz esta regra em "Global Constraints", e o último step de cada task é **"Entregar sem commit"**, com a mensagem sugerida. O agente para e aguarda o Davi confirmar o commit antes da próxima task.
- **Fim de fase:** a última task de cada plano termina com a verificação completa, sem commit. O agente para, entrega o resumo da fase e as mensagens sugeridas, e aguarda o Davi commitar e revisar. Só depois o plano da fase seguinte é escrito.

| # | Plano | Entrega testável | Depende de | Status |
|---|---|---|---|---|
| 1 | `fase-1-fundacao-auth` | Monorepo, Postgres, API Fastify, Better Auth, tenants isolados, painel com login, onboarding, horários e serviços | — | **Em execução** (Tasks 1–7 ok; 7.1 pendente; 8 em andamento) |
| 2 | `fase-2-whatsapp` | Embedded Signup (coexistência), webhook assinado, fila pg-boss (`inbound.process`, `outbound.send`), contatos, conversas e histórico no painel, resposta manual dentro da janela de 24h | 1 | A escrever |
| 3 | `fase-3-menu-guiado` | Editor de menu no painel com pré-visualização; máquina de estados por conversa (expiração 30 min); opções agendar/remarcar/atendente/resposta fixa; pausa do bot; echoes da coexistência | 2 | A escrever |
| 4 | `fase-4-google` | Conexão Google separada do login (Calendar + `drive.file`), tokens criptografados, free/busy, criação de eventos com Meet, sync incremental (watch + syncToken), planilha "Ruby — Agendamentos" | 1 | A escrever |
| 5 | `fase-5-agendamento` | Cálculo de disponibilidade (horários − ocupado − antecedência 2h), fluxo agendar/remarcar/cancelar ponta a ponta, tela de Agendamentos | 3, 4 | A escrever |
| 6 | `fase-6-automacoes` | Templates da Meta, confirmação, lembrete, pós-atendimento, resumo do dia, avisos ao dono, idempotência e cancelamento de jobs | 5 | A escrever |
| 7 | `fase-7-planos-cobranca` | Contagem de atendimentos (janela 24h, ciclo mensal), avisos 80%/100%, bloqueio ao atingir limite, Stripe Checkout + Portal + webhooks, `BillingProvider` | 2 | A escrever |
| 8 | `fase-8-disparos` | Disparo para lista (planilha/tag), limite por plano, opt-out | 6, 7 | A escrever |
| 9 | `fase-9-painel-admin` | Notificações, tela Clientes, admin interno (`platform_admin`), exclusão/exportação de dados (LGPD) | 7 | A escrever |
| 10 | `fase-10-lancamento` | Landing page (Taste + GSAP), polimento (Impeccable `/polish`, `/audit`), acessibilidade, E2E completos, deploy, checklist de verificação Meta/Google | todas | A escrever |
| — | Mobile | Framework a definir pelo Davi após o web | 10 | Futuro |
| — | IA | Texto livre substituindo o menu, plano superior | 10 | Futuro |

Fases 2 e 4 podem andar em paralelo após a 1.

## O que vem do Mariana-Core em cada fase
Tabela completa na spec, seção 8.7. Resumo:
- **Fase 2:** `verify-webhook-signature`, `integrations/whatsapp/*`, `whatsapp-compliance`, logger/error-classification/retry, guardas de teste; lógica de dedup do webhook e da outbox com idempotência.
- **Fase 3:** lógica de `active-conversation`, `session-rotation`, `inbound-message-batch`, `stale-tap-reply`.
- **Fase 4:** `google-calendar-errors`, `calendar-connection-health`, `signed-token`; lógica do OAuth (`auth-google.ts`) e do `google-calendar-service` (evento + Meet).
- **Fase 5:** lógica de `services/calendar/*` (disponibilidade, oferta com botões, confirmar/cancelar, expiração) e `appointment-service` (compensação).
- **Fase IA (futuro):** referência `services/flow-v2/`.

Ao escrever o plano de cada fase, o agente lê os arquivos do Mariana listados e adapta para `tenant_id`, npm e Drizzle 1.0.

## Decisão pendente antes do plano da Fase 2
**Agenda por negócio ou por profissional?** Ver spec, seção 13.

## Bloqueios externos (Davi)
- Meta: Business verificado + Tech Provider + app com Embedded Signup — necessário para testes reais da Fase 2 (até lá, número de teste da Meta).
- Google: tela de consentimento + verificação dos escopos sensíveis — necessário para lançamento (até lá, usuários de teste).
- Stripe: conta Brasil — necessário para a Fase 7 (até lá, modo teste).
