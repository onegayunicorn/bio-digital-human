---
version: 2.5.0
name: SOVEREIGN HDI Instrument Panel
description: >-
  Dark instrument-panel identity for a physiological state monitor. Grounded directly in the four
  user-supplied interface references (NEUROSCAN INTERFACE v2.4.1, NEURO-DIGITAL SYNTHESIS overview,
  neural-map view, real-time monitor) and adjusted for the SOVEREIGN HDI truth policy: measured
  channels, derived state and illustrative visuals are visually distinguishable.
colors:
  background: "#030814"
  background-deep: "#01050d"
  surface: "#061428"
  surface-raised: "#08203a"
  surface-inset: "#04101f"
  border: "#0f3355"
  border-strong: "#1b5c8a"
  primary: "#22d3ee"
  primary-soft: "#67e8f9"
  secondary: "#38bdf8"
  tertiary: "#a78bfa"
  alert: "#f87171"
  warn: "#fbbf24"
  ok: "#34d399"
  on-surface: "#dff3ff"
  on-surface-muted: "#7ea8c4"
  on-surface-faint: "#4a7089"
typography:
  display-lg:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.02em
  title-md:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0.02em
  body-md:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  label-sm:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.14em
  numeric-lg:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.01em
  numeric-md:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  md: 0.375rem
  lg: 0.625rem
  full: 9999px
spacing:
  xxs: 0.25rem
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
components:
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  panel-inset:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  stat-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background-deep}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
    height: 2.25rem
  button-ghost:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.primary-soft}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
    height: 2.25rem
  badge-live:
    backgroundColor: "{colors.ok}"
    textColor: "{colors.background-deep}"
    rounded: "{rounded.full}"
  badge-simulated:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.background-deep}"
    rounded: "{rounded.full}"
  badge-illustrative:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface-faint}"
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
---

# SOVEREIGN HDI Instrument Panel — design system

## 1. Overview

A monitoring console, not a marketing page. The user is looking at a live-ish instrument, so the
layout follows instrument conventions: a persistent top status strip, a left navigation rail, a
dominant central visual, and a right column of dense readouts. Everything is information-dense and
low-chrome; nothing is decorative for its own sake.

**Design constraint that shapes everything:** the platform must never let a viewer mistake an
illustration for a measurement, or a simulated value for a live one. Three visual classes are used
consistently:

| Class | Treatment | Meaning |
| --- | --- | --- |
| **Measured** | cyan numerics, unit label, `LIVE` / `CALIBRATED` badge | came from a sensor, through the validated envelope |
| **Derived** | cyan bars and gauges with channel name + bounds, `SIMULATED` badge in demo mode | computed by the state model from measured or simulated input |
| **Illustrative** | dimmed, desaturated, always carrying an `ILLUSTRATIVE` badge | brain render, region map, band graphics — asserts nothing |

## 2. Colors

Background is a near-black navy (`#030814`) with a subtle cyan radial glow behind the central visual
and a faint 32 px grid, matching the reference screens. Panels are one step lighter with a 1 px border;
inset wells are darker than their container so nested data reads as recessed rather than floating.

Accents are deliberately limited: cyan for primary emphasis and measured values, sky for secondary
series, violet for the third data series, and the state colours (`ok`, `warn`, `alert`) reserved
**only** for governor verdicts. Using a state colour for decoration would make a genuine alert
invisible.

## 3. Typography

System sans for prose and labels; monospace for every number, unit, identifier and log line. Monospace
numerics are not stylistic here — fixed-width digits stop the whole panel jittering as values update,
and make column alignment possible in the log and history tables. `label-sm` is used uppercase with
wide tracking for panel headings, matching the reference screens.

## 4. Layout

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar: mark · title · version · data-source badge · clock    │
├──────┬───────────────────────────────────┬───────────────────┤
│ Side │  Primary visual + gauges          │  Readout column   │
│ Nav  │  (state channels, governor)        │  (vitals, summary)│
│ rail │                                   │                   │
├──────┴───────────────────────────────────┴───────────────────┤
│ Bottom strip: log · windowed aggregates · provenance          │
└──────────────────────────────────────────────────────────────┘
```

Below 1024 px the rail collapses to a horizontal scrollable tab strip and the three columns stack;
below 640 px the readout column becomes single-column cards. The primary visual keeps a square aspect
ratio at every size so the ring gauges stay legible.

## 5. Components

* **Panel** — bordered surface with an optional uppercase heading, optional right-side badge/actions.
* **StatTile** — one number, its unit, an optional sparkline, and its class badge. Never shows a
  number without a unit and a class.
* **GaugeRing** — SVG arc for a bounded `[0,1]` channel with the threshold notches drawn in (stress
  ceiling, reserve floor). Thresholds come from the hub, never hard-coded in the view.
* **StateBars** — five horizontal channel bars with bounds and clipping markers.
* **Sparkline** — 60-sample polyline, no axes, used inside tiles.
* **NeuralCore** — the central SVG brain/network visual. Labelled `ILLUSTRATIVE`; it animates from real
  state values (stress drives pulse rate, reserve drives glow), but it depicts no anatomy.
* **GovernorPanel** — verdict, code, authority, reasons; colour-coded, with the disclaimer always
  visible.
* **ProvenanceBanner** — persistent strip stating data mode, source node, model and parameter version.
* **LogStream** — tail of the audit-derived events with monospace timestamps.

## 6. Motion

Motion communicates that data is flowing, never to decorate. Pulse and glow are driven by measured or
derived values. Animation is disabled entirely under `prefers-reduced-motion`. No number animates
between values — displayed values update directly, so a reading is never "in between" two states.

## 7. Accessibility

Body text meets WCAG AA against its surface (`#dff3ff` on `#061428` ≈ 12:1; muted `#7ea8c4` ≈ 5.4:1).
Colour is never the only carrier of meaning: governor verdicts include the text code, data classes
include a text badge, and gauges include their numeric value. Focus rings are visible on all
interactive elements. The layout is keyboard navigable.

## 8. Responsive

Mobile-first breakpoints at 640 / 1024 / 1440 px. The instrument is usable on the target device (a
1660×720-class phone screen in portrait) with the primary visual above the fold and all critical
readouts reachable by scrolling. No horizontal overflow at 375 px.
