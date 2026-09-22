# SOVEREIGN HDI — Human-Digital Interface Platform

**Version:** 2.5.0 · **Status:** Engineering-validated reference implementation · **Classification:** Sovereign / Internal
**Target platforms:** ESP32-S3 edge node · Samsung A17 (Android / Termux) gateway · local-first PWA · Linux/Docker backend
**Location alignment:** Queensland, Australia (AS/NZS electrical & EMC scope)

---

## 1. What this is

A **closed-loop, non-invasive biofeedback and physiological state-visualisation platform**. It acquires
physiological signals (PPG-derived heart rate / HRV, electrodermal activity, temperature, motion),
maintains a bounded non-linear state estimate, and renders that estimate as a user-facing cue.

It comprises three tiers:

| Tier | Component | Repository path | Role |
| --- | --- | --- | --- |
| 1 | **OMNIROOT** | `firmware/esp32-omniroot/` | Hardware abstraction + biosignal acquisition |
| 2 | **PROMETHEUS** | `software/sovereign_hdi/prometheus_engine.py` | Non-linear bounded state engine ("digital twin") |
| 3 | **Safety Governor** | `software/sovereign_hdi/safety_governor.py` | Hard-enforced numerical and state thresholds |

State update implemented by PROMETHEUS:

```
x(n+1) = clip( A·x(n) + B·u(n) + E·z(n) + b − h ⊙ tanh( x(n) ⊘ d_thresh ) )
```

with `x ∈ [0,1]^5` = `[Damage, Inflammation, Stress, Fatigue, Reserve]`, `u` = user-mediated control
vector, `z` = normalised sensor deviation vector, `clip` = per-channel hard bound.

---

## 2. Non-negotiable truth declaration

This platform **does not claim to cure, treat, regenerate tissue, write data into a nervous system,
or modify cognition.** It provides physiological state visualisation and biofeedback guidance — a
monitoring modality. Every intervention is user-mediated. The Safety Governor never actuates biology;
it only gates software output.

Large parts of the wider concept corpus that this repository was extracted from are **fictional or
unvalidated**. They are deliberately **not implemented here** and are listed in
[`docs/LIMITATIONS.md`](docs/LIMITATIONS.md). No module in this repository implements:
direct neural stimulation, spike-timing-dependent plasticity stimulation, cortical data upload,
biological data storage / synthetic engrams, "cognitive firmware", or causal
genome→connectome optimisation.

### Evidence labels (applied per module — see `docs/EVIDENCE_LABELS.md`)

| Label | Meaning |
| --- | --- |
| `IMPLEMENTED_AND_TESTED` | Code exists, has an automated test that passes in CI, and the test result is reproducible |
| `SIMULATED` | Runs over synthetic or recorded inputs; not connected to a biological subject or certified device |
| `CONCEPTUAL_ARCHITECTURE` | Interfaces and responsibilities are specified; hardware or provider code is incomplete |
| `RESEARCH_HYPOTHESIS` | Claim awaiting experimental validation — not a capability |
| `FICTIONAL_VISUALISATION` | Communicative imagery or narrative, asserts nothing |

`docs/CLAIMS_REGISTER.md` maps every user-visible claim to one of these labels.

---

## 3. Repository layout

```
sovereign-hdi/
├── firmware/esp32-omniroot/   ESP-IDF / PlatformIO sensor node (acquisition, framing, BLE)
├── software/                  Python 3.11+ package: engine, governor, ingest, API, simulation
├── dashboard/                 React 18 + Vite local-first PWA (state visualisation HUD)
├── services/termux/           Samsung A17 / Termux gateway bootstrap and service supervision
├── deploy/                    Docker, systemd, Termux service units, production env templates
├── tests/                     Unit, safety-gate, contract, fuzz and deterministic-replay suites
├── scripts/                   Stability verification, evidence manifest, local simulator
├── docs/                      Architecture, data contract, safety, privacy, deployment, compliance
├── evidence/                  Audit-ready artefacts that a reviewer can reproduce
├── tools/                     Release packaging
└── .github/                   CI/CD workflows and the ESP32 build action
```

---

## 4. Quickstart — development

Requirements: Python 3.11+, Node 20+ (dashboard only).

```bash
# --- backend / engine ---
cd software
python -m pip install -e ".[dev]"          # numpy, fastapi, uvicorn, pydantic, pytest, httpx
python -m pytest ../tests -q               # unit + safety + contract + replay + fuzz
python ../scripts/verify_stability.py      # 72 h-equivalent numerical stability sweep (fast mode)

# --- run the ingest hub locally ---
uvicorn sovereign_hdi.api.app:app --host 127.0.0.1 --port 8077
# GET /api/health          -> liveness + engine/governor version
# GET /api/v1/state        -> latest validated state vector + provenance
# WS  /api/v1/stream       -> validated state frames @ ~10 Hz
# POST /api/v1/telemetry   -> telemetry envelope ingest (schema-validated)

# --- simulate a sensor node (clearly labelled SIMULATED) ---
python ../scripts/run_local_sim.py --hz 10 --minutes 5
```

```bash
# --- dashboard (local-first PWA) ---
cd dashboard
npm install
npm run dev        # http://localhost:5173
npm run build      # -> dist/  (static PWA bundle, deployable to any static host)
npm run preview
```

The dashboard ships in `DEMO / SIMULATED` mode by default and says so on screen. Point it at a live
hub by setting `VITE_HDI_API_BASE` and `VITE_HDI_DATA_MODE=live` (see `dashboard/.env.example`).

---

## 5. Quickstart — production deployment

Three supported topologies. Full runbooks: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

**A. Edge node + phone gateway (primary sovereign topology)**

```bash
# 1. firmware
cd firmware/esp32-omniroot && pio run -e esp32-s3            # compile
pio run -e esp32-s3 -t upload                                 # flash (lab bench first)
pio device monitor                                            # verify framing + CRC counters

# 2. gateway (Samsung A17, Termux)
bash services/termux/install.sh            # installs python, deps, service supervision
termux-services restart sovereign-hdi      # starts hub on 127.0.0.1:8077

# 3. dashboard
cd dashboard && npm ci && npm run build     # serve dist/ locally; no cloud dependency
```

**B. Containerised backend (Linux host / NAS / VPS)**

```bash
cd deploy/docker
cp .env.example .env        # set HDI_API_TOKEN, HDI_DATA_DIR, HDI_CORS_ORIGINS
docker compose up -d --build
docker compose exec hub curl -s localhost:8077/api/health
```

**C. Static PWA only** — `dashboard/dist/` to any static host. Runs fully in-browser in SIMULATED
mode; no telemetry leaves the device.

---

## 6. Safety Governor

| Condition | Detection | Enforced action |
| --- | --- | --- |
| Stress ceiling | `x[2] > 0.90` | Feedback throttled to 50 %; `STRESS_EXCEEDED` |
| Reserve floor | `x[4] < 0.20` | Enhancement loops disabled; recovery mode |
| Numerical fault | any `NaN` / `±Inf` / out-of-range | Sample dropped, logged, recalibration required |
| Saturation | `‖h ⊙ tanh(x ⊘ d_thresh)‖` clipping rate above budget | Reduced control authority |

The governor is deliberately **local, synchronous and fail-closed**: `validate()` returning `False`
blocks the frame before it reaches any display or export path. It is a software guard on numerical
and state bounds — **not** a medical safeguard and **not** evidence that a hazardous intervention can
be made safe by thresholding a number. Details: [`docs/SAFETY.md`](docs/SAFETY.md).

---

## 7. Data sovereignty

- No cloud dependency on any code path; local-first by default, opt-in export only.
- Raw biosignals are never transmitted by the reference implementation — the hub accepts envelopes
  on loopback/LAN and exports **aggregates**.
- Every stored frame carries a SHA3-256 evidence seal and explicit provenance
  (`LIVE | CALIBRATED | SIMULATED | PROTOTYPE`), so a reviewer can separate measurement from demo.
- Subject identifiers are pseudonymous by construction; see [`docs/PRIVACY.md`](docs/PRIVACY.md).
- No proprietary SDK, no binary blob, no remote command channel into the governor.

---

## 8. Compliance posture (current, honest)

| Domain | Instrument | Posture in this repository |
| --- | --- | --- |
| Electrical safety | AS/NZS 61010-1 | SELV (< 5 V DC), low-voltage; **design checklist only, not a test report** |
| EMC / RF | AS/NZS CISPR 32 | BLE 2.4 GHz, < 10 mW intended; **not yet measured** |
| Device scope | TGA | Intended-use statement prepared; **no registration claimed or implied** |
| Privacy | Privacy Act 1988 (APPs) | Local-first design + APP mapping; **PIA template, not an assessment outcome** |
| Cyber hygiene | ACSC Essential Eight | Firmware signing hooks, sealed logs, least privilege; mapping in `docs/compliance/` |

Nothing in this repository constitutes certification, conformity assessment, clinical validation or
regulatory approval. See [`docs/compliance/README.md`](docs/compliance/README.md).

---

## 9. Roadmap

| Phase | Deliverable | Status |
| --- | --- | --- |
| Week 1 | PROMETHEUS on Termux + calibration baseline UI | Scenario harness delivered (`software/…/calibration.py`, dashboard *Calibration* view) |
| Week 2 | ESP32 firmware + BLE frame integrity validation | Reference firmware delivered; **bench validation outstanding** |
| Week 3 | Safety Governor integration + fail-safe cutout tests | Delivered — `tests/safety/test_safety_gate.py` |
| Week 4 | Local-first PWA + HUD telemetry overlay export | Delivered — `dashboard/` |
| Week 6 | Regulatory dossier finalisation | Drafted — `docs/compliance/` |
| Week 8 | Signed v1.0.0 public release + reproducible build guide | Tooling ready — `tools/package_release.sh` |

---

## 10. Licence & provenance

Source-available under Apache-2.0 (`LICENSE`). Derived from the *Digital Human* concept corpus,
audited against [`docs/audit/`](docs/audit/) findings; the audited boundary between implemented,
simulated and fictional content is preserved as a first-class artefact.

Contributions: [`CONTRIBUTING.md`](CONTRIBUTING.md) · Security: [`SECURITY.md`](SECURITY.md)
