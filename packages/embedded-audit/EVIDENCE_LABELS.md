# Evidence labels

Every artefact in this repository carries exactly one label. The label is part of the artefact —
in docstrings, in the `model_card()`, in `provenance.evidence_label` on every published frame, and in
`CLAIMS_REGISTER.md`. A reader should never have to guess whether a number came from a sensor, a
simulation, or a rendering.

| Label | Exact meaning | What would move it forward |
| --- | --- | --- |
| `IMPLEMENTED_AND_TESTED` | Source exists, an automated test exercises it, and the test passes in CI on a clean checkout | Nothing — but read the *scope* of the tests |
| `SIMULATED` | Runs over synthetic or recorded inputs. Not connected to a biological subject or a certified device | A real acquisition session with provenance |
| `CONCEPTUAL_ARCHITECTURE` | Interfaces and responsibilities are specified; the code or the hardware validation is incomplete | Bench or hardware validation with recorded results |
| `RESEARCH_HYPOTHESIS` | A claim awaiting experimental validation. Not a capability | A study with a protocol, endpoints and reviewers |
| `FICTIONAL_VISUALISATION` | Communicative imagery or narrative that asserts nothing about the system | Not applicable — it is not a technical claim |

---

## Label assignment by module

| Path | Label | Rationale (evidence, not intent) |
| --- | --- | --- |
| `software/sovereign_hdi/linalg.py` | `IMPLEMENTED_AND_TESTED` | `test_linalg.py` incl. NumPy/stdlib equivalence |
| `software/sovereign_hdi/config.py` | `IMPLEMENTED_AND_TESTED` | `test_config.py` — required keys, ranges, round trip |
| `software/sovereign_hdi/prometheus_engine.py` | `IMPLEMENTED_AND_TESTED` (mechanism) | `test_prometheus_engine.py` — bounds, fail-closed, provenance |
| `software/sovereign_hdi/prometheus_engine.py` (physiological meaning) | `SIMULATED` | No identified parameters, no clinical dataset |
| `software/sovereign_hdi/safety_governor.py` | `IMPLEMENTED_AND_TESTED` | `test_safety_governor.py`, `tests/safety/test_safety_gate.py` |
| Governor threshold *values* (0.90 / 0.20) | `CONCEPTUAL_ARCHITECTURE` | Illustrative configuration, not validated limits |
| `software/sovereign_hdi/calibration.py` | `IMPLEMENTED_AND_TESTED` | `test_calibration.py` incl. degenerate-scale handling |
| `software/sovereign_hdi/omniroot_client.py` — framing, CRC, Replay | `IMPLEMENTED_AND_TESTED` | `test_frame_protocol.py`; same CRC vector asserted in C |
| `software/sovereign_hdi/omniroot_client.py` — `BleTransport`, `SerialTransport` | `CONCEPTUAL_ARCHITECTURE` | No hardware run recorded |
| `software/sovereign_hdi/telemetry_schema.py` | `IMPLEMENTED_AND_TESTED` | `test_telemetry_schema.py` (19 negative cases) |
| `software/sovereign_hdi/sealing.py` | `IMPLEMENTED_AND_TESTED` | `test_audit_chain.py` — edit/delete detection |
| ML-DSA / Dilithium signatures | **Not implemented** | `signature.algorithm` accepts `"NONE"` only |
| `software/sovereign_hdi/telemetry/*` | `IMPLEMENTED_AND_TESTED` | Writer, chain, aggregate export |
| `software/sovereign_hdi/api/*` | `IMPLEMENTED_AND_TESTED` | `test_ingest_contract.py`, `test_api_endpoints.py` |
| `software/sovereign_hdi/simulation/*` | `SIMULATED` | By construction; labelled in every record |
| `software/sovereign_hdi/stability.py` | `IMPLEMENTED_AND_TESTED` | `test_stability_fuzz.py` |
| `firmware/…/src/crc16.c`, `protocol.c` | `IMPLEMENTED_AND_TESTED` | `test/native_frame_test.c` — 20 checks, host native build |
| `firmware/…/src/sensors.c`, `ble_service.c`, `main.c` | `CONCEPTUAL_ARCHITECTURE` | Compiles against ESP-IDF; **no hardware validation** |
| `dashboard/` | `IMPLEMENTED_AND_TESTED` | Production build + rendered preview pass |
| Dashboard *values* in SIMULATED mode | `SIMULATED` | Banner + `provenance.evidence_label` on every frame |
| `docs/compliance/*` | `CONCEPTUAL_ARCHITECTURE` | Assessments and templates, not test reports |
| Rendered brain/neural imagery | `FICTIONAL_VISUALISATION` | Illustrative; not a scan, not a schematic |

---

## Rules that follow from the labels

1. **A status badge is not verification.** `LIVE`, `SECURE`, `OPTIMAL` and `VERIFIED` in a user
   interface are display strings. In this codebase the only statuses that mean anything are the
   telemetry `status` enum (`LIVE | CALIBRATED | SIMULATED | PROTOTYPE`) and the governor codes,
   both of which are produced by validated code paths and are covered by tests.
2. **A displayed percentage is not a measured percentage** unless acquisition method, calibration,
   uncertainty and validation are supplied. The dashboard shows units, provenance and uncertainty
   alongside values precisely so this distinction survives the UI.
3. **Mock data must announce itself.** Anything from `simulation/` carries
   `status="SIMULATED"` and a `sim-*` node id, and the dashboard renders a persistent
   `DEMO / SIMULATED` banner rather than a subtle footnote.
4. **A protocol name is not an implementation.** Names appearing in the source corpus
   (e.g. "Quantum Optimizer", "Neuro-Link v3.2") are UI text. None of them maps to code here.
5. **Do not promote a label by editing prose.** The label changes only when the evidence it
   describes exists, and the change must be recorded in `CLAIMS_REGISTER.md`.
