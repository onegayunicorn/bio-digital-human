# Bench bring-up and baseline procedure

**EVIDENCE LABEL: CONCEPTUAL_ARCHITECTURE.** This is a procedure to execute, not a record of having
executed it. Nothing in this repository establishes sensor accuracy; this document exists so that the
first bench session produces *evidence* rather than impressions.

---

## 0. Non-negotiables before you start

1. The node runs on **battery only** while any electrode is attached. If the node, the phone or the
   laptop is on a charger, stop — the electrical-safety control for this design is the absence of a
   mains-derived path.
2. Two people present for the first session with a person: one operating, one observing.
3. Written consent and a stated retention period before recording anything from a participant.
4. Fixed acceptance criteria recorded **before** data collection. Data collected before the criteria are
   fixed cannot validate anything.

---

## 1. Bench bring-up without a subject

| Step | Action | Pass condition |
| --- | --- | --- |
| 1.1 | Run the host frame test (`gcc … native_frame_test.c`) | `PASS: 20 checks, 0 failures` |
| 1.2 | Flash, monitor the boot log | `self test passed (frame size 34 bytes)` appears; no watchdog reset within 10 min |
| 1.3 | Record the probe line | `ppg=1 eda=1 imu=1` (BME280 may be `env=0` until compensation is implemented) |
| 1.4 | Confirm framing end to end with `sovereign-hdi replay <capture.bin>` | `frames_decoded > 0`, `crc_errors == 0` |
| 1.5 | Optical channel: finger on the sensor, immobile | Heart rate lands within ±5 bpm of a count taken manually over 60 s |
| 1.6 | Motion rejection | Waving the sensor produces `MOTION_REJECT`; the HRV channel reports `NaN`, not a number |
| 1.7 | Electrode disconnect | `EDA_INVALID` appears; ingest quarantines `sensor_ok = false` |
| 1.8 | Battery drain check | Record voltage at start/end; note frame rate actually achieved |

Steps 1.5–1.7 test *plausibility and failure behaviour*, not accuracy. Do not write down step 1.5 as a
validated accuracy figure.

---

## 2. Sensor accuracy study (requires a written protocol first)

The point of this stage is to replace "the numbers look reasonable" with a measured comparison against a
reference. Write the protocol first; the table below is a skeleton to be completed by the person running
it, not a finished plan.

| Channel | Reference instrument | Comparison | Acceptance criterion (to be set in advance) |
| --- | --- | --- | --- |
| Heart rate | ECG or a validated chest strap | Bland–Altman over a resting and an active segment | `<to be filled in>` |
| HRV (RMSSD) | ECG-derived RR intervals | Agreement of RMSSD over matched windows | `<to be filled in>` |
| EDA | Known shunt resistor across the AFE input | Scale accuracy in µS | `<to be filled in>` |
| Skin temperature | Calibrated thermocouple adjacent to the sensor | Offset and drift over 30 min | `<to be filled in>` |

Report: the protocol, the raw paired data, the analysis, and the failures. A study that reports only
aggregate agreement hides exactly the conditions where the sensor is wrong.

---

## 3. Baseline capture procedure (per participant)

1. Fit the node; confirm stable contact and no skin compromise.
2. Remain seated and still for 5 minutes of acclimatisation.
3. Capture the baseline for at least 2 minutes — long enough to span the participant's normal variation.
4. Inspect the profile: if any metric reports a degenerate scale (MAD = 0), discard the capture. A flat
   signal means an electrode problem, not a calm participant.
5. Save the profile alongside the session so the transform can be reproduced later
   (`config/calibration.example.json` is the schema).
6. Record: date, node identity, firmware hash, `param_version`, participant pseudonym, any artefacts.

---

## 4. What this procedure does not establish

* That the state estimate is meaningful. The state model's parameters are illustrative; agreement in a
  sensor study says nothing about the model's physiology.
* That the device is safe. Electrical, thermal and biocompatibility items remain unresolved
  (`docs/PINMAP.md` §4 and `docs/compliance/RISK_REGISTER.md`).
* That any output may be used clinically. It may not — see `docs/compliance/TGA_INTENDED_USE.md` §2.
