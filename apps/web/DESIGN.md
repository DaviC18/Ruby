---
name: Ruby
description: Owner's panel for WhatsApp service and booking; the day read as a reception call board.
colors:
  primary: "oklch(0.5 0.19 18)"
  primary-foreground: "oklch(0.985 0.004 20)"
  accent-now: "oklch(0.945 0.024 18)"
  accent-now-foreground: "oklch(0.42 0.17 18)"
  ground: "oklch(0.975 0.004 20)"
  ink: "oklch(0.2 0.014 20)"
  paper: "oklch(0.995 0.002 20)"
  muted: "oklch(0.945 0.006 20)"
  muted-foreground: "oklch(0.47 0.014 20)"
  hairline: "oklch(0.905 0.008 20)"
  input-stroke: "oklch(0.88 0.01 20)"
  housing: "oklch(0.19 0.012 20)"
  housing-foreground: "oklch(0.95 0.006 20)"
  housing-muted: "oklch(0.72 0.014 20)"
  housing-raised: "oklch(0.255 0.018 20)"
  housing-line: "oklch(1 0 0 / 9%)"
  housing-ruby: "oklch(0.66 0.2 22)"
  board-glow: "oklch(0.68 0.21 24)"
  changed: "oklch(0.72 0.15 70)"
  changed-surface: "oklch(0.96 0.045 85)"
  changed-foreground: "oklch(0.42 0.09 60)"
  destructive: "oklch(0.55 0.2 28)"
typography:
  display:
    fontFamily: "Chivo Mono, ui-monospace, monospace"
    fontSize: "4.5rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\" 1"
  headline:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
  time:
    fontFamily: "Chivo Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "\"tnum\" 1"
  time-board:
    fontFamily: "Chivo Mono, ui-monospace, monospace"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.33
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "4.8px"
  md: "6.4px"
  lg: "8px"
  xl: "11.2px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "oklch(0.5 0.19 18 / 0.8)"
  button-outline:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-seen:
    textColor: "{colors.changed-foreground}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "28px"
  nav-item:
    textColor: "{colors.housing-muted}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.housing-raised}"
    textColor: "{colors.housing-foreground}"
  call-board:
    backgroundColor: "{colors.housing}"
    textColor: "{colors.housing-foreground}"
    rounded: "{rounded.xl}"
    padding: "32px"
  agenda-row-now:
    backgroundColor: "{colors.accent-now}"
    textColor: "{colors.primary}"
    padding: "12px 8px"
  agenda-row-changed:
    backgroundColor: "{colors.changed-surface}"
    textColor: "{colors.changed-foreground}"
    padding: "12px 8px"
  now-tag:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  count-badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "0 6px"
---

# Design System: Ruby

## Overview

**Creative North Star: "The Reception Call Board"**

Ruby's panel reads the owner's day the way a clinic waiting room reads its call-number board: what is happening now, who is next, what changed. The board and the side rail are warm-black housings, the fixed hardware of the room; the work areas sit on a light ground tinted faintly toward ruby. Information is set on a strict grid of tabular digits, so a glance between customers is enough.

The system is sober and dense without being crowded. Color is spent only on meaning: ruby marks what is now and what the owner can act on; amber marks what is unsettled and stays lit until the owner says they have seen it. Everything else is warm neutral. Sections below the board are ruled, not boxed: a heavy foreground rule opens each one, hairlines separate rows, and the ground shows through.

The panel refuses the generic SaaS dashboard: no KPI-card grid, no blue or green status palette, no WhatsApp green.

**Key Characteristics:**
- Warm-black housing (rail, call board) against a light ruby-tinted ground.
- Ruby as the single accent; amber as the single change signal.
- Every clock time in Chivo Mono tabular figures.
- Ruled sections with hairline rows instead of cards.
- Depth from tone, not shadow; one soft drop under the call board.

## Colors

A warm-neutral field, all neutrals tinted toward the ruby hue (about 20), with one red accent and one amber signal.

### Primary
- **Ruby** (primary): buttons that act, the "Agora" tag, the current agenda row's time and lamp, attendant-request counts, the plan meter once usage reaches 80%, focus rings, the caret.
- **Ruby Wash** (accent-now / accent-now-foreground): the background of the agenda row that is happening now.
- **Lit Ruby** (housing-ruby, board-glow): ruby lifted in lightness so it holds on the warm-black housing. housing-ruby carries the rail's active mark, active icon, wordmark gem and nav counts; board-glow carries the Agora digits and the board lamp.

### Secondary
- **Signal Amber** (changed / changed-surface / changed-foreground): the only change signal. A remarcado or cancelado appointment gets the amber surface, amber text, a pulsing amber lamp and a "Marcar como visto" control; the surface stays until marked seen. Appointments awaiting confirmation take amber text only, never the held surface.

### Neutral
- **Tinted Ground** (ground): page background for all work areas.
- **Warm Ink** (ink): body text and the 2px section head rule.
- **Paper** (paper): cards and popovers from the component kit; not used for panel sections.
- **Warm Mist** (muted / muted-foreground): skeletons, meter track, secondary text, past and cancelled rows.
- **Hairline** (hairline, input-stroke): row dividers and outline-button borders; input-stroke for form controls and unchecked step markers.
- **Warm Black Housing** (housing, housing-foreground, housing-muted, housing-raised, housing-line): the rail and the call board. housing-raised is hover and active fill in the rail; housing-line is the 9% white rule inside the board.
- **Destructive** (destructive): kit-level error color for destructive actions only; it is not a status color for appointments.

### Named Rules
**The One Accent Rule.** Ruby is the only accent. It means "now" or "act on this"; it is never decoration, never a section color, never a heading color.

**The Held Lamp Rule.** Amber is the only change signal, and a change stays lit (surface, lamp, text) until the owner marks it seen. Nothing else uses amber.

**The No Messenger Green Rule.** No blue or green status colors anywhere, including WhatsApp green. Confirmed reads in ink with a check; done and cancelled read muted.

## Typography

**Display Font:** Chivo Mono (with ui-monospace, monospace), for digits only
**Body Font:** Chivo (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Chivo Mono, tabular figures

**Character:** A sturdy grotesque paired with its own mono; the mono carries every number that ticks, so times line up in columns like a departure board.

### Hierarchy
- **Display** (Chivo Mono 500, 3.75rem rising to 4.5rem at 640px, line-height 1, tight tracking): the current appointment's time on the call board, in board-glow. Nowhere else.
- **Headline** (Chivo 600, 1.5rem rising to 1.875rem, tight tracking): the page's date heading.
- **Title** (Chivo 600, 1.125rem, tight tracking): section heads ("Agenda de hoje", "Precisa de você", "Plano"). The current client's name on the board uses 1.5rem at the same weight.
- **Body** (Chivo 400, 0.875rem): rows, meta lines, previews; 1rem for client names in rows at weight 500.
- **Label** (Chivo 600, 0.75rem, sentence case): the "Agora" tag and small counts.
- **Time** (Chivo Mono 500, tabular): 1rem in agenda rows, 1.5rem in the board's "Próximos" column; inline times and counts inside prose are wrapped in mono at the surrounding size.

### Named Rules
**The Tabular Clock Rule.** Every clock time, duration and count is set in Chivo Mono with tabular figures, including times embedded in sentences. Body text keeps proportional figures.

**The No Kicker Rule.** No eyebrow or kicker labels above headings, no uppercase tracked micro-labels. Headings stand on their own.

## Layout

A 240px warm-black rail on the left from 1024px; below that it becomes a 56px warm-black top bar with a full-height drawer. Content sits in a centered column up to 72rem with 16px / 24px / 40px side padding (base / 640px / 1024px) and 24px to 32px top padding.

The call board spans the full content width. From 768px it splits into "Agora" (1.15fr) and "Próximos" (1fr) divided by a housing-line rule; below that they stack. Under the board, a 32px gap, then a two-column grid from 1024px: the agenda (fluid) beside a 20rem column of ruled sections, 40px column gap. On mobile the order is what needs the owner first, then the agenda, then plan and setup.

Rhythm: 12px to 16px row padding, 16px between a section head and its content, 32px between sections.

## Elevation & Depth

Depth is tonal. The housing is darker than the ground; that contrast is the hierarchy. The only shadow is a soft, offset drop under the call board, which sits slightly forward of the ground like a mounted panel.

### Shadow Vocabulary
- **Board drop** (`box-shadow: 0 12px 32px -16px oklch(0.19 0.012 20 / 0.55)`): the call board only.

### Named Rules
**The No Halo Rule.** No zero-offset glows or colored halos. Lit Ruby on the board is a text and lamp color, never a box-shadow.

## Shapes

Gently rounded and restrained. Housing panels use 11.2px corners; buttons 8px; nav items and small chips 6.4px; the "Agora" tag 4.8px; counts, lamps, the meter and step markers are full pills or circles. Sections below the board have no corners at all: they are open, defined by rules.

## Components

### Buttons
Calm and functional; kit buttons, unchanged.
- **Shape:** gently rounded (8px), 36px tall at the panel's chosen size, full width inside the narrow column.
- **Primary:** ruby fill, near-white text. Used for the one direct action ("Responder").
- **Hover / Focus:** fill drops to 80% ruby; 3px ruby ring at 50% on focus; 1px press nudge.
- **Outline:** ground fill, hairline border, ink text; hover to Warm Mist. Used for navigation-like actions ("Ver agendamentos", "Continuar").
- **Seen (ghost, amber):** 28px, amber text with an eye icon, amber 15% hover; lives only inside a lit changed row.

### Count Badge
Ruby pill with mono tabular digits; marks attendant requests on the section head and on the rail's Conversas item (housing-ruby there).

### Navigation
Warm-black rail. Items are 40px, 14px Chivo, housing-muted with a 1.75-stroke line icon. Hover and active fill with housing-raised; active text goes housing-foreground at weight 500, the icon turns housing-ruby, and a 1px housing-ruby mark sits on the left edge, inset 10px top and bottom. The footer carries the business initials and "Sair" above a housing-line rule.

### Ruled Section
The default container below the board. A 2px ink rule under the title row (title left, count or link right), then rows separated by hairlines with a closing hairline. No background, no border box, no radius.

### Call Board (signature)
Warm-black panel, 11.2px corners, 24px padding rising to 32px. "Agora" holds a lamp dot, the display time in board-glow, the client name and a muted meta line with mono end time and minutes left. "Próximos" lists up to three rows on a 4.5rem time column with housing-line dividers. When idle, the time reads "--:--" in housing-muted at 50%.

### Agenda Row (signature)
Three-column grid: 4.25rem mono time, client and service, status with icon. The current row takes the Ruby Wash background, ruby time, a ruby lamp and the "Agora" tag. A changed row takes the amber surface and keeps it, with the change text and the Seen button spanning the row, until marked seen.

### Motion
New board content enters with **call-advance** (520ms, expo-out, a short rise from 0.35em with a 6px blur clearing). Lamps blink with **call-lamp** (1.1s, three cycles, then hold). Both are disabled under prefers-reduced-motion.

## Do's and Don'ts

### Do:
- **Do** keep ruby for "now" and for actions the owner can take; one ruby voice per decision.
- **Do** hold a changed appointment's amber surface, lamp and text until the owner presses "Marcar como visto".
- **Do** set every clock time, duration and count in Chivo Mono tabular figures, including times inside sentences.
- **Do** open sections below the call board with a 2px ink rule and separate rows with hairlines on the tinted ground.
- **Do** house the rail and the call board in warm black; keep work areas on the light ruby-tinted ground.
- **Do** keep the rail's active mark at 1px.
- **Do** disable call-advance and call-lamp under prefers-reduced-motion.

### Don't:
- **Don't** use blue or green for status, and never WhatsApp green.
- **Don't** use amber for anything except unsettled appointments.
- **Don't** wrap sections below the board in cards or bordered boxes.
- **Don't** add zero-offset glows or colored halos.
- **Don't** add eyebrow or kicker labels above headings.
- **Don't** thicken the nav active mark beyond 1px.
- **Don't** build a KPI-card grid on Início.
