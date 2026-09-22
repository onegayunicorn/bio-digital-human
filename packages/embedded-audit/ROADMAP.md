# Roadmap

Status is stated as **delivered / partial / outstanding**, with the artefact that decides it. No item
is marked complete because a document describes it.

---

## Phase 1 — Software core (delivered)

| Item | Status | Deciding artefact |
| --- | --- | --- |
| Bounded non-linear state engine with frozen parameters | Delivered | `software/sovereign_hdi/prometheus_engine.py`, `config/default_model.json` |
| Safety governor with config-driven thresholds | Delivered | `safety_governor.py`, `test_safety_governor.py` |
| Documented normalisation and baseline capture | Delivered | `calibration.py`, `test_calibration.py` |
| Enforceable telemetry contract | Delivered | `telemetry_schema.py`, `test_telemetry_schema.py` |
| Hash-chained audit log and aggregate export | Delivered | `telemetry/writer.py`, `telemetry/export.py` |
| Local hub (HTTP + WebSocket) with ingest contract | Delivered | `api/app.py`, `test_api_endpoints.py` |
| Numerical stability sweep across four regimes | Delivered | `stability.py`, `test_stability_fuzz.py` |
| Deterministic replay | Delivered | `test_deterministic_replay.py` |

## Phase 2 — Firmware (partial)

| Item | Status | Deciding artefact |
| --- | --- | --- |
| Frame layout, CRC, encode/decode | Delivered (host + on-target tests written) | `protocol.c`, `test/native_frame_test.c` (20 checks pass) |
| Sensor drivers (MAX30102, EDA ADC, BME280, MPU6050) | **Partial** — written, not bench-validated | `sensors.c` |
| BME280 compensation + NVS-stored calibration block | Outstanding | currently reports `env_valid = false` rather than approximating |
| BLE notify transport | **Partial** — code complete, never run against a phone | `ble_service.c` |
| Watchdog, boot self-test, cadence scheduling | Delivered (self-test verified by inspection of the framing path; on-target run outstanding) | `main.c` |
| Firmware signing in CI | Hook present, **no key configured** | `.github/workflows/ci.yml` (`FW_SIGNING_KEY` unset) |

## Phase 3 — Bench validation (outstanding — the critical path)

| Item | Status | What it needs |
| --- | --- | --- |
| Sensor accuracy vs a reference instrument | Outstanding | ECG reference for HR/HRV, calibrated reference for EDA (e.g. a known shunt), thermocouple for skin temperature; a written protocol with acceptance criteria before data collection |
| Motion-artefact tuning | Outstanding | Protocol with defined movement tasks; record false-rejection and false-accept rates |
| Battery-life measurement | Outstanding | Power-profiler run at the target cadence, both with and without BLE connected |
| BLE end-to-end latency | Outstanding | Timestamped round-trip measurement with a real phone |
| Thermal behaviour of the enclosure | Outstanding | Enclosure design, then a soak test at the maximum duty cycle |
| Failure-mode injection (sensor disconnect, brownout) | Outstanding | Bench fixture and a documented expected-behaviour table |

## Phase 4 — Presentation (delivered / partial)

| Item | Status | Deciding artefact |
| --- | --- | --- |
| Local-first PWA with state visualisation | Delivered | `dashboard/` |
| Provenance and `SIMULATED` labelling in the UI | Delivered | dashboard provenance banner + per-frame labels |
| Calibration baseline capture view | Delivered | dashboard *Calibration* view |
| Audit/history view with governor timeline | Delivered | dashboard *History* view |
| Full accessibility pass (screen-reader semantics, contrast audit) | **Partial** | not yet audited with assistive technology |

## Phase 5 — Governance (partial)

| Item | Status | Deciding artefact |
| --- | --- | --- |
| Evidence-label discipline across the codebase | Delivered | `EVIDENCE_LABELS.md`, `CLAIMS_REGISTER.md` |
| Claims register with prohibited claims | Delivered | `CLAIMS_REGISTER.md` |
| Intended-use statement | Draft | `compliance/TGA_INTENDED_USE.md` |
| Privacy Impact Assessment | Template only | `compliance/APP_PRIVACY_ASSESSMENT.md` |
| Essential Eight mapping | Draft | `compliance/ACSC_ESSENTIAL_EIGHT.md` |
| Electrical/EMC assessment checklist | Draft | `compliance/AU_ELECTRICAL_EMC.md` |
| Risk register (ISO 14971 style) | Draft | `compliance/RISK_REGISTER.md` |
| Regulatory review by a competent professional | Outstanding | external |
| Human-subjects ethics review (if any study is run) | Outstanding | external |

---

## What is deliberately NOT on this roadmap

Neural stimulation, cortical data transfer, "cognitive firmware", biological data storage, synthetic
engrams, and genotype→connectome inference. These are excluded, not deferred — see
`LIMITATIONS.md` §3 and `CLAIMS_REGISTER.md` §3.

---

## Next three concrete steps

1. **Bench the framing path with one real sensor.** One ESP32-S3, one MAX30102, one phone. Confirm
   `frames_decoded` increases, `crc_errors == 0`, and the values move plausibly with a finger on the
   sensor. This converts the largest `CONCEPTUAL_ARCHITECTURE` block into measured fact — or finds the
   first real defect, which is the more likely and more valuable outcome.
2. **Write the sensor-accuracy protocol before collecting data.** Acceptance criteria, reference
   instrument, sample size and analysis plan, fixed in advance. Data collected before the criteria are
   fixed cannot validate anything.
3. **Complete the legal review of the intended-use statement.** Until that is done, no external
   communication may describe the platform in clinical terms.
