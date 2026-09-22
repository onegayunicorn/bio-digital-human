# Proposed pin map (ESP32-S3 reference node)

**EVIDENCE LABEL: CONCEPTUAL_ARCHITECTURE — a proposal, not an as-built record.**
No schematic, PCB layout, BOM, impedance study or continuity test exists in this repository. Every
assignment below must be confirmed against the actual hardware, and the electrical items in §4 must be
reviewed by someone competent to do so, before anything is attached to a person.

---

## 1. Digital interfaces

| Signal | GPIO | Direction | Notes |
| --- | --- | --- | --- |
| I2C SDA | 8 | bidir | 400 kHz, internal pull-ups enabled; external 2.2–4.7 kΩ pull-ups recommended |
| I2C SCL | 9 | out | as above |
| Status LED | 2 | out | heartbeat; never encodes a safety state on its own |
| Pairing button | 0 | in | reserved; no write path exists in firmware |

## 2. Sensor devices on the I2C bus

| Device | Address | Purpose | Notes |
| --- | --- | --- | --- |
| MAX30102 | 0x57 | PPG (HR, HRV input) | SpO2 mode, 100 Hz, 18-bit, 411 µs pulse width, 4-sample averaging |
| BME280 | 0x76 | Ambient temperature/humidity/pressure | Forced mode to reduce self-heating near the skin; **compensation not yet implemented** |
| MPU6050 | 0x68 | Motion magnitude | ±2 g range; > 1.25 g or < 0.6 g marks the HRV channel invalid |

If two devices share an address on the final board, the addresses must be re-assigned (BME280 has an
alternate `0x77`); do not rely on bus arbitration to sort it out.

## 3. Analog front end (EDA)

| Signal | GPIO | ADC | Notes |
| --- | --- | --- | --- |
| EDA electrode input | 4 | ADC1 channel 3, 12-bit, 11 dB attenuation | 32-sample average per frame |

The transimpedance constant (`afe_gain_us_per_count` in `src/sensors.c`) currently carries a
placeholder value. It **must** come from the reviewed schematic, not from tuning until the numbers look
plausible.

## 4. Electrical safety items that must be resolved before prototype use

| Item | Requirement | Status |
| --- | --- | --- |
| Supply | Battery-only SELV, < 5 V DC. No mains-derived supply while electrodes are attached | Design rule stated; not verified on hardware |
| Electrode isolation | No galvanic path from electrodes to any external supply or mains-referenced ground | **To be verified against the schematic** |
| Current limiting on the electrode path | To be specified | **Not designed here** |
| Creepage / clearance | To be specified from the layout | **Not documented** |
| Enclosure | Not designed; skin-contact thermal behaviour unmeasured | **Absent** |
| Biocompatible contact materials | Not assessed | **Absent** |
| High-voltage / plasma elements | Must never be wired to a subject | Excluded by design |
| Protective earth | Not applicable to a battery-only SELV design; confirm in the charging configuration | **To be confirmed** |

## 5. What is deliberately absent from this board

* No stimulation output, electrode driver, or current source.
* No mains input, no AC-DC stage.
* No high-voltage, plasma or ignition path.
* No writable user-interface bus to an external host (BLE is notify-only).

These absences are the primary safety mechanism of the design: the highest-severity hazards were
removed rather than guarded (`../../docs/SAFETY.md` §5).
