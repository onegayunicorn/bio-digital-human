# Testing and verification

## 1. What runs where

| Suite | Command | What it proves |
| --- | --- | --- |
| Python unit + contract + safety + fuzz | `cd software && python -m pytest` | Engine, governor, schema, sealing, audit chain, ingest, API, calibration, framing |
| Numerical stability sweep | `python -m sovereign_hdi verify --steps 200000` | Bounds and finiteness under four input regimes |
| Firmware framing (host native) | see §3 | Frame layout, CRC vector, corruption rejection — no hardware needed |
| Firmware framing (on target) | `idf.py -T test build` | Same vectors on the target toolchain and ABI |
| Dashboard production build | `npm run build` (in `dashboard/`) | Type/syntax/bundler correctness of the PWA |
| Dashboard rendered preview | local Vite preview + desktop/mobile check | Rendered output is non-blank and usable at both viewports |

**165 tests** run in the Python suite as measured on 2026-09-22 with Python 3.12 — unit 124 ·
contract 28 · safety 8 · fuzz 5 (`BLUEPRINT_DEV_TO_PROD.md` §1.1). The count is read from the CI log
and from a fresh `--collect-only`, never asserted in prose: the previous figure here read "87", which
is exactly the drift this sentence exists to prevent.

## 2. Test layout

```
tests/
├── unit/       engine, governor, config, linalg, calibration, framing, schema, audit chain, replay
├── contract/   ingest contract, API surface and acknowledgements
├── safety/     fail-safe cutout behaviour, bounds under adversarial input
└── fuzz/       four-regime stability sweep, structured-garbage inputs
```

Notable properties asserted (each maps to a row in `CLAIMS_REGISTER.md`):

* **Fail-closed on bad data.** A `NaN`/`inf`/out-of-range sample returns `INPUT_FAULT`, the previous
  state is retained, and the drop is counted — the frame is never silently coerced.
* **Bounds under attack.** 5 000 steps of alternating extremes never produce a state outside `[0, 1]`.
* **Determinism.** Two engines with the same configuration and inputs produce identical trajectories.
* **Accelerator equivalence.** With `numpy` unavailable, results match the NumPy path to 1e-12.
* **Tamper evidence.** Editing, deleting or reordering an audit record breaks chain verification, and
  the failure reports the offending index.
* **Idempotent ingest.** A replayed envelope returns `DUPLICATE` and is not double-counted.
* **Seal scope.** A tampered envelope is quarantined with `EVIDENCE_SEAL_MISMATCH` rather than stored.
* **Provenance.** Every published frame carries `model_version`, `param_version` and an evidence label.

## 3. Firmware framing, without hardware

```bash
cd firmware/esp32-omniroot
gcc -std=c11 -Wall -Wextra -Iinclude test/native_frame_test.c src/crc16.c src/protocol.c -lm -o /tmp/frame_test
/tmp/frame_test        # PASS: 20 checks, 0 failures
```

This compiles the real `protocol.c`/`crc16.c` and checks the layout, the shared CRC vector
(`CRC("123456789") == 0x29B1`), round-trip fidelity and corruption rejection. It is the fastest way to
catch a wire-contract regression and needs no toolchain beyond a C compiler.

## 4. What the tests deliberately do NOT do

* **They do not validate physiology.** No test asserts that a state channel corresponds to a
  physiological quantity, because no such mapping has been established.
* **They do not measure the hardware.** Sensor accuracy, battery life, BLE latency and thermal
  behaviour are unmeasured — see `LIMITATIONS.md` §4.
* **They do not certify safety.** `tests/safety/` tests the *gate*, not the *hazard* (`SAFETY.md` §1).
* **They do not exercise real transports.** BLE and Serial paths need hardware; offline work uses
  `ReplayTransport`, and the hardware paths stay labelled `CONCEPTUAL_ARCHITECTURE`.

## 5. Verification protocol for a change

1. `python -m pytest` — the full suite must pass; no skipped safety or contract tests.
2. `python -m sovereign_hdi verify --steps 200000` — stability report `passed: true`.
3. If the frame layout or CRC changed: run the native C test **and** the on-target test, and bump both
   `FRAME_VERSION` and the host parser in the same commit.
4. If a model parameter changed: bump `param_version` in `config/default_model.json` and record the
   reason in `CHANGELOG.md`. Old telemetry must remain interpretable, which is what the version field
   is for.
5. If a test was removed or weakened: demote the corresponding claim in `CLAIMS_REGISTER.md` in the
   same change. Silently dropping coverage while keeping the claim is the failure mode this register
   exists to prevent.

## 6. Deterministic replay as an evidence tool

`BiofeedbackMatrixEngine.replay(samples)` re-runs a recorded `(u, z)` sequence through the shipped
parameters, so a result can be reproduced from the inputs alone. Combined with the hash-chained audit
log, a third party can:

1. Take the audit log and re-verify the chain (`sovereign-hdi seal-check <file>`).
2. Recompute each frame's seal (`telemetry_schema.verify_seal`).
3. Replay the recorded inputs at the recorded `param_version` and compare trajectories.

If the third step diverges, either the model configuration or the log has been altered — and both are
detectable. That is the strongest verification property this project can currently offer, and it is
about *data integrity*, not about *clinical validity*.
