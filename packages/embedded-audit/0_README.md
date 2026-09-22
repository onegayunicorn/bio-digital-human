# Compliance dossier

**Status of everything in this directory: DRAFT / ASSESSMENT ONLY.**
No document here is a certificate, a test report, a declaration of conformity or a regulatory
determination. Each is a structured checklist prepared so that a competent professional can complete
the assessment, and each states explicitly what evidence is missing.

| Document | Purpose | Status | Who must complete it |
| --- | --- | --- | --- |
| [`TGA_INTENDED_USE.md`](TGA_INTENDED_USE.md) | Intended-use statement and device-scope boundary (Australia) | Draft, unreviewed | Regulatory professional; sponsor if a device claim is ever made |
| [`AU_ELECTRICAL_EMC.md`](AU_ELECTRICAL_EMC.md) | AS/NZS electrical safety and EMC assessment checklist | Draft, untested | Electrical engineer; accredited test house for EMC |
| [`APP_PRIVACY_ASSESSMENT.md`](APP_PRIVACY_ASSESSMENT.md) | Privacy Impact Assessment scaffold mapped to the Australian Privacy Principles | Template | Privacy officer / legal counsel |
| [`ACSC_ESSENTIAL_EIGHT.md`](ACSC_ESSENTIAL_EIGHT.md) | Cyber-hygiene mapping (eight mitigation strategies) | Draft | Security lead |
| [`RISK_REGISTER.md`](RISK_REGISTER.md) | ISO-14971-style hazard analysis | Draft | Quality/regulatory lead with clinical input |
| [`../CLAIMS_REGISTER.md`](../CLAIMS_REGISTER.md) | Every claim with its evidence label; prohibited claims | Maintained | Whoever communicates about the system |

---

## Framing

Two questions must never be conflated:

1. **"Is the engineering bounded and honest?"** — answerable here, with tests and registers. This
   repository can answer it: bounds hold, fail-closed behaviour is tested, claims are labelled, and the
   gaps are enumerated rather than hidden.
2. **"Is this product legally supplyable as a medical device, or safe for a person?"** — **not**
   answerable here. That requires an independent assessment, accredited testing, clinical evidence and
   a responsible legal entity.

This dossier only works on question 1, and it repeatedly states where question 2 begins.

---

## Device scope in one paragraph

The platform is a **non-invasive biofeedback and physiological state-visualisation** system. It senses
pulse-derived heart rate/HRV, electrodermal activity, temperature and motion; it estimates a bounded
state; it displays the estimate; and it records the estimate with cryptographic provenance. It does not
stimulate, actuate, dose, diagnose, or claim therapeutic benefit. Under Australian regulation, whether
that description makes it a medical device, and if so which classification applies, is a determination
for the TGA and a qualified regulatory professional — the intended-use draft exists so that review can
start from a concrete statement rather than a moving target.

---

## Evidence gaps that block any conformity claim

| Gap | Consequence |
| --- | --- |
| No accredited EMC or electrical test report | Cannot claim AS/NZS compliance, only "designed with reference to" |
| No sensor-accuracy study against a reference instrument | Cannot claim measurement accuracy or uncertainty |
| No clinical investigation | Cannot claim any clinical benefit, and must not imply one |
| No completed PIA or approved retention schedule | Cannot claim APP compliance |
| No external security assessment or threat-model sign-off | Cannot claim the Essential Eight posture is verified |
| No firmware signing key configured | Cannot claim verifiable firmware provenance for a release |
| No responsible legal entity / sponsor appointed | No one can make a regulatory submission |

Each gap is tracked in `RISK_REGISTER.md` with an owner field left **unassigned** — deliberately, so it
is visible that the assignment has not happened.
