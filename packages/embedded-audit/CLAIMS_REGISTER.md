# Claims register

Every user-visible or externally communicated claim, with its evidence label and the artefact that
supports it. **A claim may only be promoted by adding evidence and recording the change here** — never
by editing prose.

Revision: 2.5.0 · Labels defined in `EVIDENCE_LABELS.md` · Claims that exceed their evidence are listed
in §3 as prohibited.

---

## 1. Supported claims

| # | Claim | Label | Evidence |
| --- | --- | --- | --- |
| C1 | The frame protocol is a fixed 34-byte little-endian layout with CRC-16/CCITT-FALSE integrity | `IMPLEMENTED_AND_TESTED` | `include/protocol.h` (`_Static_assert`), `test/native_frame_test.c` (20 checks, host-native), `tests/unit/test_frame_protocol.py` |
| C2 | Corrupt or partial frame data is discarded, never interpreted | `IMPLEMENTED_AND_TESTED` | `test_frame_protocol.py::test_parser_resynchronises_after_*` |
| C3 | The state engine is deterministic: same config + same inputs ⇒ same trajectory | `IMPLEMENTED_AND_TESTED` | `test_deterministic_replay.py` |
| C4 | Model parameters are frozen and versioned; no randomness in production paths | `IMPLEMENTED_AND_TESTED` | `config/default_model.json` (`param_version`), `test_config.py` |
| C5 | State never leaves `[0, 1]` and never becomes non-finite, including under adversarial input | `IMPLEMENTED_AND_TESTED` | `stability.py` (4 regimes), `tests/safety/test_safety_gate.py` (5 000 steps) |
| C6 | The engine is dimension-, type- and finiteness-checked before arithmetic, and fails closed | `IMPLEMENTED_AND_TESTED` | `test_prometheus_engine.py` |
| C7 | Stress ceiling and reserve floor reduce or zero control authority, and authority never increases within a breach episode | `IMPLEMENTED_AND_TESTED` | `test_safety_governor.py`, `test_safety_gate.py` |
| C8 | Governor thresholds are configuration, not code | `IMPLEMENTED_AND_TESTED` | `test_thresholds_are_config_driven_not_hard_coded` |
| C9 | Baseline normalisation is a documented, deterministic transform with guards for degenerate signals | `IMPLEMENTED_AND_TESTED` | `calibration.py`, `test_calibration.py` |
| C10 | Telemetry envelopes are schema-validated with stable error codes | `IMPLEMENTED_AND_TESTED` | `telemetry_schema.py`, 19 negative cases in `test_telemetry_schema.py` |
| C11 | Evidence seals detect post-hoc modification of a stored envelope | `IMPLEMENTED_AND_TESTED` | `test_telemetry_schema.py::test_verify_seal_detects_tampering`, `test_audit_chain.py` |
| C12 | The audit log is tamper-evident against edits, deletions and reordering | `IMPLEMENTED_AND_TESTED` | `sealing.verify_chain`, `test_audit_chain.py` |
| C13 | Ingest distinguishes stored / duplicate / quarantined / rejected, is idempotent, and applies capture-age and sequence windows | `IMPLEMENTED_AND_TESTED` | `test_ingest_contract.py`, `test_api_endpoints.py` |
| C14 | Raw biosignals have no egress path; export is aggregate-only | `IMPLEMENTED_AND_TESTED` | `telemetry/export.py`, `test_export_is_aggregate_only` |
| C15 | The hub is loopback-only unless a token is configured, and token checks are timing-safe | `IMPLEMENTED_AND_TESTED` | `api/app.py::require_access`, `test_bearer_token_is_enforced_when_configured` |
| C16 | The reference implementation runs with or without NumPy, with identical results | `IMPLEMENTED_AND_TESTED` | `test_linalg.py::test_stdlib_fallback_matches_numpy` |
| C17 | The numerical core is fast enough for a 10 Hz loop on modest hardware | `IMPLEMENTED_AND_TESTED` | `stability.py` reports duration for 10 000 iterations; CI records it |
| C18 | No actuation, stimulation or dosing path exists in the codebase | `IMPLEMENTED_AND_TESTED` (by absence, reviewable) | `docs/SAFETY.md` §1; no GPIO drive, no current source, no actuator module; single-writer review of `firmware/` |
| C19 | The dashboard labels synthetic data as SIMULATED persistently in the UI | `IMPLEMENTED_AND_TESTED` | `dashboard/` provenance banner + `provenance.evidence_label` on every frame |

---

## 2. Claims that are true but weaker than they sound

| Claim | Why it is weaker |
| --- | --- |
| "Bounded non-linear digital twin" | It is a bounded non-linear simulation object. "Digital twin" implies an identified model of a specific person; the parameters are illustrative |
| "Safety Governor prevents unsafe states" | It prevents out-of-spec *software states* from being displayed or exported. It cannot prevent a physiological event and is not a safety instrument |
| "Sealed, audit-ready telemetry" | Sealed against modification, not against fabrication by the operator. There is no signature authority and no external timestamp |
| "Local-first, sovereignty by design" | True of the reference code paths. It is a design property, not a verified absence of network calls in every deployment |
| "Realtime 10 Hz state update" | True of the hub loop and of the simulated source. The end-to-end figure including BLE has not been measured |

---

## 3. Prohibited claims

These must not appear in any README, UI, pitch, paper or submission associated with this project.
They are prohibited because the evidence does not exist, and several are physically implausible as
stated.

1. Cures, treats, heals, regenerates or repairs tissue; reduces inflammation; accelerates recovery.
2. Reads, uploads, downloads or edits a human nervous system; "cognitive firmware"; "neural code".
3. Stores external data in a brain; synthetic engrams; synaptic addressing; brain-as-disk.
4. Stimulates neurons; modulates cortical activity; induces plasticity (no stimulator exists).
5. Diagnoses, monitors or predicts any disease or medical condition.
6. "Clinically validated", "medically certified", "TGA approved", "hospital grade", "medical device".
7. Guarantees safety, prevents excitotoxicity, or makes a hazardous intervention safe by thresholding.
8. Infers causal links between specific genotypes and neural topology.
9. Measured accuracy/confidence/quality figures that did not come from a documented measurement.
10. Quantum or photonic computation of any kind ("Quantum Optimizer" was a UI label in the source).

---

## 4. Change process

1. A new claim is added with label `RESEARCH_HYPOTHESIS` and no supporting evidence.
2. To promote it, add the evidence artefact (test, bench record, study) and reference it here.
3. Promote only the narrowest claim the evidence supports; keep the rest as hypotheses.
4. Any regression — a removed test, an unmeasured value reintroduced — demotes the claim. Record the
   demotion with a date rather than silently deleting the row.
