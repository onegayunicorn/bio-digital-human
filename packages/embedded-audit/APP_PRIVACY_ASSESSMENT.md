# Privacy Impact Assessment scaffold (Australian Privacy Principles)

**Status: TEMPLATE / NOT COMPLETED.** This is a scaffold, not an assessment, and not legal advice.
Assessor: `<unassigned>` · Completion date: `<unassigned>` · Version: 2.5.0

> Physiological signals and state estimates can be sensitive. Whether they constitute "health
> information" or "sensitive information" for the purposes of the Privacy Act 1988 is a legal question
> to be answered by counsel. This scaffold assumes the *conservative* position: treat all biosignal and
> derived-state data as sensitive personal information, and design accordingly.
>
> Confirm current APP obligations, thresholds and notification requirements with the Office of the
> Australian Information Commissioner's current guidance before relying on anything below.

---

## 1. Data inventory

| Data | Sensitivity assumed | Where it lives | Retention (proposed) | Egress |
| --- | --- | --- | --- | --- |
| Raw physiological signals (PPG/EDA/temperature/motion) | Sensitive | RAM on the node and gateway only | Not persisted by the reference implementation | **None** |
| Normalised deviations `z` | Sensitive (derived from above) | RAM | Session only | None |
| State estimates `x` | Sensitive (inferred physiological state) | Local audit log, hash-chained | 30 days raw (proposed) | Aggregates only |
| Governor verdicts and engine statistics | Low | Local audit log | 30 days raw (proposed) | Aggregates only |
| Subject pseudonym / calibration profile | Moderate | Local config file | Until deleted by the user | None |
| Aggregate exports | Low–moderate | Wherever the operator puts them | Operator's choice | Operator-initiated |

## 2. APP mapping (design position vs. verified state)

| APP | Requirement in outline | Design position in this repository | Verified? |
| --- | --- | --- | --- |
| APP 1 — open and transparent management | Published, current privacy policy | **Not written**; a policy is required before any collection from a third party | **No** |
| APP 2 — anonymity and pseudonymity | Allow pseudonymous use where practicable | Subject identifiers are pseudonymous by design (`AX-EXAMPLE`-style ids, no names in code paths) | Partly |
| APP 3 — collection of solicited personal information | Collect only what is necessary; consent for sensitive information | Minimisation is architectural: single-purpose acquisition, no raw-signal egress | **Consent instrument not written** |
| APP 4 — dealing with unsolicited information | Destroy/de-identify if it would not have been collected | Not addressed | **No** |
| APP 5 — notification of collection | Tell the individual what is collected and why | Not written (no user-facing notice exists) | **No** |
| APP 6 — use and disclosure | Use only for the primary purpose | No third-party processing, no analytics, no telemetry phone-home | Yes (by absence of code) |
| APP 7 — direct marketing | Not applicable unless marketing is added | Not applicable | n/a |
| APP 8 — cross-border disclosure | Only with consent / equivalent protection | No cloud dependency; no cross-border flow in reference code paths | Yes (by design) |
| APP 9 — government related identifiers | Do not adopt as own identifier | No government identifiers used | Yes |
| APP 10 — quality | Accurate, up to date, complete | **Cannot be asserted**: sensor accuracy is unmeasured (`LIMITATIONS.md` §4) | **No** |
| APP 11 — security | Protect from misuse, interference, loss, unauthorised access | Local-only storage, hash-chained log, loopback-only hub, token for remote access, no secrets in code | Partly — no independent security assessment |
| APP 12 — access | Individual can access their information | Audit log is a local file the operator can read; no user-facing export tool | Partly |
| APP 13 — correction | Individual can correct information | Journal notes can be added (baseline re-capture supersedes calibration) | Partly |

## 3. Open questions for the assessor

1. Are derived state estimates personal information even when the raw signal is never stored?
2. What is the lawful basis for processing a healthy volunteer's signals during **engineering
   validation** (as opposed to product use)? Is a research-ethics pathway required?
3. Is a notifiable data breach assessment required if an unencrypted audit log on a lost phone is
   recovered? (Assume yes until advised otherwise.)
4. What retention period is defensible for a prototype, and what deletion proof is required?
5. Does the local-only design change any obligation, or only the exposure?

## 4. Required artefacts before any collection from another person

| Artefact | Status |
| --- | --- |
| Privacy policy / collection notice (APP 1, APP 5) | **Absent** |
| Consent form or instrument (APP 3) | **Absent** |
| Retention and deletion schedule | **Absent** (30 days proposed) |
| Data breach response plan | **Absent** |
| Access/correction procedure (APP 12, 13) | **Absent** |
| Encryption-at-rest and backup policy | **Absent** |
| Ethics review (if treated as research) | **Not sought** |
| Completed PIA with sign-off | **This document is not it** |

**Standing rule:** no session with another person may be recorded until at least the consent
instrument and the retention schedule exist and the participant has read them.
