# Ruby — Roadmap de Planos

> Para agentes: a spec (`docs/superpowers/specs/2026-11-16-ruby-design.md`) cobre vários subsistemas independentes. Cada fase abaixo vira **um plano próprio**, escrito com `superpowers:writing-plans` **somente quando a fase anterior estiver concluída e revisada**. Assim cada plano parte do código real, não de suposições.

| # | Plano | Entrega testável | Depende de | Status |
|---|---|---|---|---|
| 1 | `fase-1-fundacao-auth` | Monorepo, Postgres, API Fastify, Better Auth, tenants isolados, painel com login, onboarding, horários e serviços | — | **Plano pronto** |
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

## Bloqueios externos (Davi)
- Meta: Business verificado + Tech Provider + app com Embedded Signup — necessário para testes reais da Fase 2 (até lá, número de teste da Meta).
- Google: tela de consentimento + verificação dos escopos sensíveis — necessário para lançamento (até lá, usuários de teste).
- Stripe: conta Brasil — necessário para a Fase 7 (até lá, modo teste).
