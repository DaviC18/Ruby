---
version: 1
slug: "app-painel-inicio-page-tsx"
primary_target: "app/(painel)/inicio/page.tsx"
related_targets: ["app/(painel)/layout.tsx"]
---

# Painel — shell + Início

Mode: Operate. Audience: owner of a local business/clinic glancing at the panel between clients. Job: know in seconds who is now, who is next, and what needs them. Data is synthetic until the API phases land; label it.

## Direction contract

THESIS: The day is a call board, not a dashboard. Início opens on the clinic reception's call panel ("Agora / Próximos"), refusing the KPI-card grid of generic SaaS.

OWN-WORLD: Dark warm-black housing for the side rail and the call panel; light tinted ground for work areas. Ruby red is primary: actions, the "agora" digits, selection. Chivo for UI, Chivo Mono tabular digits for every time. No WhatsApp green.

STORY: The owner sees the current appointment, the next three, what changed (remarcado/cancelado, held lit until marked seen), conversations waiting for an attendant, plan usage. Acts with one click.

FIRST VIEWPORT: Left rail 240px with Ruby wordmark and nav. Main: header with business name and date; full-width call panel (current time in ~72px ruby mono digits, client, service; three next rows); below, two columns: agenda de hoje (wide) and "Precisa de você" + consumo do plano + checklist (narrow).

FORM: Clinic call-number board, candidate 4 of 7. seed:611941ca978d9cc8. Raises: from boarding-pass gate board, changes stay lit until seen; from warm consumer app, ruby reserved for action and "now"; from Crouwel grid, digits set on a strict tabular grid.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
