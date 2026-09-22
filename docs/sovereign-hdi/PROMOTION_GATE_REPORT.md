The blueprint is built, verified, and the gates are executable. Here's what the promotion pipeline actually reports:

```widget 
<svg width="100%" viewBox="0 0 680 380" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Promotion gate status by environment</title>
  <desc>Matrix of six automatable promotion gates against the dev, test and prod environments. Dev passes its single unit gate. Test passes all three of its gates. Prod passes four of five and fails on artefact signing because no signing key is configured.</desc>

  <text x="40" y="56" font-size="13" font-weight="500" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Automatable gate</text>
  <text x="420" y="56" font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">dev</text>
  <text x="512" y="56" font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">test</text>
  <text x="604" y="56" font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">prod</text>

  <line x1="40" y1="72" x2="640" y2="72" style="stroke:var(--color-border-secondary, #C9CDD2)" stroke-width="1"/>

  <text x="40" y="96" font-size="13" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Python suite (unit)</text>
  <rect x="408" y="84" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="420" y="96" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>
  <rect x="500" y="84" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="512" y="96" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>
  <rect x="592" y="84" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="604" y="96" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>

  <text x="40" y="130" font-size="13" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Safety · contract · fuzz</text>
  <text x="420" y="130" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <rect x="500" y="118" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="512" y="130" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>
  <rect x="592" y="118" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="604" y="130" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>

  <text x="40" y="164" font-size="13" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Numerical stability</text>
  <text x="420" y="164" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <rect x="500" y="152" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="512" y="164" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>
  <rect x="592" y="152" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="604" y="164" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>

  <text x="40" y="198" font-size="13" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Frame contract (native C)</text>
  <text x="420" y="198" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <rect x="500" y="186" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="512" y="198" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>
  <rect x="592" y="186" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="604" y="198" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>

  <text x="40" y="232" font-size="13" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Evidence manifest</text>
  <text x="420" y="232" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <text x="512" y="232" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <rect x="592" y="220" width="24" height="24" rx="6" style="fill:var(--color-status-success-bg, #E7F3EA);stroke:var(--color-status-success-border, #4C8A5E)" stroke-width="0.5"/>
  <text x="604" y="232" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>

  <text x="40" y="266" font-size="13" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Artefact signing</text>
  <text x="420" y="266" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <text x="512" y="266" font-size="13" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <rect x="592" y="254" width="24" height="24" rx="6" style="fill:var(--color-status-error-bg, #FBE9E7);stroke:var(--color-status-error-border, #A8453A)" stroke-width="0.5"/>
  <text x="604" y="266" font-size="14" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-error-text, #8F382D)">✕</text>

  <line x1="40" y1="284" x2="640" y2="284" style="stroke:var(--color-border-secondary, #C9CDD2)" stroke-width="1"/>

  <text x="40" y="306" font-size="13" font-weight="500" dominant-baseline="central" style="fill:var(--color-text-primary, #1F2933)">Verdict</text>
  <text x="420" y="306" font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">1/1 PASS</text>
  <text x="512" y="306" font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">3/3 PASS</text>
  <text x="604" y="306" font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-status-error-text, #8F382D)">4/5 FAIL</text>

  <text x="40" y="328" font-size="12" dominant-baseline="central" style="fill:var(--color-status-success-text, #2F6B44)">✓</text>
  <text x="58" y="328" font-size="12" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">satisfied</text>
  <text x="150" y="328" font-size="12" dominant-baseline="central" style="fill:var(--color-status-error-text, #8F382D)">✕</text>
  <text x="168" y="328" font-size="12" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">unsatisfied</text>
  <text x="272" y="328" font-size="12" text-anchor="middle" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">–</text>
  <text x="290" y="328" font-size="12" dominant-baseline="central" style="fill:var(--color-text-tertiary, #8A9199)">not in this profile</text>
</svg>
```

## What was built

| File | What it is |
| --- | --- |
| [docs/BLUEPRINT_DEV_TO_PROD.md](sovereign-hdi/docs/BLUEPRINT_DEV_TO_PROD.md) | The blueprint — 1,297 lines / ~13,300 words, in-repo alongside the existing docs |
| [SOVEREIGN-HDI-Development-and-Production-Deployment-Blueprint.docx](SOVEREIGN-HDI-Development-and-Production-Deployment-Blueprint.docx) | Hand-off copy (44 tables, 91 headings) for review or sign-off |
| `sovereign-hdi/scripts/promotion_gate.py` + `make promote ENV=…` | The §7 promotion gates, executable locally instead of only living in `deploy.yml` |

It covers: environment model (E0–E5 with a trust-boundary matrix), a five-class change taxonomy, the CI job map, promotion gates split into automated vs human, three production topologies with first-run acceptance criteria, upgrade/rollback/DR, a verification blueprint with a requirement→test→evidence trace, the bench-validation programme design, operations and incident handling, security and privacy, governance with assurance lanes kept separate, the regulatory boundary, a risk register, and a phased plan.

## Measured, not assumed

Everything in §1 came from a command run today, not from the docs: **165 tests pass** (unit 124 · contract 28 · safety 8 · fuzz 5), the stability sweep is clean over **80,000 iterations** (0 non-finite, 0 out-of-bounds), and the native frame test is **20/20**. I also read the 71-page corpus PDF you attached and mapped it claim-by-claim in §2.2 — including that the corpus's "Calibration → Validation → **Injection**" pipeline is truncated after Validation here, because there is no actuator to inject with.

## Two real defects found by checking rather than reading

1. **`MANIFEST.sha256` had drifted from the tree** — two files were modified after it was generated, while both the CI governance job *and* the prod deploy gate depend on `--check`. A release cut from that tree would have been gated by a check that could not pass. Fixed by regenerating and re-verifying (`MANIFEST: OK`, 139 artefacts), **not** by relaxing the check.
2. **`docs/TESTING.md` claimed "87 tests"** against a measured 165. Corrected in place.

## On the prod gate failing

That `4/5 FAIL` is the finding, not an obstacle. Every engineering gate passes; the only missing control is key custody — no `FW_SIGNING_KEY`, no `MANIFEST.sha256.sig`. So this project can currently produce **test** artefacts, and cannot produce a **production** artefact whose provenance is verifiable. That was previously only implied by a gap in prose; it is now one command. I deliberately did not "fix" it by widening the gate or by inventing a key.

## What I did not claim

The blueprint keeps three rows empty and visible in its traceability matrix — sensor accuracy, battery life, and BLE end-to-end latency are **not measured**. The corpus asserts a "< 50 ms" BLE round-trip; §10.5 does not, because no measurement exists. Section 16 also names the disciplines I considered and did *not* apply, with reasons: clinical-protocol design (prohibited until a regulatory review permits clinical language), ISO 17025/15189 lab-accreditation preparation (a lane error — no lab operates here), and the omics/lab-automation and PK/PD toolchains (no wet-lab or pharmacology component in this system).

## Suggested next step

P0 is closed except one row: decide the `FW_SIGNING_KEY` custody question, or record the decision not to sign. After that, P1 — writing the B1–B4 bench protocols with acceptance criteria and sample sizes fixed *before* data collection — is the critical path, since it converts the largest `CONCEPTUAL_ARCHITECTURE` block into measured fact. I can draft those protocols whenever you want to move on it.