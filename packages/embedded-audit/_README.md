# OMNIROOT node firmware (ESP32-S3)

Non-invasive acquisition node: senses, timestamps, frames with a CRC, and transmits over BLE. It has
**no actuator path** — no stimulation output, no current source, no dosing, and no writable control
characteristic. It cannot be commanded to do anything other than report.

| Component | Status |
| --- | --- |
| Frame layout, CRC-16/CCITT-FALSE, encode/decode | Implemented and tested (host-native 20 checks; on-target Unity suite) |
| Boot self-test (frame round trip + corruption rejection) | Implemented; on-target run outstanding |
| Watchdog, absolute-deadline 10 Hz scheduling, statistics | Implemented |
| MAX30102 PPG + peak-interval HRV (RMSSD) | Implemented against the datasheet; **not bench-validated** |
| EDA via ADC1 with oversampling | Implemented; analog front end must come from a reviewed schematic |
| BME280 temperature/humidity/pressure | Probes and configures; **compensation not implemented** — reports `env_valid = false` rather than an uncompensated approximation |
| MPU6050 motion magnitude + artefact rejection | Implemented |
| BLE notify transport (NimBLE) | Implemented; **never run against a phone** |

EVIDENCE LABEL: `CONCEPTUAL_ARCHITECTURE` for anything touching hardware; `IMPLEMENTED_AND_TESTED` for
the framing, CRC and self-test paths (see `docs/EVIDENCE_LABELS.md`).

---

## Build

```bash
# ESP-IDF (primary)
idf.py set-target esp32s3 && idf.py build

# PlatformIO (bench convenience)
pio run -e esp32-s3          # build
pio run -e esp32-s3 -t upload
pio device monitor -b 921600
```

Expected boot output:

```
I (xxx) omniroot.main: SOVEREIGN HDI / OMNIROOT node starting
I (xxx) omniroot.main: monitoring-only firmware: no stimulation or actuation path exists
I (xxx) omniroot.main: self test passed (frame size 34 bytes)
I (xxx) omniroot.sensors: probe results: ppg=1 eda=1 env=0 imu=1
I (xxx) omniroot.ble: advertising as OMNIROOT-XXXX
```

`env=0` is expected until the BME280 compensation block is implemented.

## Test without hardware

```bash
gcc -std=c11 -Wall -Wextra -Werror=return-type -Iinclude \
  test/native_frame_test.c src/crc16.c src/protocol.c -lm -o frame_test && ./frame_test
# PASS: 20 checks, 0 failures
```

This compiles the real `protocol.c`/`crc16.c` and checks the wire layout, the shared CRC vector, round
trip fidelity, corruption rejection, and the NaN sentinel. On target, `test/test_crc16.c` runs the same
vectors under Unity (`idf.py -T test build`).

## Frame contract

See [`include/protocol.h`](include/protocol.h) for the authoritative layout and
[`../../docs/DATA_CONTRACT.md`](../../docs/DATA_CONTRACT.md) §1 for the same table in documentation.
Two details that have already caused a defect on this project:

1. The magic is `0x4844`, which appears on the wire as the **bytes `0x44 0x48`**. Scan for that byte
   pair; do not scan for the ASCII string `"HD"`.
2. Invalid measurements transmit **NaN with the validity flag clear**, never a plausible-looking zero.

## Pin map and calibration

* Proposed wiring: [`docs/PINMAP.md`](docs/PINMAP.md)
* Bench bring-up and baseline procedure: [`docs/CALIBRATION.md`](docs/CALIBRATION.md)

Both are proposals. No schematic, PCB, BOM or continuity test exists in this repository, so every pin
assignment must be confirmed against the actual hardware before anything is attached to a person.

## Safety-critical operating rules

1. **Battery only while electrodes are attached.** Never operate while any part of the system is
   connected to a mains-derived supply; that creates a plausible path to earth through the wearer.
2. **No high-voltage or plasma-coupled element may be wired to a subject.** Any such element in the
   wider concept corpus is excluded from this design.
3. EEG-style electrodes must be referenced only to the isolated node rail.
4. Skin contact surfaces must be clean, unbroken skin only; no biocompatibility assessment exists.
5. Confirm the boot self-test line and `crc_errors == 0` on the host before recording a session.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| `probe results: ppg=0` | Sensor absent or wrong address | Check `HDI_ADDR_MAX30102` and the I2C wiring; confirm with `i2c-tools` on the host |
| Host reports `crc_errors` increasing | Electrical noise, baud mismatch, or a framing regression | Run the native frame test; check cable/grounding; verify the host parser matches `FRAME_VERSION` |
| `MOTION_REJECT` on almost every frame | Threshold too tight for the mounting method, or actual movement | Re-check the mounting; tune only with a recorded protocol, not by feel |
| Node resets periodically | Watchdog fired because acquisition overran the 100 ms budget | Reduce the PPG window (`HDI_SAMPLE_INTERVAL_MS * 4` in `sensors.c`) or investigate an I2C stall |
| No BLE advertisement | NimBLE configuration missing in `sdkconfig` | Confirm the BT stack is enabled for the target; `idf.py menuconfig` → Bluetooth → NimBLE |
