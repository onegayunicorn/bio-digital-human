# SOVEREIGN HDI dashboard (React + Vite PWA)

The instrument surface: measured channels, the derived state estimate, the governor verdict, the event
log, the session aggregates and the calibration profile — with every value carrying its provenance.

The visual specification lives in [`DESIGN.md`](DESIGN.md); the asset policy (no raster images, and
why) in [`ASSETS.md`](ASSETS.md).

---

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # -> dist/
npm run preview
```

Served from the hub in the recommended deployment (`HDI_STATIC_DIR=../dashboard/dist`), the whole system
stays on loopback and no CORS configuration is needed.

## Two data modes, visibly different

| Mode | Source | Badge | Notes |
| --- | --- | --- | --- |
| **demo** (default) | `src/lib/simulatedSource.js` — seeded synthetic physiology | `DEMO / SIMULATED`, persistent banner | No hub, no network, no sensor. Reproducible for a given seed |
| **live** | The hub, over WebSocket (`VITE_HDI_API_BASE`) | `LIVE` | Falls back to demo mode and **says so** if the hub is unreachable |

Configuration: copy `.env.example` to `.env` and set `VITE_HDI_API_BASE` (and `VITE_HDI_DATA_MODE=live`).
If the fallback happens, the notice text states the reason — the interface never presents fallback data
as live.

## What the interface refuses to do

* **No bare numbers.** Every value carries a unit and a class badge (measured / derived / illustrative).
* **No decorative brain render.** The centre visual is an inline SVG network motif labelled
  `ILLUSTRATIVE`. A convincing brain image is the fastest way to make a viewer believe a biofeedback
  prototype is a neural interface.
* **No hidden simulation.** The provenance strip is persistent and not dismissible.
* **No invented clinical panels.** "Brain regions", "oxygen level" and "brain activity" from the
  reference screens are *not* rendered as measured values, because nothing in this system measures them.
* **No control without a human.** The control slider is the only path to the control vector, it is
  clamped, and the applied value is gated by the governor.

## Structure

```
dashboard/
├── src/
│   ├── App.jsx                 shell, routes (HashRouter), footer
│   ├── main.jsx                entry
│   ├── styles.css              design tokens + primitives (from DESIGN.md)
│   ├── components/             Panel, StatTile, Sparkline, GaugeRing, StateBars,
│   │                           NeuralCore, GovernorPanel, ProvenanceBanner,
│   │                           LogStream, SummaryTable, SideNav, TopBar
│   ├── pages/                  Overview, Channels, History, Calibration, Safety, About
│   ├── hooks/useHdiStream.js   engine + governor + streaming, one source of truth
│   └── lib/                    engine.js, governor.js, modelConfig.js,
│                               simulatedSource.js, hubClient.js, format.js
├── parity_runner.mjs           feeds a fixed sequence to the JS engine (see below)
├── DESIGN.md · ASSETS.md
└── index.html · public/
```

## The browser engine is a mirror, and that is tested

`src/lib/engine.js` implements the same recurrence as
`software/sovereign_hdi/prometheus_engine.py`, because the PWA must run with no hub. Two implementations
of one model is a divergence risk, so the risk is a test:

```bash
node parity_runner.mjs inputs.json    # {"steps":240,"control":[…],"sensor":[[…],…]}
cd ../software && python -m pytest ../tests/contract/test_js_engine_parity.py -q
```

The suites must agree to 1e-9, and `tests/contract/test_js_engine_parity.py` also asserts that the
mirrored constants in `modelConfig.js` match `config/default_model.json` (including `param_version`).
**Change one, change the other, or CI fails.**

## Accessibility and motion

Body text meets WCAG AA against its surface; colour is never the only carrier of meaning (verdicts carry
their text code, values carry badges); the layout is keyboard navigable; and all animation is disabled
under `prefers-reduced-motion`. Values do not animate between states — a reading is never displayed
"in between" two numbers.

## Scope

This interface displays a state estimate. It is not a medical device and its output must not be used for
any clinical purpose. See `../docs/LIMITATIONS.md` and `../docs/CLAIMS_REGISTER.md`.
