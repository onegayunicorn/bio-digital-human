# Intended-use statement and therapeutic-goods scope boundary (Australia)

**Status: DRAFT — NOT REVIEWED — NOT A REGULATORY DETERMINATION.**
Assessor: `<unassigned>` · Review date: `<unassigned>` · Version: 2.5.0

> This document exists so that a qualified regulatory professional can review a *concrete* intended-use
> statement. It does not state, and must not be read as stating, that the product is or is not a
> therapeutic good, or which classification applies. Device classification and ARTG inclusion are
> determinations for the TGA. Any question about current legislative requirements, fees or
> classification rules must be confirmed against the TGA's current published guidance.

---

## 1. Proposed intended use

> SOVEREIGN HDI is a **non-invasive personal biofeedback and physiological state-visualisation
> instrument**. It acquires pulse-derived heart rate and heart-rate variability, electrodermal
> activity, skin temperature and motion from a wearable sensor node; maintains a bounded
> software state estimate derived from those signals; displays that estimate and its provenance to the
> user; and records the estimate locally with cryptographic integrity protection.
>
> It is intended for **personal, non-clinical use in a healthy adult population** as a self-awareness
> and relaxation-training aid, and for **engineering evaluation**.

## 2. Explicitly not intended

This is the part reviewers must check most carefully, because a claim here would be a regulatory claim:

| Not intended for | Note |
| --- | --- |
| Diagnosis, cure, mitigation, treatment or prevention of any disease, injury or disability | No clinical evidence exists |
| Monitoring of a disease, condition or physiological parameter for clinical decision-making | No validated measurement chain |
| Pregnancy, paediatric, or any use on a person unable to remove the device themselves | No safety data |
| Use on a person with an implanted electronic device | No assessment of interaction |
| Emergency, ambulance, intensive-care or surgical contexts | Not designed, not tested, not supported |
| Replacing any advice from a qualified health professional | Not a substitute |
| Driving, operating machinery or any activity where an unreliable signal is hazardous | The signal is not validated for any consequential use |
| Applied to broken skin, or in the presence of topical agents | No biocompatibility assessment |

## 3. Scope questions for the reviewer

These determine whether the product falls within therapeutic-goods regulation. **None is answered here**;
each is recorded so the review starts from the right questions.

1. Does the combination of heart-rate/HRV, EDA and a displayed "stress" index constitute a
   **physiological monitoring** function for a therapeutic purpose, even without a disease claim?
2. Does a *derived* index (`stress`, `reserve`) — as distinct from a raw signal — change the analysis
   compared with displaying HR alone?
3. Do the words used in the interface and marketing material create an implied therapeutic claim
   regardless of the intended-use statement? (Review the actual dashboard copy, not this document.)
4. If a clinical claim were ever made, what classification and conformity-assessment route would
   apply, and what evidence would be required?
5. What are the obligations regarding **advertising** and **labelling** if the product is supplied
   commercially? Confirm against current TGA guidance.
6. Is a **sponsor** required, and does one exist? (Currently: **no responsible legal entity appointed**.)

## 4. Required evidence before any change of status

| Evidence | Status |
| --- | --- |
| Completed clinical evaluation or literature-based clinical evidence | **Absent** |
| Validated sensor accuracy against reference instruments | **Absent** |
| Completed risk management file (ISO 14971) | Draft only — `RISK_REGISTER.md` |
| Software lifecycle records (if a medical claim is pursued) | **Absent** |
| Quality management system (e.g. ISO 13485) | **Absent** |
| Appointed responsible entity / sponsor | **Absent** |
| Post-market surveillance and adverse-event process | **Absent** |

## 5. Current permitted communication

Until this document is reviewed and any required assessment completed, communications must remain
descriptive and non-clinical. Permitted: "a personal biofeedback and state-visualisation prototype",
"engineering prototype / evaluation build", "records what it measured, with provenance".
Prohibited: see `../CLAIMS_REGISTER.md` §3.
