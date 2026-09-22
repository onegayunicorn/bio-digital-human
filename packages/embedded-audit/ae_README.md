# Source audit and provenance

This repository was derived from a concept corpus (*Digital Human*, 129-page PDF plus a 24-image
render set) that was independently audited before any code was written. The audit's conclusion
shaped the architecture: the implemented subset is the part the audit classified as
**engineering-grounded**, and the parts it classified as **fictional or speculative** are excluded and
listed in `../LIMITATIONS.md` §3.

## Audit inputs (as supplied)

| Artefact | What it is |
| --- | --- |
| `⚡️Digital-Human (4).pdf` | 129-page concept compendium: essays, architecture sketches, code listings, image interpretations |
| `DIGITAL_HUMAN_PDF_ANALYSIS.md` | Factual-vs-fictional analysis of the PDF, with the PDF→image matching |
| `ESP32_FASTAPI_NEUROSCAN_AUDIT.md` | Static audit of the ESP32/FastAPI/dashboard code listings and the proposed telemetry template |
| `SOVEREIGN_EXTRACTION_REPORT.md` | Image-corpus extraction: source-visible dashboard values, with evidence boundaries |
| 24-image render set | Five dashboard screens, humanoid renders, brain/network/circuit renders, one phone render |

The verbatim audit documents are **not** redistributed here. They contain third-party narrative and
image descriptions and (in the dashboard transcripts) health-style values that are simulated. Only the
conclusions relevant to engineering decisions are carried forward, in summary form below.

## Audit conclusions that this repository acts on

| Audit finding | Consequence in this repository |
| --- | --- |
| The state-space equation is a legitimate bounded non-linear discrete-time model | Kept, and corrected where it was dimensionally broken (`ARCHITECTURE.md` §3.1) |
| Parameters were random (`np.random.rand`), arbitrary, and never identified | Replaced with frozen, versioned configuration; determinism is now a test |
| The proposed telemetry schema was a template with string "types" and no requiredness | Implemented as an enforceable contract with 19 negative test cases (`DATA_CONTRACT.md`) |
| No ESP32 firmware, host bridge, FastAPI backend or WebSocket service existed | Implemented here, with the hardware paths labelled `CONCEPTUAL_ARCHITECTURE` until bench-validated |
| "Safety Governor" was a software check over simulated arrays | Kept, and documented as exactly that — not a medical safeguard (`SAFETY.md`) |
| Dashboard values were hard-coded fixtures or unseeded random numbers | Replaced with a seeded, structured, labelled simulation and a live hub path |
| Python clipped state to `[0, 100]` while JavaScript clipped to `[0, 1]` | Single documented scale `[0, 1]`; the inconsistency is called out in `CHANGELOG.md` |
| NeuroScan stress was derived from heart rate alone despite an HRV docstring | Replaced with a documented calibration transform; the misleading estimator is not carried over |
| "Verified / secure / optimal" badges were UI text, not validation state | Provenance and governor codes are now produced by validated code paths and tested |
| Neural data upload, biological storage, cognitive firmware, STDP stimulation, genomic causality | **Not implemented.** Listed as prohibited claims in `CLAIMS_REGISTER.md` §3 |

## Evidence-boundary vocabulary carried forward

The audit's classification vocabulary is preserved, renamed for engineering use:

| Audit term | Repository label |
| --- | --- |
| Source fact / non-fictional record | `IMPLEMENTED_AND_TESTED` (when a test exists) |
| Engineering-grounded concept | `CONCEPTUAL_ARCHITECTURE` |
| Illustrative implementation / unverified | `SIMULATED` |
| Speculative / fictional | `FICTIONAL_VISUALISATION`, and excluded from code |

## Standing rule

Any future artefact transplanted from the corpus must arrive with its audit classification intact.
A diagram, a screen recording or a code listing does not become a capability because it is in the
repository — it becomes a capability when there is a test, a bench record or a study that says so.
