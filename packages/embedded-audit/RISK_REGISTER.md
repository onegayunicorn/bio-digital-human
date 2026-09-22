# Risk register (ISO 14971-style scaffold)

**Status: DRAFT — NOT A RISK MANAGEMENT FILE.** A compliant file requires a defined scope, an
appointed manufacturer, a risk policy with acceptability criteria, verification of each control, and
review by qualified people. Assessor: `<unassigned>` · Version: 2.5.0

Severity and probability are ordinal placeholders (`L/M/H`), not scored values, because no
acceptability criteria have been agreed. Control verification is stated honestly: "implemented" means
code or a test exists; "verified" means a recorded test result exists.

---

## 1. Risks

| ID | Hazard | Foreseeable sequence | Sev | Prob | Control (implemented) | Verified? |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | **Electric shock** via a mains-referenced path through the subject | Phone/laptop charging from mains while electrodes attached; fault current returns through the subject | H | M | Battery-only operation; SELV < 5 V; no mains-powered supply permitted during a session; electrodes on the isolated node rail; prohibition documented in `AU_ELECTRICAL_EMC.md` §2 | **No** (no test; requires schematic review) |
| R-02 | False reassurance from an unvalidated index | User reads a low `stress` value as a health assurance and defers seeking care | H | M | Provenance labels on every frame; `SIMULATED` banner in demo mode; caveat text in exports; scope statement and prohibited-claims register; dashboard displays units, model and parameter version | Partly (labels implemented; no human-factors study) |
| R-03 | Skin irritation or pressure injury at electrodes | Long sessions, adhesive sensitivity, high contact pressure | M | M | Single-use electrodes; session duration limits recommended; skin inspection before/after; cleaning instructions | **No** (instructions not yet drafted; no biocompatibility assessment) |
| R-04 | Thermal injury or discomfort from LED current / device heat | Continuous optical drive against skin; enclosure with no thermal path | M | L | Duty-cycled acquisition; conservative LED current; forced-mode environmental sensor to reduce self-heating; cadence-limited loop | **No** (no thermal test) |
| R-05 | Motion artefact interpreted as physiology | Optical/electrode signal corrupted by movement; a plausible but wrong value displayed | M | H | `MOTION_REJECT` flag; HRV reported as `NaN` rather than smoothed; deviation clipped and flagged; `qulaity.fault_flags` surfaced to the UI | Partly (logic tested; thresholds not bench-tuned) |
| R-06 | Sensor disconnect produces silence mistaken for calm | Electrode falls off; no signal is read as a low-stress state | M | M | Invalid channels transmit `NaN` with validity flags clear; `sensor_invalid` counter; ingest quarantines `sensor_ok = false`; `FAULT_FLAGS` visible in the UI | Yes (tested in `test_ingest_contract.py`) |
| R-07 | Over-trust in a "secure"/"verified" status badge | UI strings imply properties the system does not have | M | M | Badges are driven by validated code paths; evidence labels on every artefact; `CLAIMS_REGISTER.md` §3 prohibits unsupported claims | Partly |
| R-08 | Data exposure from a lost or shared device | Unencrypted audit log recovered from a stolen phone | M | M | Local-only storage; loopback-only default; bearer token for remote; no cloud sync | Partly (no encryption-at-rest; no PIA completion) |
| R-09 | Silent data corruption reaching a decision | CRC pass but semantic error, or a client bug that drops frames without notice | M | L | CRC-16 per frame; sequence/window checks; ingest acknowledgement per envelope; `frame_count`/`invalid_frames` reported in exports; `clip_rate` and fault counters published | Yes (ingest and framing tested) |
| R-10 | Audit log altered to hide an event | Operator or third party edits NDJSON | M | L | Hash chain; `seal-check` reports the failing index; logs are append-only by design | Yes (`test_audit_chain.py`) |
| R-11 | Firmware substitution | Flashed image is not the reviewed build | M | L | CI builds artefacts; `FW_SIGNING_KEY` hook exists | **No** (no key configured; signing not enforced) |
| R-12 | Unauthorised remote control of the hub | Hub bound to a LAN interface without a token | M | L | Loopback-only unless `HDI_API_TOKEN` is set; timing-safe comparison; CORS allow-list | Yes (`test_bearer_token_is_enforced_when_configured`) |
| R-13 | Battery failure mid-session | Sudden power loss with electrodes attached | L | M | Read-only sensing; loss of power produces silence, not an actuation | By design (no actuator) |
| R-14 | Misuse in a population not assessed | Use on children, pregnancy, implanted devices | M | L | Explicit not-intended list in `TGA_INTENDED_USE.md` §2; labelling requirement outstanding | **No** (labels not produced) |

## 2. Risk-control principles applied

1. **Eliminate the function rather than guard it.** No stimulation and no actuator path exist, so the
   largest hazard class is removed by design rather than controlled (`SAFETY.md` §1).
2. **Fail closed, and say so.** Insufficient data becomes `NaN` + a clear flag, never a plausible
   default; ingest rejects or quarantines rather than coercing.
3. **Make misuse visible.** Every number carries provenance, and prohibited claims are enumerated.
4. **Do not claim a control you have not verified.** The "Verified?" column exists for that purpose.

## 3. Residual risks that block any release

| Residual risk | Blocking condition |
| --- | --- |
| R-01 (shock) | No electrical review or test. **Blocks any deployment involving another person** |
| R-02 (false reassurance) | No human-factors validation of the display |
| R-03, R-04 | No biocompatibility or thermal assessment |
| R-08 | No PIA, no retention schedule, no encryption-at-rest |
| R-11 | No firmware signing key |

## 4. Required to close out

1. Appoint a responsible entity and a risk-management owner (currently `<unassigned>`).
2. Agree acceptability criteria before scoring anything — scoring risks without criteria is theatre.
3. Verify each control with a recorded test, bench result or review, and update the "Verified?" column.
4. Re-review after **any** change to the model, thresholds, sensor set or intended use.
