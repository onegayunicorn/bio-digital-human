# Changelog

All notable changes to this project. Format follows Keep a Changelog; versions follow SemVer.
**Parameter changes are behavioural changes** and immer bump `param_version` in
`config/default_model.json` — telemetry recorded under different parameter versions is not directly
comparable, which is exactly why the version travels with every frame.

---

## [2.5.0] — 2026-09-22

First engineering-validated release. The blueprint that seeded this repository (v2.5.0 of the
*Sovereign Human-Digital Interface* document) described an architecture; this release is the
implementation, with the deviations listed below recorded rather than silent.

### Added

* **Software tier** — `prometheus_engine` (bounded non-linear state engine), `safety_governor`
  (numerical and state gate with control authority), `calibration` (baseline capture and normalisation),
  `omniroot_client` (frame contract, CRC, transports), `telemetry_schema` (enforceable envelope),
  `sealing` (SHA3-256 seals and hash chaining), `telemetry/writer` (audit log), `telemetry/export`
  (aggregate-only export), `api/*` (local hub with ingest contract and WebSocket stream), `stability`
  (four-regime numerical sweep), `simulation/*` (deterministic synthetic physiology).
* **Firmware tier** — ESP32-S3 node: fixed 34-byte frame with CRC-16/CCITT-FALSE, MAX30102 PPG with
  peak-interval HRV, ADC-based EDA, BME280/MPU6050, notify-only BLE, watchdog, boot self-test.
* **Firmware tests** — `test/native_frame_test.c` runs on any host with a C compiler (20 checks) and
  `test/test_crc16.c` runs on target under Unity; both assert the same CRC vector as the Python suite.
* **Dashboard** — React/Vite PWA: instrument shell, SVG network motif (labelled ILLUSTRATIVE),
  bounded-state gauges with thresholds drawn in, governor panel, event log derived from transitions,
  window aggregates, calibration view, safety/scope views, offline demo mode with a persistent
  `DEMO / SIMULATED` banner.
* **Cross-runtime parity test** — the browser mirror of the engine must agree with the Python
  implementation to 1e-9 over a fixed input sequence.
* **Compliance dossier** — intended-use draft, electrical/EMC checklist, APP privacy scaffold,
  Essential Eight mapping, ISO 14971-style risk register, claims register.
* **Evidence tooling** — `scripts/gen_evidence_manifest.py` (SHA-256 manifest, `--check` mode),
  `scripts/verify_stability.py`, `scripts/run_local_sim.py`.

### Changed (deviations from the source specification — each is deliberate)

1. **`B` dimension corrected.** The specification stored `B` as 1×5 and transposed it, which cannot
   multiply a scalar control into a 5-vector. Now 5×1.
2. **Decay target corrected.** Decay was applied to `x` toward the zero vector, which drives `reserve`
   to 0 in open loop and permanently trips the reserve floor — an unrecoverable loop by construction.
   Decay is now applied to `(x − x_ref)` toward a homeostatic setpoint.
3. **Cross-channel coupling added, then constrained.** Coupling was added to `A` so the "dynamical"
   part of the model exists. The first attempt used 0.02–0.05 and produced a spectral radius of
   **1.0005** — the state self-amplified to its bounds with *zero* input. Configuration loading now
   **rejects** any `A` with spectral radius ≥ 1; the shipped matrix is ≈ 0.975.
4. **`sensor_gain` introduced and derived, not guessed.** With `A = 0.95·I` the DC gain is 20× per unit
   deviation, so a 0.05 deviation moved a channel across its whole range. The gain is now chosen
   against a stated criterion: a saturated deviation must **reach** the configured thresholds (or the
   governor is decorative) while ordinary variation must stay nominal. `sensor_gain = 0.4` satisfies
   both; `1.0` recovers the literal source values.
5. **Normalisation gained a one-MAD deadband.** With the plain `|x − median| / (k·MAD)` form, a resting
   HRV trace reports a permanent deviation of ~0.33 (respiratory variation alone), so the model sees a
   load that is not there. The deadband makes `0` mean "within normal variation".
6. **State scale unified to `[0, 1]`.** The source clipped Python to `[0, 100]` and JavaScript to
   `[0, 1]`, which makes the two runtimes unable to exchange state vectors safely.
7. **Random model coefficients removed.** `np.random.rand` at construction made "the same
   configuration" produce different dynamics on every run. Parameters are now frozen, versioned and
   loaded from configuration; determinism is a test.
8. **Unseeded mock sensors replaced.** The simulated source is seeded, structured, labelled
   `SIMULATED`, and reproduces exactly for a given seed.
9. **Envelope template made enforceable.** The proposed telemetry schema carried the literal strings
   `"number"`/`"string"` as "types", no requiredness and no behaviour. It is now a typed contract with
   stable error codes, canonical byte serialisation, and 19 negative test cases.
10. **Seal verification fixed.** The first implementation recomputed the hash from current values and
    compared it with itself, so it always passed. The received hash is now retained verbatim, and
    tampering is detected.
11. **Dashboard framework**: blueprint said "Vue + FastAPI"; implemented as React + Vite against the
    FastAPI hub, matching the surrounding toolchain. Recorded here as a deviation.
12. **Speculative subsystems excluded, not deferred** — neural stimulation, cortical data transfer,
    biological storage, cognitive firmware, causal genotype→connectome inference. See
    `docs/LIMITATIONS.md` §3 and `CLAIMS_REGISTER.md` §3.

### Fixed during this release cycle (defects found by running, not by reading)

| Defect | Found by | Fix |
| --- | --- | --- |
| Frame magic scanned as ASCII `"HD"` while the wire bytes are `44 48` | Native C test / host parser tests | Scan for the little-endian byte pair; both suites assert it |
| `StepResult.as_dict()` unpacked a dict as pairs, raising on every call | Unit test | Build the channel map explicitly |
| Audit writer reported length 0 before its first write after a restart | Unit test | Properties trigger lazy chain restore |
| `EngineConfig.as_dict()` → `from_dict()` was not round-trippable (bounds as list, `x_ref` at top level) | Unit test | Both shapes accepted; round trip asserted |
| Unstable `A` produced sessions pinned at maximum stress with zero input | Session trace of the demo | Spectral-radius gate in config validation |
| Sensitivity analysis showed the stress ceiling was unreachable at the original gain | Equilibrium computation | `sensor_gain` derived from the reachability criterion |
| Resting subjects reported permanent deviation | Session trace | One-MAD deadband in the normaliser |
| Demo episode shape saturating the state continuously | Session trace | Episodes shortened and amplitudes reduced in the simulated source |

### Known limitations (unchanged)

Sensor accuracy, battery life, BLE latency, thermal behaviour, EMC and electrical safety are
**unmeasured**. The governor is a software gate, not a medical safeguard. See `docs/LIMITATIONS.md`.

---

## Unreleased

* Bench validation of the sensor path against reference instruments (see `docs/ROADMAP.md` Phase 3).
* BME280 factory-calibration compensation and NVS storage (currently reports `env_valid = false`
  rather than approximating an uncompensated count).
* Firmware signing: the CI hook exists, no key is configured.
* Accessibility audit with assistive technology.
* **Development and production deployment blueprint** — `docs/BLUEPRINT_DEV_TO_PROD.md`: environment
  model (E0–E5), change taxonomy (Classes A–E), CI job map, promotion gates, production topologies,
  verification and traceability, the bench-validation programme design, operations, security and
  privacy, governance and standards readiness, and a phased plan whose acceptance criteria are
  artefacts rather than opinions.
* **Executable promotion gate** — `scripts/promotion_gate.py` plus `make promote ENV=…`, applying the
  same gate profiles as `deploy.yml` locally. Verified: dev **1/1**, test **3/3**, prod **4/5** —
  blocked on artefact signing, which is the correct outcome rather than a defect, and is now
  measurable in one command.
* **Fixed:** `MANIFEST.sha256` had drifted from the tree (two files modified after it was generated)
  while both the CI governance job and the prod gate depend on `--check`. Regenerated and re-verified
  to `MANIFEST: OK` (139 artefacts). The check was not relaxed.
* **Fixed:** `docs/TESTING.md` stated "87 tests"; the suite measures **165** (unit 124 · contract 28 ·
  safety 8 · fuzz 5) with Python 3.12 on 2026-09-22.
