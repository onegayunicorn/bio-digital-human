# Limitations and explicit non-claims

This file is the counterpart to the README's truth declaration: not "what the system does", but
**what it does not do and must never be described as doing.** Where the wider concept corpus made a
claim that is not established by evidence, the claim is listed here and left unimplemented.

---

## 1. Not a medical device

No part of this repository is a medical device, and nothing here has been submitted to or cleared by
the TGA, FDA, EU MDR or any other regulator. The platform is a monitoring and visualisation
instrument. `docs/compliance/TGA_INTENDED_USE.md` records the intended-use statement and the scope
boundary; it is a draft for review, not a determination.

Practical consequence: outputs must not be used to diagnose, treat, monitor a disease, or make any
clinical decision, and no output may be presented to a user as a health assessment.

---

## 2. The state model is not a validated digital twin

`PROMETHEUS` is a bounded non-linear state-space object with **illustrative parameters**.

* No clinical dataset, parameter-identification procedure, comparator group, prospective validation or
  clinical endpoint exists for it.
* The five channels (`damage`, `inflammation`, `stress`, `fatigue`, `reserve`) are **unitless
  indices**. They are not measured quantities and do not have physiological units.
* The thresholds `max_stress = 0.90` and `min_reserve = 0.20` are configuration values chosen to make
  the gate demonstrable. They are **not** validated physiological limits and must not be read as
  "safe" or "unsafe" boundaries for a person.
* Numerical stability (`stability.py`) is a property of the arithmetic. It says nothing about whether
  the estimate tracks anything real.

---

## 3. Not a neural interface

The following capabilities appear in the source concept corpus and are **not implemented anywhere in
this repository**. They are not "on the roadmap" either; they are out of scope.

| Not implemented | Why it is not here |
| --- | --- |
| Direct neural stimulation or electrode drive | Requires invasive hardware, charge-density limits, isolation design, emergency disconnect, ethics approval and clinical evidence — none of which exist here |
| Uploading "digital code" into a nervous system / "cognitive firmware" | No mechanism exists; the source code was number-to-number transformation only |
| Biological data storage, synthetic engrams, synaptic addressing | Fiction as specified; Reed–Solomon parity and wear-levelling do not map to biological synapses |
| STDP-like stimulation patterns | There is no stimulator, and no stimulation waveform, lead-off detection or current limit in this firmware |
| Causal genotype → connectome optimisation | Toy fixtures (`BDNF`, `APOE`, `rs12345`) with synthetic graph weights, in the source, were not associations |
| Accelerated tissue repair, inflammation suppression, "conscious-intent healing" | No clinical evidence, no plausible mechanism in the model, and no actuator |
| A software cache preventing excitotoxicity | A cache cannot gate a biological process |

If any of these is ever pursued, it starts as a **separate** programme with its own protocol,
approvals and evidence — not as a feature branch here.

---

## 4. Hardware and performance claims not established

| Claim | Status |
| --- | --- |
| Sensor accuracy (HR, HRV, EDA, skin temperature) | **Not measured.** No reference instrument comparison, no bench fixture, no reproducibility study |
| Battery life > 7 days at 1 min cadence | **Not measured.** No power-profiling run exists |
| End-to-end BLE latency < 50 ms | **Not measured.** The BLE path has not been executed against a phone |
| Android 14 boot behaviour on the A17 | **Not executed.** The Termux service unit is written but not run on the device in this repository |
| Enclosure, thermal behaviour, ingress protection | **Not designed here.** No CAD, no materials, no thermal test |
| EMC emission/immunity | **Not tested.** No test house, no report |
| Electrical safety | **Not tested.** A design checklist exists; that is not a test report |

Anything in the table above that appears in a document elsewhere in this repository is marked as a
target or a plan, never as a result.

---

## 5. Security and cryptography boundaries

| Implemented | Not implemented |
| --- | --- |
| SHA3-256 evidence seals over canonical envelope bytes | Post-quantum signatures (`ML-DSA-65` is named in the source blueprint and is **absent** — `signature.algorithm` accepts `"NONE"` only) |
| Hash-chained, tamper-evident NDJSON audit log | Remote timestamping authority integration; Merkle inclusion proofs |
| Bearer-token authentication, loopback-only default, CORS allow-list | TLS termination (deploy behind a proxy), key custody/HSM, rotation policy, threat model sign-off |
| Firmware build provenance via CI artefacts | Signed firmware images (the workflow has the hook; **no key is configured** in this repository and `FW_SIGNING_KEY` is unset by default) |

A SHA3-256 seal proves the envelope was not altered after sealing. It does **not** prove who created
it, when, or with what authority — that is what a signature and a timestamp authority would add.

---

## 6. Data-handling limits

* The reference implementation keeps raw biosignals local and exports aggregates only. That is a
  *design decision*, not a compliance certification: no Privacy Impact Assessment has been completed,
  no retention schedule has been approved, and no consent instrument has been reviewed.
* Subject identifiers in `config/calibration.example.json` and in the dashboard demo (`AX-EXAMPLE`,
  `AX-7G`) are **fictional placeholders** taken from illustrative screens, not records of any person.
* The demo mode generates synthetic physiology. It is deterministic and reproducible, and it is
  labelled. It must never be presented as a recording.

---

## 7. Provenance of this repository

This repository was extracted and hardened from a concept corpus (*Digital Human*) whose own audit
concluded that its code listings were illustrative, its images conceptual, and several subsystems
fictional. The audit findings are summarised in `docs/audit/README.md`. The boundary the audit drew —
between engineering-grounded, unverified, and fictional content — is preserved here as
`EVIDENCE_LABELS.md` + `CLAIMS_REGISTER.md` rather than being collapsed into a single confident
narrative.

Where this repository *departs* from the source, the departure is recorded (see
`ARCHITECTURE.md` §3.1 and `CHANGELOG.md`) so the difference is visible rather than silent.
