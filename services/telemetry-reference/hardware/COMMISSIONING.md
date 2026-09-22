# Hardware Commissioning Boundary

This project accepts only approved non-invasive sensor inputs. Before connecting a real ESP32/S3, record the board revision, sensor part numbers, wiring, power budget, calibration procedure, sampling rate, uncertainty estimate, firmware hash, clock source, watchdog behaviour, and failure modes.

## Minimum commissioning tests

1. Sensor disconnect is detected and produces a non-live quality/status state.
2. Out-of-range values are rejected locally and by the API.
3. Sequence numbers are monotonic across reboot or a documented reset epoch is used.
4. Clock drift and offline queue replay are measured.
5. HMAC key provisioning and rotation are tested without printing secrets.
6. No hazardous output is connected to the firmware boundary.
7. The dashboard distinguishes `LIVE`, `CALIBRATED`, `SIMULATED`, and `PROTOTYPE`.
8. A qualified reviewer signs the calibration and release record.

The supplied plasma-ball and direct-neural concepts remain excluded from this implementation because the source material does not specify safe electrical, clinical, or regulatory controls.
