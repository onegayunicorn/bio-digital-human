# Safety design

Scope: this document specifies **what the software gate does**, **what it cannot do**, and **where
the real hazards live**. Read it with `LIMITATIONS.md` §1–§3.

---

## 1. The honest framing

The source blueprint described the Safety Governor as the mechanism that "prevents excitotoxicity /
cognitive dissonance". That framing is rejected here, on two grounds:

1. **There is no stimulator to govern.** This firmware senses, frames and transmits. It cannot inject
   current, dose anything, or write to a nervous system. A software threshold cannot prevent a hazard
   that the system is incapable of creating.
2. **Thresholding a number is not a safety control.** A safety control requires independence,
   defined failure modes, a proof test interval and a documented integrity level. A governor that runs
   in the same process as the thing it observes, over a model whose parameters are illustrative,
   provides none of those.

So the governor is documented as what it actually is: **a bounded numerical and state gate on
software output**, implemented and tested. It is useful, it is testable, and it is not a medical
safeguard.

---

## 2. Enforcement behaviour

Implemented in `software/sovereign_hdi/safety_governor.py`; thresholds come from
`config/default_model.json` → `governor` so they are versioned, diffable and reviewable.

| Condition | Detection | Action | `code` | Authority |
| --- | --- | --- | --- | --- |
| Numerical fault | any `NaN` / `±Inf`, or non-numeric channel | Sample dropped, previous state retained, recalibration flagged | `NUMERICAL_FAULT` | `0.0` |
| Out of bounds | channel outside `[0, 1]` | Frame rejected, recalibration flagged | `OUT_OF_BOUNDS` | `0.0` |
| Reserve floor | `x[reserve] < 0.20` | Recovery mode: enhancement loops disabled | `RESERVE_DEPLETED` | `0.0` |
| Stress ceiling | `x[stress] > 0.90` | Feedback throttled | `STRESS_EXCEEDED` | `max(0.5, 1 − stress/max_stress)` |
| Persistent saturation | 40 consecutive clipped samples, or `‖h ⊙ tanh(x ⊘ d_thresh)‖∞ > 0.25` | Control authority reduced to floor | `SATURATION_BUDGET_EXCEEDED` | `0.5` |
| Nominal | all checks pass | None | `NOMINAL` | `1.0` |

Precedence: recovery (`RESERVE_DEPLETED`) dominates throttling. When both fire, the code reported is
`RESERVE_DEPLETED`, `STRESS_EXCEEDED` also appears in `reasons`, and authority stays `0.0`. This
ordering is asserted in `test_safety_governor.py::test_recovery_dominates_stress_breach`.

**Fail-closed by construction.** `gate_control()` returns a zero vector for
`RECOVERY`/`DROP_AND_RECALIBRATE`, and `evaluate_engine_health()` can only reduce authority. There is
no code path that increases authority after a breach.

---

## 3. Control authority

The control vector `u` is **user-mediated only**:

1. `POST /api/v1/control` is the sole entry point, and it requires authentication (bearer token) or a
   loopback client.
2. Values are clamped into `[-0.25, 1.0]` per channel at ingestion, and the clamp bounds are returned
   to the caller so the effect is visible.
3. Every requested control value is scaled by the *previous* verdict's authority before it reaches the
   engine (`gate_control`), and both the requested and the gated value are recorded on the published
   frame (`control_requested` vs `control`) so throttling is auditable rather than invisible.
4. Nothing in the codebase generates `u` autonomously. There is no optimiser, no learned policy, no
   automatic feedback loop that writes to `u`. If a future feature adds one, it belongs behind a
   separate review and a different governance model.

---

## 4. Numerical safety properties (and how they are checked)

| Property | Mechanism | Test |
| --- | --- | --- |
| State stays inside bounds | `clip` after every update | `test_prometheus_engine.py`, `tests/safety/test_safety_gate.py` (5 000 adversarial steps) |
| No non-finite state ever | finiteness check before assignment; fault path retains previous state | same, plus `test_stability_fuzz.py` (four input regimes) |
| Saturation term bounded | `‖h ⊙ tanh(·)‖∞ ≤ max(h)`, asserted for the shipped `h = 0.02` | `test_saturation_term_is_bounded` |
| Bad input cannot poison state | `INPUT_FAULT` leaves `x` unchanged and reports the drop | `test_non_finite_sensor_fails_closed` |
| Deterministic behaviour | frozen parameters, no RNG in the engine | `test_deterministic_replay.py` |
| NumPy and stdlib agree | optional accelerator, same results | `test_linalg.py` |

These are **arithmetic** guarantees. They are necessary for a trustworthy instrument and entirely
insufficient for a claim about a human being.

---

## 5. Where the real hazards are

| Hazard | Why it matters | Control |
| --- | --- | --- |
| **Mains-referenced ground on an electrode path** | The classic way a "wellness" device becomes an electrocution risk. A phone charger connected to a laptop connected to an electrode is a mains path. | Battery-powered, SELV, isolated node rail; never operate while charging from a mains-derived supply; no galvanic path from electrodes to a mains-referenced ground. See `compliance/AU_ELECTRICAL_EMC.md` |
| **Electrode skin injury / irritation** | Contact dermatitis, pressure marks, adhesive trauma | Single-use electrodes, session time limits, skin inspection, documented cleaning |
| **Optical sensor thermal load** | LED current driven continuously against skin | Duty-cycled acquisition, conservative LED current, enclosure thermal design |
| **Over-trust in the display** | A confident-looking dashboard invites decisions it cannot support | Provenance labels on every frame, `SIMULATED` banner in demo mode, a plan/explanatory note in the UI, `LIMITATIONS.md` linked from the dashboard |
| **Data exposure on a shared LAN** | The hub can be bound to a non-loopback interface | Loopback default; token required for remote; CORS allow-list; no raw-signal egress |
| **Device-driven decision-making** | Any behaviour change driven by the model | No actuator path; control is human-initiated only |

**Highest-priority operational rule:** never operate the node while it is connected to a
mains-powered supply. Battery operation is not a convenience, it is the primary electrical-safety
measure available to this design.

---

## 6. What a real safety case would additionally require

Listed so that the gap is explicit rather than implied:

1. Hazard analysis to ISO 14971 (device) with a documented risk file, not a table in a README.
2. Intended-use and indication statement reviewed by a clinical/regulatory professional.
3. Hardware independence: the gate in a separate microcontroller from the acquisition path, with its
   own watchdog, and a physical disconnect.
4. Proof-test procedure and interval, with recorded results.
5. Adverse-event handling, complaint handling and a post-market surveillance plan.
6. Human-factors validation of the display and the cue (does the user actually understand it?).
7. Software lifecycle per IEC 62304 if any medical claim is ever made.
