Development and Production Deployment Blueprint

Project: SOVEREIGN HDI — closed-loop, non-invasive biofeedback and physiological state-visualisation platform

Repository version: 2.5.0 (VERSION) · Blueprint revision: 1.0

Date: 2026-09-22 · Classification: Sovereign / Internal

Audience: the engineer who builds it, the operator who deploys it, and the reviewer who must decide whether a claim is supported

Location alignment: Queensland, Australia (AS/NZS electrical and EMC scope)

0. How to read this blueprint

0.1 What this document is

A single document that takes the platform from "a developer has the source tree" to "an operator is

running it in production, with a record that a reviewer can check". It covers environments, the

development loop, CI, promotion gates, production topologies, verification, operations, security,

governance and the regulatory boundary — in that order, because that is the order work happens in.

0.2 The truth declaration, restated (non-negotiable)

This platform **does not cure, treat, regenerate tissue, write data into a nervous system, or modify

cognition.** It senses, estimates a bounded state, displays a cue, and records what it did. It is a

monitoring and visualisation instrument. Every intervention is user-mediated, and there is no actuator

path anywhere in the stack.

A large part of the source concept corpus is fictional or unvalidated. Those parts are not

implemented, not deferred, and not "on the roadmap" — they are excluded, and they are listed in

[LIMITATIONS.md](LIMITATIONS.md) §3 and [CLAIMS_REGISTER.md](CLAIMS_REGISTER.md) §3. Any blueprint

that quietly re-imported them would be worthless, because the same document would then be unsafe to

act on.

0.3 Evidence labels

Every statement in this blueprint about system behaviour carries one of the labels defined in

[EVIDENCE_LABELS.md](EVIDENCE_LABELS.md):

Label

Meaning

IMPLEMENTED_AND_TESTED

Code exists, an automated test exercises it, and the test passes on a clean checkout

SIMULATED

Runs over synthetic or recorded inputs; not connected to a biological subject or certified device

CONCEPTUAL_ARCHITECTURE

Interfaces and responsibilities are specified; hardware or provider validation is incomplete

RESEARCH_HYPOTHESIS

A claim awaiting experimental validation — not a capability

FICTIONAL_VISUALISATION

Communicative imagery or narrative; asserts nothing

Where this blueprint states a number, §1 gives the command that produced it and the observed output.

Where a number is a target, it is called a target. Where a value has never been measured, it says

not measured and points at [LIMITATIONS.md](LIMITATIONS.md) §4.

0.4 The three questions this document answers

Can the engineering be built, tested and released reproducibly? — Yes. Answerable here, with

commands and test output.

Can it be deployed and operated safely by one person on their own hardware? — Yes, within the

physical safety envelope in §8 and §10, most of which is not automatable.

Is it lawful to supply as a medical device, or proven safe for a person? — **Not answerable

here.** That needs accredited testing, clinical evidence, a responsible legal entity and a

regulatory determination. §13 states exactly where that boundary sits.

1. Verified baseline — what is actually true today

This section is the foundation of everything downstream. It is a record of executed checks, not a

description of intent. All results below were produced on 2026-09-22 against the working tree at

version 2.5.0.

1.1 Executed verification results

#

Check

Command

Observed result

Label

V1

Python test suite

cd software && python -m pytest ../tests -q

165 passed, 2 warnings, 2.29 s (Python 3.12)

IMPLEMENTED_AND_TESTED

V2

Suite breakdown

pytest ../tests/<suite> --collect-only

unit 124 · contract 28 · safety 8 · fuzz 5

IMPLEMENTED_AND_TESTED

V3

Numerical stability sweep

python scripts/verify_stability.py --steps 20000

STABILITY: PASS — 80 000 iterations over 4 regimes, 0 non-finite, 0 out-of-bounds, 4 315.9 ms, backend numpy

IMPLEMENTED_AND_TESTED

V4

Firmware framing (host-native)

gcc … test/native_frame_test.c src/crc16.c src/protocol.c && ./frame_test

PASS: 20 checks, 0 failures

IMPLEMENTED_AND_TESTED

V5

Frozen configuration

config/default_model.json

model_version = prometheus-2.5.0, param_version = params-2026-09-22-d

IMPLEMENTED_AND_TESTED

V6

Evidence manifest

python scripts/gen_evidence_manifest.py --check

MISMATCH at review start (137 entries, 2 files changed, §1.3) → `MANIFEST: OK` after regeneration (139 entries)

IMPLEMENTED_AND_TESTED

V7

Promotion gate — dev, test

python scripts/promotion_gate.py --env dev / --env test

PASS — dev 1/1 automatable gates; test 3/3 (165 tests, STABILITY: PASS, 20/20 framing checks)

IMPLEMENTED_AND_TESTED

V8

Promotion gate — prod

python scripts/promotion_gate.py --env prod

FAIL (4/5) — every gate passes except artefact signing: no FW_SIGNING_KEY, no MANIFEST.sha256.sig (§1.5)

—

The two warnings are third-party deprecation notices raised by starlette/fastapi test tooling

(httpx2 migration, anyio BlockingPortal alias). They are not produced by this codebase and do

not affect the assertions.

V3 detail, per regime (each 20 000 steps ≈ 0.556 h equivalent at 10 Hz):

regime            steps  non-finite  out-of-bounds  input-faults  result
nominal           20000           0              0             2  PASS
zero              20000           0              0             2  PASS
saturating        20000           0              0             2  PASS
adversarial       20000           0              0             2  PASS

The 2 input-faults per regime are injected by the sweep's own input generator (deliberate

NaN/out-of-range probes); they confirm the fail-closed path is exercised rather than describing a

defect.

1.2 What this baseline proves, and what it does not

Proven: the numerical core is bounded and finite under four input regimes; the governor's

fail-closed ordering holds; the frame contract is identical in C and Python; the audit chain detects

edits, deletions and reordering; ingest is idempotent; raw biosignals have no egress path; the hub is

loopback-only unless a token is configured.

Not proven, and not implied: that any state channel corresponds to a physiological quantity; that

the governor prevents a physiological event; that the firmware works on hardware; that sensor

accuracy, battery life, BLE latency, thermal behaviour or EMC have any measured value. Those are

SIMULATED / CONCEPTUAL_ARCHITECTURE / not measured, and §9.3 and §15 are the plan to change

that.

1.3 Defect found while preparing this blueprint

gen_evidence_manifest.py --check reports MISMATCH on a clean tree, on two files:

CHANGED: scripts/gen_evidence_manifest.py
CHANGED: tools/package_release.sh

Cause: both files were modified after MANIFEST.sha256 was last generated (manifest timestamp

2026-09-22T07:24:58Z; the release script's mtime is 07:25Z). The consequence is material: the CI

governance job and the deploy workflow's prod gate both run --check, so **a release cut from

this tree would fail the manifest gate, or worse, pass only because the gate was skipped.**

Resolution: this is exactly the failure mode the manifest exists to catch, so it is fixed by

regeneration as part of the change that adds this blueprint (§1.4), not by weakening the check. The

general rule — regenerate, never hand-edit, and never relax the gate — is in

[../evidence/README.md](../evidence/README.md), rule 3.

1.4 Reconciliation record

Item

Action taken

Verified by

Manifest drift on 2 tracked files

MANIFEST.sha256 and EVIDENCE.json regenerated; --check re-run to OK

§15 P0 acceptance

Source corpus added to the tree during preparation

Removed from the repository and held outside it (sources/ in the parent workspace). [audit/README.md](audit/README.md) states the corpus is deliberately not redistributed; keeping it in-tree would also have added ~1 MB of binary to every evidence manifest

--check entry count returns to 137 + this release's additions

docs/TESTING.md stated "87 tests"; measured total is 165

Corrected in this change — the nominal count is replaced by the measured figure, its breakdown, and the date it was measured

V1/V2

1.5 Finding: production promotion is currently blocked, by design

Running the gate for the production profile (§7) produces:

[PASS] python suites            165 passed, 2 warnings in 2.37s
[PASS] numerical stability      STABILITY: PASS
[PASS] frame contract (native)  PASS: 20 checks, 0 failures
[PASS] evidence manifest        MANIFEST: OK
[FAIL] artefact signing         no FW_SIGNING_KEY and no MANIFEST.sha256.sig — artefacts
                                would be UNSIGNED
verdict: FAIL (4/5 automatable gates satisfied)

This is the correct outcome and it should be reported as a finding rather than worked around.

Every engineering gate passes; the one missing control is key custody, which is an organisational

decision (who holds the key, where, with what rotation and revocation policy) and not something a

script may invent. Until FW_SIGNING_KEY is configured and its custody documented, this project can

produce test artefacts and cannot produce a production artefact whose provenance is verifiable.

That is precisely the distinction G6 in §13.3 records, now measurable in one command.

2. Scope: from the source corpus to the implemented system

2.1 What the corpus actually asks for

The supplied compendium (⚡️Digital-Human (1).pdf, 71 pages) is a set of essays that converge on one

architecture in two very different registers. The engineering-register material proposes: a tiered

edge/host stack (OMNIROOT), a state-space recovery model (PROMETHEUS) with a saturation term, a

"Safety Governor" that bounds it, biofeedback modalities (HRV, EDA), and an edge-compute + PWA

deployment. The speculative-register material proposes: cortical "firmware injection", STDP-based

writing of digital code into synapses, neural data storage / synthetic engrams, "Bio-OS" and genomic

identity handshakes, and a three-phase "Calibration → Validation → Injection" deployment pipeline.

Only the first register is implementable, and only part of it is good enough to ship.

2.2 Boundary register — corpus claim to repository decision

Corpus proposal

Repository decision

Where it is recorded

Bounded non-linear state-space model with saturation (tanh)

Implemented, with three dimensional/logic corrections

§3.3, ARCHITECTURE.md §3.1, CHANGELOG.md

Frozen, versioned model parameters

Implemented — config/default_model.json, no RNG in production paths

V5

Tiered edge/host/presentation stack

Implemented as OMNIROOT / PROMETHEUS / Safety Governor + hub + PWA

§3

Biofeedback modalities (HRV from PPG, EDA)

Implemented in the software tier; hardware paths CONCEPTUAL_ARCHITECTURE

V4, EVIDENCE_LABELS.md

Edge compute + local-first PWA

Implemented; no cloud dependency on any code path

§8.3, §11

"Safety Governor" prevents excitotoxicity / cognitive dissonance

Reframed and bounded: a numerical and state gate on software output, not a safeguard

SAFETY.md §1

Deployment pipeline "Calibration → Validation → Injection"

Truncated after Validation. Calibration and validation are implemented; there is no injection phase and no actuator to inject with

§8, SAFETY.md §3

Cortical firmware injection / STDP stimulation / neural code upload

Excluded. Not implemented, not deferred

LIMITATIONS.md §3, CLAIMS_REGISTER.md §3

Neural data storage, synthetic engrams, synaptic addressing

Excluded

LIMITATIONS.md §3

Genomic "handshake", genotype→connectome causality, biometric identity mapping

Excluded; the diagnostic fixtures in the corpus were toy values, not associations

LIMITATIONS.md §3

Hard-coded "100% applicable" / "cure" style efficacy figures

Prohibited. A CI lint fails the build if such a claim enters the source

CLAIMS_REGISTER.md §3, .github/workflows/ci.yml

Named components with no implementation ("Quantum Optimizer", "Neuro-Link v3.2")

Treated as UI text; no mapping to code

EVIDENCE_LABELS.md rule 4

2.3 Why the boundary is a build constraint, not a note

The excluded column is enforced, not merely documented:

By absence. No actuator module, no stimulation waveform, no current source, no GPIO drive

(CLAIMS_REGISTER.md C18 — asserted by review of firmware/, which is a single-writer path).

By lint. CI fails on the tokens cures?, treats? disease, regenerat(e|es) tissue,

medical device certified, clinically validated in software/ and dashboard/src.

By the claims register. Every user-visible claim maps to a label and an artefact; promotion

requires evidence, and regression demotes the claim with a date.

By the standing rule in audit/README.md: anything transplanted from the corpus must arrive

with its audit classification intact.

That is the mechanism by which "we chose not to build the fiction" survives contact with future

contributors, a rebrand, or a pitch deck.

3. System blueprint

3.1 The three tiers

Tier

Component

Repository path

Role

Evidence label

1

OMNIROOT

firmware/esp32-omniroot/

Sensor acquisition, framed transport

CONCEPTUAL_ARCHITECTURE (framing/CRC are IMPLEMENTED_AND_TESTED; sensor paths are not bench-validated)

2

PROMETHEUS

software/sovereign_hdi/prometheus_engine.py

Bounded non-linear state estimate

IMPLEMENTED_AND_TESTED (mechanism) / SIMULATED (physiological meaning)

3

Safety Governor

software/sovereign_hdi/safety_governor.py

Numerical and state gate over software output

IMPLEMENTED_AND_TESTED

3

Hub + PWA

software/sovereign_hdi/api/, dashboard/

Local HTTP/WS surface, visualisation, audit

IMPLEMENTED_AND_TESTED

3.2 Promotion and runtime flow

flowchart TD
    DEV["Developer workstation<br/>edit · test · simulate"] --> CI["CI<br/>165 tests · stability · framing · build · governance lint"]
    CI --> DEVART["dev artefact<br/>unsigned · local only"]
    DEVART --> TEST["Test / bench environment<br/>full gate + parity + bench checklist"]
    TEST --> BENCH{"Bench validation<br/>manual, non-automatable"}
    BENCH -->|"recorded results"| PROD["Production<br/>signed artefact · topology A, B or C"]
    BENCH -->|"not performed"| BLOCK["Promotion blocked<br/>artefact stays TEST-labelled"]
    PROD --> AUDIT["Audit log + evidence manifest<br/>hash-chained, reviewable"]
    PROD -.->|"rollback: previous tag"| PROD

3.3 The state model, as shipped

x(n+1) = clip( A·(x(n) − x_ref) + x_ref + B·u(n) + E·z(n) + b − h ⊙ tanh( x(n) ⊘ d_thresh ) )

x ∈ [0,1]⁵ = [damage, inflammation, stress, fatigue, reserve]; u = user-mediated control;

z = normalised sensor deviation; clip = per-channel hard bound. Parameters are frozen in

config/default_model.json and validated on load — including a rejection rule: any A whose

spectral radius is ≥ 1.0 is refused. The shipped A has a spectral radius of ≈ 0.975 (measured;

ARCHITECTURE.md §3.1, CHANGELOG.md deviation 3).

Three deliberate departures from the corpus specification — B dimension, decay target, and

cross-channel coupling plus sensor_gain — are recorded in ARCHITECTURE.md §3.1, in the config's

own provenance.deviations_from_source_spec, and in CHANGELOG.md. A reviewer comparing this

implementation with the source narrative will find the differences stated rather than hidden.

3.4 Data plane — the three contracts

Contract

Form

Authority

Rules that matter operationally

omniroot.frame.v1

34-byte little-endian binary

include/protocol.h, omniroot_client.py

Invalid is `NaN`, never `0`. Corrupt frames are discarded, never repaired; crc_errors and resyncs are counted. Frame size asserted in both languages. One-way: no command channel.

telemetry.v1

JSON envelope

telemetry_schema.py

Enforceable requiredness, controlled unit vocabulary, UTC-offset timestamps, SHA3-256 evidence seal over canonical bytes (hdi-jcs-1).

Published state frame

JSON over HTTP/WS

api/app.py

Every frame carries model_version, param_version and provenance.evidence_label.

Full field-level detail: [DATA_CONTRACT.md](DATA_CONTRACT.md).

3.5 Trust boundary

The host is trusted; the network is not. Frames arriving from a node are validated for framing,

CRC, channel ranges, sequence window and capture age before use. **Nothing from a node can set a

control value** — control is accepted only through the authenticated POST /api/v1/control endpoint,

which a human calls. There is no optimiser, no learned policy, and no automatic feedback loop that

writes to u (SAFETY.md §3, item 4). If that ever changes it is a different governance model, not a

feature branch.

4. Environment model

4.1 The five environments

Env

Name

Where it runs

Purpose

E0

Workstation

Developer's own machine

Edit, unit-test, simulate, read the diff

E1

Dev

CI (develop branch)

Integrate; unit gate only

E2

Test / bench

CI (release/**) + a physical bench

Full gate, parity, firmware build, bench checklist

E3

Prod-edge

ESP32-S3 node + Samsung A17 (Termux), loopback hub, local PWA

Primary sovereign deployment — nothing leaves the device

E4

Prod-host

Linux host / NAS / VPS: container or systemd, audit log on a volume

Multi-client local use behind a bearer token

E5

Prod-static

Any static host serving dashboard/dist

Demonstration, evaluation, design review

4.2 Environment matrix

Attribute

E0 workstation

E1 dev

E2 test/bench

E3 prod-edge

E4 prod-host

E5 prod-static

Data mode (HDI_DATA_MODE)

simulated

simulated

simulated (bench: live when sensing)

live

live

simulated

Exposure

loopback

none

loopback

loopback only

loopback or LAN + token + TLS proxy

public static files

Gate applied

none (author's discretion)

unit

full suite + stability + framing + parity

full gate + bench checklist + signed artefact

full gate + signed artefact

full gate

Artefact

working tree

unsigned build

unsigned build + bench record

signed release ZIP

signed release ZIP

dashboard/dist

Evidence produced

test output

CI log + JUnit XML

CI log + stability-*.json + bench-*.md

audit log + session record

audit log + backup

none (no telemetry)

Auth

none

none

none

none needed (loopback)

HDI_API_TOKEN required if non-loopback

n/a

Person exposed to hardware

no

no

yes (bench)

yes

no

no

Hard rule spanning E2/E3: never operate the node while it is connected to a mains-powered supply.

Battery-powered SELV operation is the primary electrical-safety control this design has

(SAFETY.md §5, compliance/AU_ELECTRICAL_EMC.md §2). No CI job can enforce this — it is a

documented human control, which is why it is repeated in every promotion checklist.

4.3 Why there is no cloud environment

There is deliberately no staging cluster, no managed queue, no remote telemetry sink. The reference

implementation has no outbound network call on any code path; the container image carries no cloud

SDK and the systemd unit sets IPAddressAllow=localhost / IPAddressDeny=any. Adding an environment

is therefore not "more mature" — it would falsify the data-sovereignty claim in §11. If a future

change adds an outbound dependency, it must be declared in README.md, in DEPLOYMENT.md and in the

docker-compose.yml comment block that currently states the opposite, in the same change.

5. Development blueprint

5.1 Toolchain and versions

Component

Requirement

Verified in this workspace

Python

3.11+ (3.12 tested)

3.12

NumPy

optional — pure-stdlib algebra fallback must agree to 1e-12

present (stability.py reports backend numpy)

FastAPI / uvicorn / pydantic / httpx / pytest

software[dev,api] extras

present

Node.js

20+ (dashboard only)

per CI node-version: "20"

C compiler

any C11 compiler (host framing test)

gcc — V4 passes

ESP-IDF

release-v5.2 container, or PlatformIO

not exercised locally; CI builds it

5.2 Repository and branch model

Branch

Maps to

Automation

Promotion authority

develop

E1 dev

ci.yml (all jobs) + deploy.yml classify → dev (unit gate)

automatic

release/**

E2 test

ci.yml + deploy.yml classify → test (full gate)

automatic on green

main

Prod

deploy.yml classify → prod (full + signed gate, fails without FW_SIGNING_KEY)

automatic on green

v* tag

Release

release.yml — full suite, packaging, manifest, optional signature, draft GitHub release

tag push (human act)

feature branches / PRs

—

ci.yml runs; no deploy

PR review

Branch classification is code, not convention — .github/workflows/deploy.yml reads

github.ref_name and picks the gate. workflow_dispatch allows a manual dev|test|prod selection.

5.3 Change taxonomy — what a change obliges you to do

Most process documents fail because they treat every change the same. This one classifies changes by

what they can invalidate.

Class

Trigger

Mandatory actions

Deciding artefact

A — Frame/protocol

Any change to omniroot.frame.v1 layout, CRC, or the host parser

Run native C test and on-target test; bump FRAME_VERSION; change both ends in one commit

native_frame_test.c, test_frame_protocol.py

B — Model parameters

Any change to config/default_model.json (including governor thresholds)

Bump param_version; record the reason in CHANGELOG.md; state the criterion the new value satisfies

test_config.py, verify_stability.py

C — Coverage regression

A test removed or weakened

Demote the corresponding claim in `CLAIMS_REGISTER.md` in the same change, with a date

CLAIMS_REGISTER.md

D — Claim or UI text

Any new user-visible claim, status badge, or label

Add with label RESEARCH_HYPOTHESIS and no evidence; promote only when an artefact exists; keep the prohibited-claims list intact

CLAIMS_REGISTER.md, CI lint

E — Egress

Any new network dependency, exporter, or third-party service

Declare it in README.md, DEPLOYMENT.md and the compose/env comments; re-review §11

CI secret lint, review

Class B deserves emphasis: parameter changes are behavioural changes. Telemetry recorded

under different param_version values is not directly comparable, which is exactly why the version

travels on every frame. That field is not decoration; it is the mechanism that keeps past evidence

interpretable.

5.4 Definition of Done

A change is done when all of the following hold:

cd software && python -m pytest ../tests -q — full suite green, **no skipped safety or contract

tests** (CI fails outright on a skip in the safety suite).

python scripts/verify_stability.py --steps 20000 — passed: true.

Class-specific obligations (§5.3) satisfied.

python scripts/gen_evidence_manifest.py --check — `MANIFEST: OK` (see §1.3 for what happens

when this is skipped).

dashboard builds, and no external font/stylesheet reference is introduced (hard gate — the bundle

must render with no network).

If firmware changed: native framing test passes (V4).

If a claim changed: CLAIMS_REGISTER.md updated in the same change.

Anything unverified is stated as unverified in the PR description. "Tests pass" is not

"hardware works".

5.5 The local development loop

# --- one-time ---
make install                     # python -m pip install -e "software[dev,api]"

# --- inner loop ---
make test-fast                   # unit tests only (fast)
make simulate                    # offline SIMULATED session, writes var/audit-*.ndjson
make model-card                  # print the frozen configuration + provenance
make serve                       # hub on 127.0.0.1:8077, loopback only
make dashboard                   # Vite dev server on :5173

# --- before requesting review ---
make verify                      # test + stability + dashboard-build + firmware-test + manifest
python scripts/gen_evidence_manifest.py --check

# End-to-end smoke test of the whole path: ingest → engine → governor → publish → audit → seal
HDI_DATA_MODE=simulated HDI_DATA_DIR=./var uvicorn sovereign_hdi.api.app:app --port 8077 &
curl -s localhost:8077/api/health
for i in $(seq 1 20); do curl -s -X POST localhost:8077/api/v1/tick > /dev/null; done
curl -s localhost:8077/api/v1/status | python -m json.tool | head -30
curl -s localhost:8077/api/v1/export/json \
  | python -c "import json,sys; print(json.load(sys.stdin)['payload']['contains_raw_biosignals'])"
cd software && python -m sovereign_hdi seal-check ../var/audit-$(date -u +%Y%m%d).ndjson

This is the recommended smoke test after any change (OPERATIONS.md §5).

5.6 Test architecture and coverage map

Suite

Count

What it proves

Location

unit/

124

Engine bounds, fail-closed faults, governor ordering, config validation, linalg equivalence, calibration, frame protocol, telemetry schema (19 negative cases), audit chain, deterministic replay

tests/unit/

contract/

28

Ingest contract (stored/duplicate/quarantined/rejected), API surface, acknowledgements, JS↔Python engine parity

tests/contract/

safety/

8

Fail-safe cutout, bounds under adversarial input (5 000 steps)

tests/safety/

fuzz/

5

Four-regime stability sweep, structured-garbage inputs

tests/fuzz/

Firmware (native)

20 checks

Frame layout, shared CRC vector (CRC("123456789") == 0x29B1), round-trip, corruption rejection

firmware/.../test/native_frame_test.c

Firmware (on target)

—

Same vectors under the target toolchain/ABI

idf.py -T test build

Dashboard

—

Production build + no-external-asset gate + cross-runtime parity

dashboard/, parity_runner.mjs

Total measured: 165 Python tests (§1.1, V1/V2). Note that [TESTING.md](TESTING.md) states "87

tests" — that figure is stale. The count is deliberately recorded as a measurement in the CI log

rather than asserted in a document, precisely so it cannot drift like this; §15 P0 corrects the

number.

What the tests deliberately do not do (TESTING.md §4): validate physiology, measure hardware,

certify safety, or exercise real transports. A green suite is evidence about arithmetic and data

integrity. It is not evidence about a person.

5.7 Evidence discipline as executable guards

The governance rules in §2.3 are implemented as CI steps, so they cannot be forgotten under deadline

pressure:

Guard

Mechanism

Failure mode

Manifest coverage

gen_evidence_manifest.py --quiet && --check

Error — tree does not match the recorded hashes

No committed secrets

regex scan for HDI_API_TOKEN / FW_SIGNING_KEY assigned a 16+ char literal

Error

Prohibited claims

regex scan for cure/treat/regenerate/certified/validated tokens in software/ + dashboard/src, excluding negations

Error

Evidence labels declared

every software/sovereign_hdi/**.py and firmware/**/*.c mentions an evidence label

Warning (advisory)

Safety tests not skipped

pytest ../tests/safety -q -rs output grepped for "skipped"

Error — a skip is not acceptance evidence

No external assets

grep for fonts.googleapis.com / @import url( in dashboard/dist and dashboard/src

Error

Two of these are worth copying into any similar project: the skip detector (a green pipeline that

silently skipped its safety suite is worse than a red one) and the prohibited-claim lint (it makes

a marketing regression a build failure instead of a review comment).

6. CI blueprint

6.1 Job map — .github/workflows/ci.yml

Runs on every push (all branches) and every pull request. **The job names are the acceptance

criteria:** a release claim may only reference a suite that is green here.

Job

Matrix

Steps that matter

Artefact

Failure semantics

software

Python 3.11, 3.12

install software[dev,api] → unit+contract+safety+fuzz (JUnit XML) → re-run safety+contract with -rs → stability sweep (--steps 20000, JSON) → skip detector on the safety suite → JS engine parity test

reports-pytest-<ver>.xml, stability.json

Any test failure fails the build; a skipped safety test also fails

firmware

—

host-native framing test (real protocol.c/crc16.c) → ESP-IDF release-v5.2 container build → upload .bin → explicitly warn that artefacts are UNSIGNED when `FW_SIGNING_KEY` is unset

omniroot-firmware (build/*.bin)

Native test is cheap and decisive, so it runs before the container build

dashboard

Node 20

npm install → npm run build → no-external-asset gate → parity_runner.mjs engine parity

dashboard-dist (if-no-files-found: error)

A blank or network-dependent bundle fails the build

governance

—

evidence-label check (advisory) → manifest coverage (--check) → secret scan → prohibited-claim lint

none

Manifest mismatch, secret, and prohibited claim are all hard errors

The Python matrix is fail-fast: false — both versions report, so a 3.11-only regression is

distinguishable from a general one.

6.2 Design choices worth preserving

The cheapest decisive check runs first. Firmware framing is checked with a host gcc before

spending a container build; the safety skip detector runs immediately after the test step.

Unsigned is stated, never implied away. The firmware job emits a warning and the release notes

print Manifest signature: false. An artefact that looks verified but is not is the specific

failure this guards against.

Artifacts are always uploaded, including on failure (if: always() on the reports), so a

reviewer can see the failing state rather than a bare "failed".

No deploy step hides in CI. All environment logic lives in deploy.yml, so "what does a merge

to main do?" has exactly one answer.

7. Promotion blueprint — dev → test → prod

7.1 Gate definition — .github/workflows/deploy.yml


dev

test

prod

Trigger

push develop, or manual

push release/**, or manual

push main, or manual

Gate name

unit

full

full+signed

Unit tests

required

required

required

Safety + contract + fuzz

—

required

required

Numerical stability

—

required (--steps 20000)

required

Frame contract, both runtimes

—

required (native C)

required

Evidence manifest matches tree

—

—

required

FW_SIGNING_KEY present

—

—

required — refuses to promote without it

Artefacts built

—

firmware + dashboard + release ZIP

same, signed

Bench checklist reminder

—

shown

shown

The prod gate has one behaviour that is unusual and deliberate: it hard-fails when the signing key

is absent rather than warning. The rationale is that a production artefact whose provenance cannot be

verified is not an artefact worth promoting, and a warning would eventually be ignored.

7.2 Automated vs human gates

Segregating these is what keeps the pipeline honest. CI cannot verify a physical safety control, and

pretending otherwise is how a checklist becomes theatre.

Gate

Type

Who/what decides

Evidence produced

Suite, stability, framing, parity, manifest

Automated

CI

CI log, JUnit XML, stability.json

Artefact signing

Automated (given a key)

CI

SHA256SUMS.sig, MANIFEST.sha256.sig

No prohibited claims / secrets

Automated

CI lint

CI log

Node runs on battery only while electrodes attached

Human

Operator

Session log entry

Native frame test + boot self-test observed on the bench

Human

Operator

Bench record

Electrical/EMC checklist §2 complete

Human

Competent person

compliance/AU_ELECTRICAL_EMC.md annotated

Firmware hash + `param_version` recorded in the session log

Human

Operator

Session log

Sensor accuracy, battery life, BLE latency, thermal

Human + instrument

Bench programme

bench-*.md (§9.3)

Regulatory / intended-use review

Human, external

Regulatory professional

§13

The five human gates above are printed verbatim by the bench-checklist job on every non-dev

promotion, so they appear in the log of the run that produced the artefact.

7.3 Release assembly — release.yml

Triggered by a v* tag. Sequence:

Tag/VERSION agreement — VERSION must equal the tag; otherwise fail.

Full verification — entire tests/ tree + stability --steps 50000.

Firmware native test + dashboard production build.

Package — tools/package_release.sh produces

release/sovereign-hdi-<version>-<UTCstamp>.zip, containing full source, the built dashboard

bundle (so an operator needs no Node toolchain), MANIFEST.sha256, EVIDENCE.json, and a

VERIFICATION.txt stating plainly what was and was not verified. It excludes node_modules,

Python caches, the audit log, .env files and git metadata, and refuses a dirty tree unless

--allow-dirty is passed explicitly.

Manifest + optional signature — SHA-256 manifest always; SHA3-256 signature only if a key

exists, and the step records signed=true|false.

Release notes are generated with a **Verification status table that includes the negative

rows — "Firmware hardware validation: not performed", "Sensor accuracy: not measured**",

"EMC / electrical safety test: not performed" — followed by the statement that nothing here is

a medical device or a regulatory approval.

The GitHub release is created as a draft, so publishing remains a human act.

7.4 Promotion failure and rollback

Situation

Action

Gate fails in dev/test

Fix forward. Nothing is deployed; the artefact was never produced.

Prod gate fails on signing

Configure FW_SIGNING_KEY (a human decision about key custody), or release as an explicitly unsigned test artefact. Do not remove the check.

Regression found after promotion

git checkout <previous-tag>, reinstall, restart the service (DEPLOYMENT.md §6).

Manifest mismatch after promotion

Treat as a release blocker, not a documentation issue. Regenerate from the tagged commit and re-verify; if the tagged tree cannot be reproduced, the release is withdrawn.

The audit log is append-only and forward-compatible (older code ignores unknown keys), so a rollback

never invalidates previously recorded evidence. That property is why rollback is cheap here and why

the log must never be edited.

8. Production deployment blueprint

Three supported topologies. Choose by trust boundary, not by convenience.


A. Edge + phone gateway

B. Containerised / systemd host

C. Static PWA only

Use when

Primary sovereign deployment; no cloud; single person

A workstation/NAS runs the hub; multiple local clients

Demonstration, evaluation, design review

Trust boundary

Node (BLE) → phone (loopback hub + local PWA). Nothing leaves the device

LAN + bearer token; TLS behind a reverse proxy

Browser only; SIMULATED; no telemetry at all

Data mode

live

live

simulated

Audit log

On the phone, encrypted storage

Named volume / ReadWritePaths

none

8.1 Topology A — ESP32-S3 node + Samsung A17 gateway (E3)

Prerequisites (all human): bench checklist complete; node on battery while electrodes are

attached; BLE frame integrity confirmed; session log open.

# 1 — flash the node (LAB BENCH ONLY for the first flash)
cd firmware/esp32-omniroot
pio run -e esp32-s3
pio run -e esp32-s3 -t upload
pio device monitor -b 921600
#   expect: "monitoring-only firmware: no stimulation or actuation path exists"
#           "self test passed (frame size 34 bytes)"
#           four probe results, then "advertising as OMNIROOT-XXXX"

# 2 — start the gateway on the phone (Termux, F-Droid build; the Play Store build is deprecated)
bash services/termux/install.sh
termux-services restart sovereign-hdi
tail -f $PREFIX/var/log/sv/sovereign-hdi/current

install.sh installs python, best-effort numpy/uvicorn, writes the service definition under

$PREFIX/var/service/, and creates ~/sovereign-hdi/{var,config}. It deliberately does not open a

firewall port, does not install from any source other than the Termux repository, and does not enable

remote access. The hub binds 127.0.0.1:8077 — reachable only from the phone itself.

# 3 — build and serve the dashboard from the same origin (removes the CORS question entirely)
cd dashboard && npm ci && npm run build
HDI_STATIC_DIR=$PWD/dist uvicorn sovereign_hdi.api.app:app --host 127.0.0.1 --port 8077
#   open http://127.0.0.1:8077 on the phone, then "Add to Home screen"

Why same-origin matters: serving the built PWA from the hub's own process keeps the whole system

on loopback. That is the strongest configuration available, and it removes bearer-token handling from

the browser entirely.

First-run acceptance for A — all five must hold before the first session with a person:

#

Check

How

A1

Boot self-test line observed

pio device monitor

A2

frames_decoded increases, crc_errors == 0 on the host

/api/v1/status

A3

Values move plausibly with a finger on the PPG sensor

dashboard, live mode

A4

Node on battery, not mains-derived supply

physical inspection

A5

data_mode reads LIVE, not SIMULATED

/api/health

8.2 Topology B — containerised or systemd host (E4)

Compose (recommended):

cd deploy/docker
cp .env.example .env          # set HDI_API_TOKEN to a long random value
docker compose up -d --build
docker compose exec hub python -m sovereign_hdi model-card
curl -s -H "Authorization: Bearer $HDI_API_TOKEN" localhost:8077/api/v1/status | head

Generate the token with

python -c "import secrets; print(secrets.token_urlsafe(48))".

Hardening already implemented in deploy/docker/docker-compose.yml:

read_only: true root filesystem, with the audit log on a writable ./data volume, plus a

tmpfs /tmp (32 MB, mode=1777);

cap_drop: ALL, security_opt: no-new-privileges:true, no host network, no privileged mode, no

Docker socket;

published on 127.0.0.1:8077 by default — reaching it from another host requires changing the

bind and setting HDI_API_TOKEN, because the entrypoint refuses to start otherwise;

resource limits (1 CPU / 512 MB) and a bounded json-file log driver (10 MB × 3);

healthcheck against the open /api/health probe only, which never exposes data;

non-root container user with fixed UID 10001, so a bind-mounted data directory has predictable

ownership.

systemd alternative (deploy/systemd/sovereign-hdi.service,

label CONCEPTUAL_ARCHITECTURE — reviewed by inspection, not executed on a host in this repository):

unprivileged dedicated user, ProtectSystem=strict with a single ReadWritePaths=/var/lib/sovereign-hdi,

NoNewPrivileges, PrivateTmp/Devices/Home, MemoryDenyWriteExecute, SystemCallFilter=@system-service,

UMask=0077, and IPAddressAllow=localhost / IPAddressDeny=any. It touches nothing on

ExecStartPre except printing model-card, which makes the frozen configuration part of the journal

of every start.

sudo install -m 644 deploy/systemd/sovereign-hdi.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now sovereign-hdi

TLS: the hub does not implement TLS and must not be exposed directly to an untrusted network.

Terminate TLS in a reverse proxy, or reach it through an authenticated tunnel.

Fail-fast behaviour (keep this): deploy/docker/entrypoint.sh exits 78 if either (a) the data

directory is not writable — "a hub that silently drops its evidence record is worse than one that

refuses to start" — or (b) a non-loopback bind is requested without a token. Both are configurations

where continuing would quietly produce a system that looks fine and is not.

8.3 Topology C — static PWA (E5)

cd dashboard && npm ci && npm run build     # → dist/
# copy dist/ to any static host

Runs entirely in-browser in SIMULATED mode with a persistent DEMO / SIMULATED banner; **no

telemetry leaves the device**. Nothing is recorded, so topology C produces no evidence — it is for

design review and evaluation, and must never be presented as a measurement session.

8.4 Configuration and secrets

Variable

Default

Meaning

Prod requirement

HDI_API_TOKEN

(unset)

Bearer token. Unset ⇒ loopback-only mode

Required for any non-loopback bind

HDI_DATA_MODE

simulated

simulated or live; drives the provenance label

Set live only when actually sensing

HDI_ENGINE_HZ

10

State-update rate, 1–200

10 (matches the 100 ms node cadence)

HDI_ENGINE_AUTOSTART

1

0 exposes manual POST /api/v1/tick

0 for scripted/deterministic runs

HDI_DATA_DIR

./var

Audit-log directory (NDJSON)

Encrypted volume; never read-only

HDI_SIM_SEED

7

Seed for the simulated source

Fixed, so demos are reproducible

HDI_CORS_ORIGINS

(unset)

Comma-separated allow-list; unset ⇒ no CORS headers

Leave unset when serving the PWA same-origin

HDI_STATIC_DIR

(unset)

Built dashboard to serve at /

Set for topology A / single-process B

HDI_MODEL_CONFIG

config/default_model.json

Alternative model configuration

Leave default unless Class B change

Secrets policy: FW_SIGNING_KEY is never committed (CI scans for it). HDI_API_TOKEN lives in

.env (git-ignored) or an EnvironmentFile with mode 600 — never in the unit file, never in the

image. The hub writes no secrets and makes no outbound calls.

CORS/token consistency rule: setting HDI_API_TOKEN requires the same protection on the

WebSocket (?token= or, preferably, the Authorization header). A token that guards the REST surface

and not the stream is a partial control, and partial controls are how a system acquires a reputation

it has not earned.

8.5 Upgrade, rollback, backup, disaster recovery

Upgrade procedure (any topology):

# 1 — verify the artefact you are installing
sha256sum -c MANIFEST.sha256
cat CHANGELOG.md                       # check for PARTIAL entries and Class B changes
# 2 — back up the audit log: it is the evidence record, not a cache
cp -a var/audit-*.ndjson /backup/
# 3 — update
git fetch --tags && git checkout v2.5.0
cd software && python -m pip install -e ".[api]"
# 4 — re-run the safety-relevant suites BEFORE restarting the service
python -m pytest ../tests/safety ../tests/contract -q
python -m sovereign_hdi verify --steps 20000
# 5 — restart and confirm
termux-services restart sovereign-hdi     # or: docker compose up -d --build
curl -s localhost:8077/api/health

Parameter changes are behavioural changes. If param_version differs after an upgrade, telemetry

produced before and after is not directly comparable. See §5.3 Class B.

Concern

Procedure

Note

Rollback

git checkout <previous-tag> → reinstall → restart

Audit log is append-only and forward-compatible, so rollback never invalidates recorded evidence

Backup

tar -czf sovereign-hdi-var-$(date +%F).tgz var/

The audit log is the evidence; never edit it

Retention

30 days raw log, aggregates retained indefinitely

Placeholder policy, not an approved schedule (OPERATIONS.md §3)

Media handling

Encrypt at rest on removable media

The log contains pseudonymous identifiers and state estimates

Loss of the log

Recorded sessions cannot be re-verified; chain verification is impossible for those sessions

Export aggregates before any deletion (GET /api/v1/export/json)

Uninstall

Stop and remove the service unit; ls var/ and inspect before deleting

Deleting the log removes the ability to verify past sessions

There is no off-site replication by design, because there is no cloud dependency. That is a

sovereignty strength and an availability weakness, and both should be stated in the same breath: **DR

here means "you have the backup file you made"**, not "a provider restores you".

9. Verification and acceptance blueprint

9.1 Acceptance gates per environment

Environment

Gate to pass before it is considered provisioned

Deciding evidence

E0 workstation

make verify green; --check reports MANIFEST: OK

local output

E1 dev

ci.yml software job green (unit)

CI log

E2 test/bench

software + firmware + dashboard + governance jobs green; stability PASS; native framing 20/20; parity test green

CI log + stability.json

E3 prod-edge

All of E2, plus A1–A5 (§8.1), plus a signed artefact if promoting to prod, plus the session log entry

bench record + session log + MANIFEST.sha256.sig

E4 prod-host

All of E2, plus entrypoint fail-fast behaviour verified (refuses non-loopback without token), plus token enforced on both REST and WebSocket, plus audit chain verifies

docker compose exec hub curl …, seal-check

E5 prod-static

dashboard job green; bundle renders with no network

CI log + rendered preview

9.2 Requirement → test → evidence traceability

The chain that makes a claim checkable, worked through one example:

Requirement

Implementation

Test

Evidence artefact

Label

R1 State never leaves [0,1], never non-finite, including under attack

prometheus_engine.py clip + finiteness check

tests/safety/test_safety_gate.py (5 000 steps), tests/fuzz/test_stability_fuzz.py

stability-*.json

IMPLEMENTED_AND_TESTED

R2 Bad input fails closed and is counted

INPUT_FAULT path retains previous state

test_non_finite_sensor_fails_closed

CI log

IMPLEMENTED_AND_TESTED

R3 Frame contract identical in C and Python

_Static_assert + FRAME_SIZE

native_frame_test.c (20 checks) + test_frame_protocol.py

CI log

IMPLEMENTED_AND_TESTED

R4 Audit log is tamper-evident

sealing.verify_chain

test_audit_chain.py (edit/delete/reorder)

seal-check output

IMPLEMENTED_AND_TESTED

R5 No raw biosignal egress

telemetry/export.py has no raw path

test_export_is_aggregate_only

CI log

IMPLEMENTED_AND_TESTED

R6 Hub is loopback-only unless tokenised

api/app.py::require_access (timing-safe compare)

test_bearer_token_is_enforced_when_configured

CI log

IMPLEMENTED_AND_TESTED

R7 No actuation path exists

by absence, single-writer firmware review

manual review

SAFETY.md §1

IMPLEMENTED_AND_TESTED (by absence)

R8 Sensor accuracy within stated bounds

firmware sensors + calibration

no test

no artefact

CONCEPTUAL_ARCHITECTURE

R9 Battery life ≥ 7 days at 1 min cadence

power design

no measurement

none

not measured

R10 End-to-end BLE latency < 50 ms

BLE notify path

no measurement

none

not measured

R8–R10 are in the table deliberately. A traceability matrix that contains only rows with a green tick

is a marketing document; the value comes from the rows that are empty and visible.

9.3 The bench validation programme (the critical path)

This is the largest block of CONCEPTUAL_ARCHITECTURE in the project and the only thing standing

between "compiles" and "measured". The rule that governs the whole programme: **write the protocol

and its acceptance criteria before collecting data.** Data collected before the criteria are fixed

cannot validate anything, because the criteria can always be fitted to the data afterwards.

9.3.1 Study designs, by claim

#

Claim under test

Design

Reference standard

Primary statistic

B1

HR and HRV agree with a reference

Method comparison, same-subject, concurrent acquisition

ECG-derived RR intervals (HRV), a validated pulse oximeter or ECG (HR)

Bias and limits of agreement; concordance correlation

B2

EDA tracks a known conductance

Method comparison against a calibrated reference

Precision resistor / known shunt at defined conductance values

Bias, linearity deviation

B3

Skin temperature agrees

Method comparison

Calibrated contact thermocouple or thermistor

Bias, limits of agreement

B4

Motion artefact rejection is adequate

Detection-performance study with defined movement tasks

Manual annotation of valid/invalid segments by two raters

Sensitivity, specificity, false-reject and false-accept rates

B5

Battery life at target cadence

Power-profiler run, both with and without BLE connected

Instrumented power measurement

Runtime to depletion, with the duty cycle stated

B6

End-to-end BLE latency

Timestamped round-trip measurement with the real phone

Host + device clocks, offset-corrected

Median and p95 latency, with clock-sync error stated

B7

Thermal behaviour of the enclosure

Soak test at maximum duty cycle

Calibrated surface-temperature measurement

Steady-state surface temperature rise

B8

Failure modes behave as documented

Fault injection (sensor disconnect, brownout, BLE drop)

The documented expected-behaviour table

Pass/fail per injected fault

9.3.2 Design rules that must be fixed in advance

These are the failure modes that make a small validation study worthless even when the hardware is

fine:

Fix the acceptance criteria first. For each claim: the acceptance limit, the unit, and what

happens on failure. "Within ±5 bpm of the ECG reference at rest" is testable; "accurate" is not.

Pre-specify the analysis. Agreement studies are analysed for bias and limits of agreement

(Bland–Altman) and, where a slope/intercept is the question, by **Deming or Passing–Bablok

regression** — not by ordinary least-squares, which is inappropriate when both instruments carry

error, and not by a correlation coefficient, which measures association and not agreement.

Where a formal equivalence decision is required, use an equivalence test against a pre-stated

margin, not a non-significant difference test.

Pre-specify the sample size. Do not collect "as many as convenient". A Bland–Altman limits-of-

agreement study needs a sample size derived from the expected standard deviation of differences

and the desired precision of the limits; a detection-performance study (B4) needs a sample size

derived from the target sensitivity/specificity and their confidence-interval width. Both are

computable in advance and both must appear in the protocol with their inputs stated.

Control the confounders that this hardware actually has. Skin pigmentation, perfusion,

ambient light, contact pressure, motion, ambient temperature, and electrode placement all move

PPG/EDA output. Block or randomise where they can be controlled; record them where they cannot.

Specifically: counterbalance sensor placement order, fix ambient conditions, and record time-since-

caffeine/nicotine/exercise if those are not excluded.

Blind where blinding is possible. The analyst should not know which instrument produced which

trace during annotation and primary analysis. Full blinding is impossible here (the device is

obviously the device), so state which steps were blinded and which were not.

Keep every negative result. A failed bench step is the most useful row in the table. Removing

it turns a record into marketing (evidence/README.md, rule 2).

Record the session, not just the result. Each bench-*.md entry must carry: firmware hash,

model_version, param_version, reference-instrument identity and calibration status, ambient

conditions, operator, date, protocol version, raw data location, and the pre-registered criteria.

A result without those cannot be attached to a build and is therefore not evidence about that

build.

Do not extend the conclusion. A sensor-accuracy result says the sensor agrees with a reference

under stated conditions. It says nothing about whether the state model tracks physiology, and it

does not make any output clinically meaningful. That separation is the whole point of the evidence

labels, and it is the easiest one to lose in a summary.

9.3.3 What the programme deliberately cannot produce

No bench programme, however careful, converts this system into a medical device. It produces

metrological and reliability evidence. Clinical claims require clinical evidence, ethics approval and

a regulatory route (§13).

10. Operations blueprint

10.1 Observability — deliberately local

There is no hosted dashboard, no APM agent, no remote log shipping. Observability is the hub's own

surface plus the audit log:

Surface

Purpose

Notes

GET /api/health

Liveness + engine/governor version + data_mode

The only unauthenticated endpoint; it exposes no data, which is why the container healthcheck uses it

GET /api/v1/status

Ingest counters, engine stats, governor codes seen

Primary triage surface

GET /api/v1/state

Latest validated state vector + provenance

503 until a frame is published

WS /api/v1/stream

Validated frames at the engine rate

Protected by the same token as REST

GET /api/v1/history

Recent frames

Bounded

var/audit-YYYYMMDD.ndjson

Hash-chained record of every accepted frame + verdict

Forward-compatible; never edit

sovereign-hdi seal-check <file>

Chain verification

Run daily

10.2 Routine operating rhythm

Daily: confirm /api/health reports the expected data_mode (SIMULATED during evaluation);

check the governor codes seen in the last session; confirm the chain still verifies

(seal-check var/audit-<date>.ndjson).

Weekly: inspect and clean electrodes/optics; export aggregates

(curl -s localhost:8077/api/v1/export/json -o weekly.json); verify the release hash

(sha256sum -c MANIFEST.sha256).

After a firmware change: run the native framing test; flash and confirm the boot self-test line;

confirm frames_decoded increases and crc_errors stays at 0.

10.3 Triage table (condensed)

Symptom

First check

Likely cause

Action

/api/health unreachable

Service state, HDI_ENGINE_AUTOSTART

Service stopped, port conflict

Restart; confirm the port is free

/api/v1/status → 401

Token / host header

Loopback-only mode with a remote client, or token mismatch

Access from the device, or align the token on both ends

/api/v1/state → 503

Has any frame been published?

HDI_ENGINE_AUTOSTART=0 and no manual tick, or the loop died

POST /api/v1/tick, or restart with autostart

Dashboard shows RECOVERY

governor.code

Reserve below floor

Expected behaviour. Treat as "the operator should rest", not a fault to clear

THROTTLE repeatedly

engine_stats.clip_rate, sensor values

Sensor deviation pinned near 1.0, stale calibration

Re-run baseline capture; check electrode contact and LED current

INPUT_FAULT climbing

engine_stats.faults, node sensor_invalid

Loose electrode, LED current, motion, partial frame stream

Inspect the node log; check MOTION_REJECT rate; re-seat electrodes

SEQUENCE_OUT_OF_WINDOW

ingest_counters.rejected

Node rebooted (sequence reset) or frames replayed

Verify against node uptime; dedupe is by message_id

EVIDENCE_SEAL_MISMATCH

ingest_counters.quarantined, audit log

Envelope modified in transit, or a client sealing bug

Security event. Inspect quarantined records; do not disable the check

Audit log growing fast

du on HDI_DATA_DIR

Loop logging at a high rate

Rotate daily files; aggregates are the intended export

Full runbook: [OPERATIONS.md](OPERATIONS.md).

10.4 Incident classes

Incident

Immediate action

Follow-up

Skin reaction at an electrode site

Stop the session, remove electrodes, inspect the skin

Record it; seek medical advice if it does not resolve; review electrode type and session duration

Any electrical sensation

Stop immediately, disconnect the node, do not reconnect while the supply could be mains-referenced

Do not resume until supply and isolation are reviewed by someone competent to do so

Suspected data exposure

Rotate HDI_API_TOKEN, stop remote access, snapshot the audit log

Determine the exposure window — the log states exactly which frames were accepted and when

Suspected log tampering

Do not delete anything

Run seal-check; the failing index localises the edit; preserve the file as-is

Device overheating

Stop the session, power down

Thermal design is not validated; treat any heat as a design fault

Every incident entry records: UTC timestamp, session id, what was observed, what was changed, who was

informed — stored beside the audit log so the two can be read together.

10.5 Service targets, stated honestly

Property

Target

Status

Engine step latency

≪ 1 ms for 5×5 algebra

Measured in the stability sweep (80 000 iterations in 4 315.9 ms ≈ 0.054 ms/iteration, including input generation)

Frame cadence

10 Hz

Implemented (absolute-deadline loop in main.c, HDI_ENGINE_HZ)

Numerical stability

0 non-finite, 0 bound violations

Verified, four regimes (§1.1 V3)

Battery (node)

> 7 days at 1 min cadence

Not measured

BLE end-to-end latency

< 50 ms

Not measured. The corpus asserted this figure; this blueprint does not, because no measurement exists

Availability

—

No target is stated. A single-node local deployment has no meaningful availability objective, and inventing one would be precisely the kind of unsupported number the claims register prohibits

11. Security and privacy blueprint

11.1 Threat model

#

Threat

Control implemented

Residual risk

T1

Remote read of state data

Loopback-only default; bearer token with timing-safe compare; container entrypoint refuses non-loopback without a token; systemd IPAddressAllow=localhost

None beyond physical access, provided the deployment rules are followed

T2

Remote drive of the control vector

POST /api/v1/control requires the token; values clamped to [-0.25, 1.0]; every value scaled by the previous verdict's authority

Token custody is organisational, not technical

T3

Envelope tampering in transit

SHA3-256 evidence seal over canonical bytes; mismatch ⇒ quarantine, never store-as-trusted

Seal proves integrity, not origin — see T7

T4

Post-hoc modification of records

Hash-chained NDJSON audit log; seal-check localises the failing index

Operator could fabricate a fresh consistent log; only a signature + external timestamp would close this

T5

Corrupt/forged sensor frames

Magic scan, CRC-16 rejection, channel range checks, sequence window, capture-age window; corrupt frames are discarded, never repaired

A physical attacker with the BLE link could send well-formed frames; no per-frame node authentication is implemented

T6

Raw biosignal exfiltration

No raw-signal egress path exists; export is aggregate-only; container has no outbound network

A modified build could add one — hence the Egress change class (§5.3 E)

T7

False provenance

Every frame carries model_version, param_version, evidence_label; SIMULATED banner persists in the UI

Signed manifests are optional and currently off (FW_SIGNING_KEY unset)

T8

Package supply chain

Pinned base image, no build toolchain in the final image, pip check, no cloud SDK, Docker image excludes the token

No SBOM or vulnerability scanning is configured

T9

Secret leakage

.env git-ignored; CI scans for committed secret-shaped values; token never baked into the image

No key-management/HSM story exists

11.2 ACSC Essential Eight — current posture

The mapping is a draft, not a verified posture (docs/compliance/ACSC_ESSENTIAL_EIGHT.md).

Honest summary: several strategies are substantially addressed by design (application control is

trivial because there is no plugin surface; restrict admin privileges is implemented in the container

and unit files; patching is bounded by a small dependency set), while others are not implemented

(multi-factor authentication, no logging-to-a-central-sink, no formal incident-response plan, no

regular vulnerability scanning, no application hardening baseline beyond the container config).

Treating the draft mapping as a certification would repeat the error the compliance README warns

about.

11.3 Australian Privacy Principles — current posture

docs/compliance/APP_PRIVACY_ASSESSMENT.md is a template, not an assessment outcome. The design

position is strong and specific:

Data minimisation by design — local processing; the reference implementation never transmits raw

biosignals; export is aggregate-only.

Pseudonymity by construction — subject identifiers in shipped examples (AX-EXAMPLE, AX-7G)

are fictional placeholders taken from illustrative screens, not records of a person. Any demo

screenshot used publicly must say so.

Provenance on every record — so a reviewer can separate measurement from demo.

No secondary use — there is no analytics path and no third-party SDK.

What is missing, and blocks any APP compliance claim: no completed Privacy Impact Assessment, no

approved retention schedule, no reviewed consent instrument, and no decision on whether

pseudonymous state estimates count as personal information in the deployed context. Those are legal

determinations, not engineering tasks.

11.4 Data flow summary

Person ──(electrodes/PPG, battery SELV node)──► ESP32-S3 ──(BLE, 34-byte CRC-framed)──► phone/host
                                                                                        │
                                       loopback hub: decode → normalise → estimate → gate
                                                                                        │
                                    ┌───────────────────────────────────────────────────┤
                                    ▼                                                   ▼
                        local PWA display (cue)                     hash-chained NDJSON audit log (local)
                                                                                        │
                                                                    aggregate-only export (opt-in, no raw signals)

Nothing in the reference implementation sends data off-device on any path.

12. Governance and standards readiness

12.1 Declared scope and the assurance lanes

The single most common error in this area is lane confusion, so it is stated first. **Certification,

accreditation, regulator inspection and product conformity assessment are decided by different bodies

against different bases, and none substitutes for another.* Organisations are certified*;

laboratories are accredited.

Lane

Decided by

Applies to this project?

Current state

ISO 13485 QMS certification

A certification body

Only if a medical-device claim is made

Not started. No legal entity, no management representative, no quality manual

ISO 14971 risk management

Not a certificate; a process requirement

Relevant now as a method, regardless of device status

A scaffold exists (compliance/RISK_REGISTER.md) with owners deliberately unassigned

ISO/IEC 17025 accreditation

An accreditation body

Only if the project offers testing/calibration services

Out of scope

TGA device classification / inclusion

TGA

Undetermined — that is the honest answer

Intended-use draft prepared for review; no determination

ACSC Essential Eight

Self-assessment (or an assessor)

Yes, as cyber-hygiene guidance

Draft mapping; several strategies not implemented

Privacy Act 1988 (APPs)

OAIC / the entity's own accountability

Yes, if any other person's data is collected

Template PIA only

**Nothing in this repository is a certificate, a test report, a declaration of conformity or a

regulatory determination.** The dossier exists so that review starts from a concrete statement rather

than a moving target.

12.2 Controlled-document structure

The documentation set follows the standard four-tier hierarchy, with this blueprint as a tier-1/2

artefact:

Tier

Document

Role

Status

1

This blueprint

Scope, environments, gates, phase plan

Draft for review

1

[README.md](../README.md)

Truth declaration, quickstarts, compliance posture

Maintained

2

[ARCHITECTURE.md](ARCHITECTURE.md), [DATA_CONTRACT.md](DATA_CONTRACT.md), [SAFETY.md](SAFETY.md), [DEPLOYMENT.md](DEPLOYMENT.md), [OPERATIONS.md](OPERATIONS.md), [TESTING.md](TESTING.md)

Procedures and specifications

Maintained

2

[EVIDENCE_LABELS.md](EVIDENCE_LABELS.md), [CLAIMS_REGISTER.md](CLAIMS_REGISTER.md), [LIMITATIONS.md](LIMITATIONS.md)

Governance registers

Maintained

3

[compliance/*](compliance/)

Assessment checklists and scaffolds

Draft, unreviewed

4

MANIFEST.sha256, EVIDENCE.json, stability-*.json, bench-*.md, var/audit-*.ndjson

Records — the objective evidence

Generated

The tier-4 records are the ones that matter in an assessment. A procedure describing an activity is

not evidence the activity happened; only sampled records are.

12.3 Risk file and change control

Element

Implementation here

Gap

Hazard identification

SAFETY.md §5 (six real hazards: mains-referenced ground, electrode skin injury, optical thermal load, over-trust in the display, LAN exposure, device-driven decisions)

Not yet a formal risk file

Risk estimation / acceptability

Not established. No criteria are set

Requires clinical/quality input

Risk controls

Battery-SELV rule, single-use electrodes, duty-cycled acquisition, provenance labels, loopback default, no actuator path

Some are design decisions, not verified controls

Residual risk

compliance/RISK_REGISTER.md §3 lists residual risks that block any release

Owners unassigned — intentionally visible

Change control

§5.3 change taxonomy (Classes A–E), CHANGELOG.md, param_version versioning, CI gates

No formal CCB; appropriate for a single-maintainer project, insufficient for a regulated one

CAPA

Deviations recorded in CHANGELOG.md (e.g. the 2.5.0-rc2 seal-recompute defect, the spectral-radius defect)

No CAPA records with effectiveness evidence

Supplier controls

Dependency pinning, container base image, no external services

No supplier register; no calibration-provider controls (relevant once B1–B3 use a reference instrument)

External-provider control

Reference instruments for bench validation (§9.3) will be external providers

Not yet under control

The spectral-radius defect in CHANGELOG.md is the model to follow: a defect was found, its

cause was identified (coupling 0.02–0.05 produced ρ > 1, so the state self-amplified to its bounds with

zero input and every session reported maximum stress and zero reserve), a preventive control was added

(configuration loading now rejects ρ ≥ 1), and the reasoning was recorded rather than the incident

being quietly patched. That is CAPA-shaped work done properly; it simply is not yet in a CAPA record.

12.4 Bounded evidence manifest

MANIFEST.sha256 + EVIDENCE.json are the local, bounded evidence manifest: SHA-256 of every tracked

artefact, plus release_version, model_version, param_version, artefact count, total bytes and

per-tier counts. It answers exactly one question — *are the bytes you hold the bytes that were

tested?* — and it is regenerated, never hand-edited.

It does not establish provenance, authorship, adequacy or trust. A SHA3-256 seal proves a record

was not altered after sealing; it does not prove who produced it or when. Only a signature and an

external timestamp authority would, and neither is implemented (LIMITATIONS.md §5). Stating that

limit explicitly is what keeps the manifest useful.

12.5 Handoff statement

Present to a reviewer: declared scope and the unresolved applicability decision (is it a medical

device? — undetermined); the exact source/version baseline (VERSION, param_version, firmware

hash); the evidence sampled and the limits of that sample; structural findings grouped by process and

risk; actions with owners and dates; and the authorised party responsible for the next decision. The

correct title for such a package is "Draft evidence review for authorised human assessment" — not

"certificate", "compliance report", "audit pass" or "ready for inspection".

13. Regulatory pathway and the gaps that block a conformity claim

13.1 Device scope in one paragraph

The platform is a non-invasive biofeedback and physiological state-visualisation system. It senses

pulse-derived heart rate/HRV, electrodermal activity, temperature and motion; estimates a bounded

state; displays that estimate; and records it with cryptographic provenance. It does not stimulate,

actuate, dose, diagnose or claim therapeutic benefit. Under Australian regulation, **whether that

description makes it a medical device, and if so which classification applies, is a determination for

the TGA and a qualified regulatory professional.** The intended-use draft exists so that review can

start from a concrete statement.

13.2 Instrument-by-instrument posture

Domain

Instrument

Posture in this repository

What would change it

Electrical safety

AS/NZS 61010-1

SELV (< 5 V DC) low-voltage design; design checklist only, not a test report

Accredited test house report

EMC / RF

AS/NZS CISPR 32

BLE 2.4 GHz, < 10 mW intended; not measured

Accredited EMC test

Device scope

TGA

Intended-use statement prepared; no registration claimed or implied

Regulatory determination by a competent professional

Privacy

Privacy Act 1988 (APPs)

Local-first design + APP mapping; PIA template, not an assessment outcome

Completed PIA + approved retention schedule

Cyber hygiene

ACSC Essential Eight

Firmware signing hooks, sealed logs, least privilege; mapping in docs/compliance/

External security assessment / threat-model sign-off

13.3 The seven gaps that block any conformity claim

#

Gap

Consequence

G1

No accredited EMC or electrical test report

Cannot claim AS/NZS compliance — only "designed with reference to"

G2

No sensor-accuracy study against a reference instrument

Cannot claim measurement accuracy or uncertainty (§9.3 is the plan)

G3

No clinical investigation

Cannot claim any clinical benefit, and must not imply one

G4

No completed PIA or approved retention schedule

Cannot claim APP compliance

G5

No external security assessment or threat-model sign-off

Cannot claim the Essential Eight posture is verified

G6

No firmware signing key configured

Cannot claim verifiable firmware provenance for a release

G7

No responsible legal entity or sponsor appointed

No one can make a regulatory submission

Each gap is tracked with an owner field left unassigned on purpose, so that the absence of

assignment is visible rather than implied to be in progress.

13.4 Permitted external communication today

Until G1–G7 are addressed, external communication may describe: the architecture, the test suite, the

evidence discipline, the datasets and the limitations. It may not describe the platform in

clinical terms, present simulation output as measurement, or use any of the ten prohibited claim

classes in CLAIMS_REGISTER.md §3.

14. Risk register — top risks and blockers

#

Risk

Likelihood

Impact

Current control

Owner

K1

Sensor data is trusted beyond its unmeasured accuracy

High

High

Provenance labels on every frame; LIMITATIONS.md §4; SIMULATED banner persists in the UI

Unassigned

K2

A user (or a pitch) converts the state estimate into a health claim

High

High

Prohibited-claims list; CI lint; claims register; dashboard scope note

Unassigned

K3

Mains-referenced path creates an electrical hazard

Low

Severe

Battery-SELV operating rule; checklist; session checklist printed on every non-dev promotion

Unassigned

K4

Bench validation never happens, leaving the largest block CONCEPTUAL_ARCHITECTURE

High

High

§9.3 protocol-first programme; §15 P1

Unassigned

K5

Manifest/gate drift causes an artefact to be described as verified when it is not (already observed once — §1.3)

Medium

High

--check in CI and in the prod gate; prod gate refuses to promote unsigned

Unassigned

K6

param_version change without documentation makes old telemetry uninterpretable

Medium

Medium

Class B change rule; CI stability gate; version on every frame

Unassigned

K7

Rollback or restore fails because the audit log was not backed up

Medium

High

Backup procedure; append-only/forward-compatible log

Unassigned

K8

NumPy/stdlib divergence under a future change

Low

Medium

Equivalence test at 1e-12; parity test JS↔Python at 1e-9

Covered by tests

K9

Accessibility gap (screen-reader semantics, contrast)

Medium

Medium

Identified as partial in ROADMAP.md Phase 4

Unassigned

K10

Documentation drift (e.g. the stale "87 tests" figure)

Medium

Low

Measured counts recorded in CI logs; §15 P0

This change

Owners are unassigned because no one has been appointed. That is a finding, not an oversight, and it

should be reported as such.

15. Phase plan with acceptance criteria

Owners are left unassigned for the same reason as §14. Each phase's acceptance criterion is an

artefact, not an opinion.

P0 — Close the consistency gaps found in this review (immediate)

Task

Status

Acceptance criterion

Evidence

Regenerate MANIFEST.sha256 and EVIDENCE.json from the current tree

Done

--check prints MANIFEST: OK

V6 — 139 entries, MANIFEST: OK

Correct the stale test count in TESTING.md (87 → 165)

Done

TESTING.md states the measured figure with its breakdown and measurement date

TESTING.md §1

Keep the source corpus outside the repository

Done

Manifest contains no corpus files; audit/README.md policy intact

V6 — entry count matches the tree

Add the promotion gate script and make promote (§7)

Done

promotion_gate.py --env {dev,test,prod} returns an honest verdict

V7, V8

Configure FW_SIGNING_KEY with documented custody, or record the decision not to

Outstanding

Prod gate reaches 5/5

V8 — currently 4/5, blocked on this row

P1 — Bench validation (critical path — the thing that converts the largest claim block)

Task

Acceptance criterion

Write the B1–B4 protocols with pre-registered acceptance criteria, reference instruments, sample sizes and analysis plan

A protocol document exists before any data collection, signed and dated

Bench the framing path end-to-end with one real sensor and one phone

frames_decoded increases, crc_errors == 0, values move plausibly with a finger on the sensor

Execute B1–B4 and publish results including negatives

bench-*.md entries carry firmware hash, model_version, param_version, reference-instrument identity and calibration status

Execute B5–B7 (battery, latency, thermal)

Measured values replace the three "not measured" rows in §9.2 R9/R10

P2 — Firmware completion

Task

Acceptance criterion

BME280 compensation + NVS-stored calibration block

Currently reports env_valid = false rather than approximating; implement or state as out of scope

BLE notify transport exercised against a real phone

Recorded latency measurement (B6)

Configure FW_SIGNING_KEY with a documented custody decision

Prod gate passes; release notes print Manifest signature: true

P3 — Presentation and accessibility

Task

Acceptance criterion

Full accessibility pass

Screen-reader semantics and contrast audited with assistive technology; ROADMAP.md Phase 4 item moves from partial to delivered

Rendered preview at desktop and mobile

Non-blank and usable at both viewports

P4 — Governance completion

Task

Acceptance criterion

Complete the PIA with a privacy officer and approve a retention schedule

Replaces the template; G4 closes

Complete the electrical/EMC checklist and obtain an accredited test report

G1 closes

External security assessment and threat-model sign-off

G5 closes

Regulatory review of the intended-use statement by a competent professional

G3/G7 status becomes determinate; external clinical language unlocked only if the review permits it

P5 — Release and hand-off

Task

Acceptance criterion

Signed v1.0.0 public release with a reproducible build guide

release.yml produces a signed ZIP, manifest, and release notes containing the negative verification rows

Stage the evidence package (P0–P4) for institutional hand-off

If preclinical or clinical work is the goal, the package is handed to a body with the facilities and authorities for it

The honest boundary: P0–P3 are achievable by a small team. P4 requires institutions and

professionals. P5's second row is not a software problem, and no amount of engineering produces the

authorities it requires.

16. Method note — how this blueprint was produced

Stated so a reader can judge the basis of every statement, and so the same methods can be reapplied.

Method / discipline applied

Where it shaped the output

Evidence-provenance discipline for technical reporting

§0.3 label scheme; §1 records commands and observed output rather than intent; §1.2 separates proven from not-implied; §9.2 shows an empty row rather than only green ticks; no citation or figure appears that a tool did not produce

Consistency checking across artefacts

§1.3 found and reported a real manifest/tree mismatch and a stale test count; §1.4 is the reconciliation record

Readiness-evidence structuring for standards work

§12 keeps assurance lanes separate (organisation certified vs laboratory accredited vs regulator vs conformity assessment), distinguishes procedures from sampled records, requires the evidence manifest to be bounded, and preserves unresolved decisions as blockers with unassigned owners instead of resolving them

Validation/verification methodology (methods & comparability)

§9.3.2 fixes acceptance criteria in advance, pre-specifies the analysis, and selects statistics appropriate to agreement (bias and limits of agreement; Deming/Passing–Bablok rather than ordinary least-squares or correlation), with equivalence testing where a formal equivalence decision is required

Experimental design and pre-registration

§9.3.2 blocks/randomises the controllable confounders (pigmentation, perfusion, ambient light, contact pressure, motion, temperature, placement), counterbalances placement order, and states which steps are blinded

Sample-size and power reasoning

§9.3.2 item 3 requires sample size to be derived from the expected SD of differences for agreement studies and from target sensitivity/specificity and CI width for detection studies, with inputs stated in the protocol

Supply-chain and release-integrity practice

§6–§7 pinned toolchains, artefact hashing, optional signing that is reported honestly when absent, draft-only publication

Hazard-driven safety engineering

§11–§14 separate software gates from hazards, keep the residual-gap table visible, and record defects with cause and preventive control

Disciplines that were considered and not applied, with reasons — because claiming coverage that

does not exist is the failure mode this project is built to avoid:

Clinical-trial protocol design and clinical reporting. The platform makes no clinical claim, and

§13.4 prohibits clinical language until a regulatory review permits it. Drafting a clinical protocol

now would create exactly the artifact the claims register exists to prevent.

ISO/IEC 17025 and ISO 15189 laboratory-accreditation preparation. The project does not operate a

testing or medical laboratory; applying that vocabulary would be a lane error.

Biospecimen / lab-automation and omics tooling. No wet-lab or sequencing component exists here.

The workspace's separate variant-analysis work is a different programme with its own evidence base.

PK/PD and pharmacological modelling. No drug, dose or exposure-response question is in scope.

Appendix A — Command reference

# Development
make install                                   # pip install -e "software[dev,api]"
make test                                      # full python suite
make test-fast                                 # unit only
make verify                                    # test+stability+dashboard+firmware+manifest
make simulate                                  # SIMULATED session -> var/audit-*.ndjson
make model-card                                # frozen config + provenance
make serve                                     # hub on 127.0.0.1:8077
make serve-with-dashboard                      # hub + built PWA, one process, loopback
make stability STEPS=200000                    # long stability sweep
make firmware-test                             # native framing test (no hardware)
make dashboard-build                           # dashboard/dist
make manifest && make manifest-check           # regenerate + verify
make package                                   # release ZIP

# Verification
python scripts/verify_stability.py --steps 20000
python scripts/gen_evidence_manifest.py --check
cd software && python -m sovereign_hdi verify --steps 20000
cd software && python -m sovereign_hdi seal-check ../var/audit-$(date -u +%Y%m%d).ndjson
python scripts/promotion_gate.py --env test    # promotion gate for a named environment

# Firmware
cd firmware/esp32-omniroot && pio run -e esp32-s3
cd firmware/esp32-omniroot && pio run -e esp32-s3 -t upload        # LAB BENCH ONLY
cd firmware/esp32-omniroot && pio device monitor -b 921600

# Deployment
cd deploy/docker && docker compose up -d --build
sudo systemctl enable --now sovereign-hdi

Appendix B — Environment variable reference

See §8.4. Authoritative names and comments: [.env.example](../.env.example).

Appendix C — Artefact inventory

Artefact

Produced by

Reviewer can conclude

MANIFEST.sha256

scripts/gen_evidence_manifest.py

The bytes they hold are the bytes that were tested

EVIDENCE.json

same, --json

Structured inventory: versions, tier counts, per-file hashes

release/*.zip + .sha256

tools/package_release.sh

Distributable, with the built dashboard included

VERIFICATION.txt (inside the ZIP)

tools/package_release.sh

A plain statement of what was and was not verified

stability-*.json

scripts/verify_stability.py --json

Numerical stability for a specific run

bench-*.md

A human, from firmware/.../docs/CALIBRATION.md

Sensor-accuracy results, protocol and failures included

var/audit-*.ndjson

the hub

Every accepted frame and verdict, hash-chained

reports/pytest-*.xml

CI

Per-test results per Python version

Appendix D — Evidence labels

See [EVIDENCE_LABELS.md](EVIDENCE_LABELS.md). The five labels are IMPLEMENTED_AND_TESTED,

SIMULATED, CONCEPTUAL_ARCHITECTURE, RESEARCH_HYPOTHESIS, FICTIONAL_VISUALISATION. A label is

part of the artefact — in docstrings, in model_card(), in provenance.evidence_label on every

published frame. A label changes only when the evidence it describes exists, and the change is

recorded in CLAIMS_REGISTER.md; it is never promoted by editing prose.

Appendix E — Prohibited claims

Ten classes, listed in full in [CLAIMS_REGISTER.md](CLAIMS_REGISTER.md) §3, including: cures/treats/

heals/regenerates tissue or reduces inflammation; reads or writes a nervous system; stores data in a

brain; stimulates neurons or induces plasticity; diagnoses or monitors disease; "clinically

validated"/"medically certified"/"TGA approved"; guarantees safety or prevents excitotoxicity; infers

genotype→connectome causality; measured figures that came from no measurement; and quantum or photonic

computation of any kind.

Appendix F — Glossary

Term

Meaning here

OMNIROOT

Tier 1: the ESP32-S3 sensor node, framing and transport

PROMETHEUS

Tier 2: the bounded non-linear state engine (the "digital twin", in quotes because parameters are illustrative)

Safety Governor

Tier 3: a numerical and state gate over software output. Not a medical safeguard

Evidence seal

SHA3-256 over canonicalised envelope bytes. Proves integrity, not origin

Param version

Version of the frozen model parameters. Changes in it are behavioural changes

Provenance label

`LIVE

Fail-closed

Invalid input retains the previous state, is counted, and never reaches a display or export path

Bench validation

Physical measurement against a reference instrument, with a protocol fixed in advance

Assurance lane

The distinct body and basis that decides certification, accreditation, inspection or conformity

*Prepared 2026-09-22. This blueprint is an engineering and operations plan. It is not medical advice,

not a treatment protocol, not a safety certification, and not a regulatory submission. Every executed

figure in §1 came from a command run against this working tree on the date shown; everything else is

labelled as target, plan, or unmeasured.*