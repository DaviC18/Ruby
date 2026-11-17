---
name: Ruby
description: Owner's panel for WhatsApp service and booking; the day read as a reception call board.
colors:
  primary: "oklch(0.55 0.2 20)"
  primary-foreground: "oklch(0.985 0.004 20)"
  link: "oklch(0.74 0.16 22)"
  ring: "oklch(0.68 0.2 22)"
  accent-now: "oklch(0.2 0.05 18)"
  accent-now-foreground: "oklch(0.9 0.06 18)"
  ground: "oklch(0.115 0.005 20)"
  ink: "oklch(0.94 0.006 20)"
  card: "oklch(0.155 0.007 20)"
  popover: "oklch(0.165 0.007 20)"
  muted: "oklch(0.19 0.008 20)"
  muted-foreground: "oklch(0.72 0.012 20)"
  hairline: "oklch(1 0 0 / 10%)"
  input-stroke: "oklch(1 0 0 / 16%)"
  rail: "oklch(0.085 0.004 20)"
  rail-foreground: "oklch(0.93 0.008 20)"
  rail-muted: "oklch(0.7 0.012 20)"
  rail-raised: "oklch(0.16 0.01 20)"
  rail-line: "oklch(1 0 0 / 8%)"
  rail-ruby: "oklch(0.68 0.2 22)"
  board: "oklch(0.08 0.004 20)"
  board-foreground: "oklch(0.95 0.006 20)"
  board-muted: "oklch(0.72 0.012 20)"
  board-line: "oklch(1 0 0 / 9%)"
  board-glow: "oklch(0.68 0.21 24)"
  changed: "oklch(0.78 0.14 75)"
  changed-surface: "oklch(0.21 0.045 70)"
  changed-foreground: "oklch(0.86 0.11 80)"
  destructive: "oklch(0.7 0.18 25)"
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
    backgroundColor: "oklch(0.55 0.2 20 / 0.8)"
  button-outline:
    backgroundColor: "oklch(1 0 0 / 4.8%)"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "oklch(1 0 0 / 8%)"
  button-link:
    textColor: "{colors.link}"
  button-seen:
    textColor: "{colors.changed-foreground}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "28px"
  nav-item:
    textColor: "{colors.rail-muted}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.rail-raised}"
    textColor: "{colors.rail-foreground}"
  call-board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.board-foreground}"
    rounded: "{rounded.xl}"
    padding: "32px"
  agenda-row-now:
    backgroundColor: "{colors.accent-now}"
    textColor: "{colors.link}"
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

Ruby's panel reads the owner's day the way a clinic waiting room reads its call-number board: what is happening now, who is next, what changed. Ruby is dark-only. The work areas sit on a warm-black ground tinted faintly toward ruby; the side rail and the call board are the fixed hardware of the room, set one step deeper than the ground. Information is set on a strict grid of tabular digits, so a glance between customers is enough.

The system is sober and dense without being crowded. Color is spent only on meaning: ruby marks what is now and what the owner can act on; amber marks an appointment that is not yet settled, and a change stays lit until the owner says they have seen it. Everything else is warm neutral. Sections below the board are ruled, not boxed: a heavy foreground rule opens each one, hairlines separate rows, and the ground shows through.

The panel refuses the generic SaaS dashboard: no KPI-card grid, no blue or green status palette, no WhatsApp green.

**Key Characteristics:**
- Dark-only: a warm-black ruby-tinted ground, with the rail and call board recessed one step deeper.
- Ruby as the single accent, split by job: a deep fill for buttons and badges, a lit tone for ruby text.
- Amber as the single signal for an unsettled appointment.
- Every clock time in Chivo Mono tabular figures.
- Ruled sections with hairline rows instead of cards.
- Depth from tone and hairlines only; no shadows anywhere.

## Colors

A warm-black field, all neutrals tinted toward the ruby hue (about 20), with one red accent and one amber signal.

### Primary
- **Ruby** (primary / primary-foreground): fills that carry near-white text. Buttons that act, the "Agora" tag, the current row's lamp, attendant-request counts, the plan meter once usage reaches 80%.
- **Lit Ruby Text** (link): ruby used as text on the dark ground. Links, the current agenda row's time, the text caret.
- **Ruby Focus** (ring): the 2px focus outline.
- **Ruby Wash** (accent-now / accent-now-foreground): the background of the agenda row that is happening now.
- **Lit Ruby** (rail-ruby, board-glow): ruby lifted so it holds on the deepest surfaces. rail-ruby carries the rail's active mark, active icon and nav counts; board-glow carries the Agora digits and the board lamp.

### Secondary
- **Signal Amber** (changed / changed-surface / changed-foreground): the only signal for an unstable appointment. A remarcado or cancelado appointment gets the amber surface, amber text, a pulsing amber lamp and a "Marcar como visto" control; the surface stays until marked seen. Appointments awaiting confirmation take amber text only, never the held surface.

### Neutral
- **Warm Black Ground** (ground): page background for all work areas.
- **Warm Ink** (ink): body text; at 70% it draws the 2px section head rule and the plan meter below 80%.
- **Card / Popover** (card, popover): kit cards and popovers, a step lighter than the ground; not used for panel sections.
- **Warm Mist** (muted / muted-foreground): skeletons, meter track, secondary text, past and cancelled rows.
- **Hairline** (hairline, input-stroke): white at 10% for row dividers; white at 16% for form controls, outline-button borders and unchecked step markers.
- **Rail** (rail, rail-foreground, rail-muted, rail-raised, rail-line): the side rail and mobile top bar. rail-raised is the hover and active fill; rail-line is the footer rule.
- **Call Board** (board, board-foreground, board-muted, board-line): the call board, the deepest surface. board-line is its 1px outline and its internal dividers.
- **Destructive** (destructive): kit-level error color for destructive actions only; it is not a status color for appointments.

### Named Rules
**The One Accent Rule.** Ruby is the only accent. It means "now" or "act on this"; it is never decoration, never a section color, never a heading color.

**The Fill or Text Rule.** Ruby as a fill behind white text uses primary; ruby as text on the dark ground uses link. Never set primary as text color, never fill with link.

**The Held Lamp Rule.** Amber means an appointment is not settled: awaiting confirmation (amber text) or changed (surface, lamp, text). A change stays lit until the owner marks it seen. Nothing else uses amber.

**The No Messenger Green Rule.** No blue or green status colors anywhere, including WhatsApp green. Confirmed reads in ink with a check; done and cancelled read muted.

## Typography

**Display Font:** Chivo Mono (with ui-monospace, monospace), for digits only
**Body Font:** Chivo (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Chivo Mono, tabular figures

**Character:** A sturdy grotesque paired with its own mono; the mono carries every number that ticks, so times line up in columns like a departure board.

### Hierarchy
- **Display** (Chivo Mono 500, 3.75rem rising to 4.5rem at 640px, line-height 1, tight tracking): the current appointment's time on the call board, in board-glow. Nowhere else.
- **Headline** (Chivo 600, 1.5rem rising to 1.875rem, tight tracking): the page's date heading.
- **Title** (Chivo 600, 1.125rem, tight tracking): section heads ("Agenda de hoje", "Precisa de você", "Plano") and the "Ruby" wordmark. The current client's name on the board uses 1.5rem at the same weight.
- **Body** (Chivo 400, 0.875rem): rows, meta lines, previews; 1rem for client names in rows at weight 500.
- **Label** (Chivo 600, 0.75rem, sentence case): the "Agora" tag and small counts.
- **Time** (Chivo Mono 500, tabular): 1rem in agenda rows, 1.5rem in the board's "Próximos" column; inline times and counts inside prose are wrapped in mono at the surrounding size.

### Named Rules
**The Tabular Clock Rule.** Every clock time, duration and count is set in Chivo Mono with tabular figures, including times embedded in sentences. Body text keeps proportional figures.

**The No Kicker Rule.** No eyebrow or kicker labels above headings, no uppercase tracked micro-labels. Headings stand on their own.

## Layout

A 240px rail on the left from 1024px; below that it becomes a 56px top bar in the same rail tone with a full-height drawer. Content sits in a centered column up to 72rem with 16px / 24px / 40px side padding (base / 640px / 1024px) and 24px to 32px top padding.

The call board spans the full content width. From 768px it splits into "Agora" (1.15fr) and "Próximos" (1fr) divided by a board-line rule; below that they stack. Under the board, a 32px gap, then a two-column grid from 1024px: the agenda (fluid) beside a 20rem column of ruled sections, 40px column gap. On mobile the order is what needs the owner first, then the agenda, then plan and setup.

Rhythm: 12px to 16px row padding, 16px between a section head and its content, 32px between sections.

## Elevation & Depth

Depth is tonal and runs downward. The ground is warm black; the rail and the call board are recessed one step deeper, like hardware set into the wall. Cards and popovers from the kit sit a step lighter than the ground. The call board's edge is a 1px board-line outline, not a shadow.

### Named Rules
**The Recess Rule.** Fixed hardware (rail, call board) goes darker than the ground, never lighter, and is separated by tone or a 1px white-alpha line. The system has no shadows.

**The No Halo Rule.** No zero-offset glows or colored halos. Lit Ruby on the board is a text and lamp color, never a box-shadow.

## Shapes

Gently rounded and restrained. The call board uses 11.2px corners; buttons 8px; nav items and small chips 6.4px; the "Agora" tag 4.8px; counts, lamps, the meter and step markers are full pills or circles. Sections below the board have no corners at all: they are open, defined by rules.

## Components

### Brand Mark
The owner-supplied ruby gem, a raster image with transparency (trimmed mark at 28px tall), set beside "Ruby" in Chivo 600 at 1.125rem with a 10px gap, in rail-foreground. The same gem serves as favicon and touch icon. Use the supplied artwork only; do not redraw the gem.

### Buttons
Calm and functional; kit buttons, unchanged.
- **Shape:** gently rounded (8px), 36px tall at the panel's chosen size, full width inside the narrow column.
- **Primary:** ruby fill, near-white text. Used for the one direct action ("Responder").
- **Hover / Focus:** fill drops to 80% ruby; 3px ruby ring at 50% on focus; 1px press nudge.
- **Outline:** a faint white-alpha fill with the input-stroke border and ink text; the fill strengthens on hover. Used for navigation-like actions ("Ver agendamentos", "Continuar").
- **Link:** lit ruby text, underline on hover.
- **Seen (ghost, amber):** 28px, amber text with an eye icon, amber 15% hover; lives only inside a lit changed row.

### Count Badge
Ruby pill with mono tabular digits; marks attendant requests on the section head and on the rail's Conversas item (rail-ruby there).

### Navigation
The rail. Items are 40px, 14px Chivo, rail-muted with a 1.75-stroke line icon. Hover and active fill with rail-raised; active text goes rail-foreground at weight 500, the icon turns rail-ruby, and a 1px rail-ruby mark sits on the left edge, inset 10px top and bottom. The footer carries the business initials and "Sair" above a rail-line rule.

### Ruled Section
The default container below the board. A 2px rule in ink at 70% under the title row (title left, count or link right), then rows separated by hairlines with a closing hairline. No background, no border box, no radius.

### Call Board (signature)
The deepest panel, 11.2px corners, 1px board-line outline, 24px padding rising to 32px. "Agora" holds a lamp dot, the display time in board-glow, the client name and a muted meta line with mono end time and minutes left. "Próximos" lists up to three rows on a 4.5rem time column with board-line dividers. When idle, the time reads "--:--" in board-muted at 50%. The sign-in screen shows a smaller sample of the same board.

### Agenda Row (signature)
Three-column grid: 4.25rem mono time, client and service, status with icon. The current row takes the Ruby Wash background, lit ruby time, a ruby lamp and the "Agora" tag. A changed row takes the amber surface and keeps it, with the change text and the Seen button spanning the row, until marked seen.

### Motion
New board content enters with **call-advance** (520ms, expo-out, a short rise from 0.35em with a 6px blur clearing). Lamps blink with **call-lamp** (1.1s, three cycles, then hold). Both are disabled under prefers-reduced-motion.

## Do's and Don'ts

### Do:
- **Do** keep ruby for "now" and for actions the owner can take; one ruby voice per decision.
- **Do** use primary for ruby fills with white text and link for ruby text.
- **Do** use amber for unsettled appointments: amber text while awaiting confirmation, the held surface for a change.
- **Do** hold a changed appointment's amber surface, lamp and text until the owner presses "Marcar como visto".
- **Do** set every clock time, duration and count in Chivo Mono tabular figures, including times inside sentences.
- **Do** open sections below the call board with a 2px ink rule at 70% and separate rows with hairlines on the ground.
- **Do** set the rail and the call board one step deeper than the ground, edged by tone or a 1px white-alpha line.
- **Do** keep the rail's active mark at 1px.
- **Do** disable call-advance and call-lamp under prefers-reduced-motion.

### Don't:
- **Don't** add a light theme or a light ground; Ruby is dark-only.
- **Don't** set primary as a text color on the dark ground.
- **Don't** use blue or green for status, and never WhatsApp green.
- **Don't** use amber for anything except unsettled appointments.
- **Don't** wrap sections below the board in cards or bordered boxes.
- **Don't** add shadows, zero-offset glows or colored halos.
- **Don't** add eyebrow or kicker labels above headings.
- **Don't** thicken the nav active mark beyond 1px.
- **Don't** redraw the brand gem; use the supplied artwork.
- **Don't** build a KPI-card grid on Início.
