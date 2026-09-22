# Contributing

## The one rule that matters

**Do not promote a claim past its evidence.** This repository exists because a concept corpus mixed
working engineering with unverifiable claims and presented them uniformly. The core value here is the
opposite discipline: `docs/EVIDENCE_LABELS.md` defines the labels, `docs/CLAIMS_REGISTER.md` records
which claim rests on which artefact, and both are part of the code review.

If a change makes the system *look* more capable than it is — a label removed, a disclaimer softened, a
`sensor_gain` raised so a demo looks livelier, a threshold reworded as a safety limit — it will be
rejected regardless of how clean the diff is.

---

## Before opening a change

```bash
cd software && python -m pytest -q                     # full suite
cd .. && python scripts/verify_stability.py --steps 5000
python scripts/gen_evidence_manifest.py                # refresh the manifest if you added files
```

Firmware framing changes additionally require:

```bash
cd firmware/esp32-omniroot
gcc -std=c11 -Wall -Wextra -Iinclude test/native_frame_test.c src/crc16.c src/protocol.c -lm -o /tmp/f && /tmp/f
```

Dashboard changes additionally require:

```bash
cd dashboard && npm run build && node parity_runner.mjs /tmp/inputs.json   # see tests/contract/test_js_engine_parity.py
```

---

## Review checklist

* [ ] Every new module carries an evidence label in its docstring and a row in `EVIDENCE_LABELS.md`.
* [ ] New user-visible claims are added to `CLAIMS_REGISTER.md`; removed coverage demotes the claim in
      the same change.
* [ ] Nothing in the diff introduces an actuator path, a stimulation routine, or an automatic source
      of the control vector `u`.
* [ ] Invalid data still fails **closed**: a fault leaves the previous state intact and is reported.
* [ ] New numbers carry units and provenance; no bare figures in the UI or in exports.
* [ ] Parameter changes bump `param_version` in `config/default_model.json` **and** the mirror in
      `dashboard/src/lib/modelConfig.js`, with the reason recorded in `CHANGELOG.md`.
* [ ] No secrets, tokens, keys, real subject identifiers or real subject data in the diff.
* [ ] Raw biosignals still have no egress path; exports remain aggregate-only.
* [ ] No new dependency without a one-line justification: each one is a supply-chain and audit surface.

---

## Code style

* Python: standard library first. NumPy is an *optional accelerator*; the engine must keep working
  without it, and `tests/unit/test_linalg.py` enforces agreement between both paths.
* Comments explain **why**, especially when the reason is a failure that happened. A comment that
  restates the code adds noise; a comment recording a defect ("this check exists because over-coupled
  A self-amplified to its bounds") is the most valuable thing in the file.
* No `random` in production paths. Determinism is a tested property.
* C: `-Wall -Wextra` with undefined-behaviour warnings promoted to errors. The frame layout is a wire
  contract; assert its size rather than trusting the struct.
* JavaScript: no `Math.random`, no external CDN, no `@import` of a web font. The bundle must render
  with no network at all.

---

## Commit messages

```
<area>: <what changed>

Why: <the problem this solves, or the failure it prevents>
Evidence: <test name / bench result / trace that shows it>
Label: <IMPLEMENTED_AND_TESTED | SIMULATED | CONCEPTUAL_ARCHITECTURE | RESEARCH_HYPOTHESIS>
```

---

## What will be declined

Changes that implement any of the prohibited claims in `CLAIMS_REGISTER.md` §3, or that make a
simulated path indistinguishable from a measured one. If you believe one of those exclusions is wrong,
open an issue with evidence rather than a pull request with code — the exclusion is a position about
evidence, and it changes when the evidence does.
