# Data contract

Three contracts are implemented and tested: the **node frame** (binary), the **telemetry envelope**
(JSON), and the **published state frame** (JSON over HTTP/WebSocket). Machine-readable schema:
`GET /api/v1/schema` (also `telemetry_schema.JSON_SCHEMA`).

---

## 1. Node frame — `omniroot.frame.v1`

Binary, little-endian, 34 bytes, no padding. Authority: `firmware/esp32-omniroot/include/protocol.h`;
host parser `software/sovereign_hdi/omniroot_client.py`.

| Offset | Size | Field | Type | Notes |
| --- | --- | --- | --- | --- |
| 0 | 2 | `magic` | uint16 | `0x4844`; wire bytes `0x44 0x48`. **Scan for the byte pair, not the ASCII string "HD".** |
| 2 | 1 | `version` | uint8 | must be `1` |
| 3 | 4 | `seq` | uint32 | monotonic per boot |
| 7 | 4 | `uptime_ms` | uint32 | device clock; **not** a wall clock |
| 11 | 4 | `ppg_hr_bpm` | float32 | `NaN` when `PPG_VALID` clear |
| 15 | 4 | `rmssd_ms` | float32 | `NaN` when `PPG_VALID` clear |
| 19 | 4 | `eda_us` | float32 | `NaN` when `EDA_VALID` clear |
| 23 | 4 | `skin_temp_c` | float32 | `NaN` when `ENV_VALID` clear |
| 27 | 4 | `accel_mag_g` | float32 | magnitude, g |
| 31 | 1 | `flags` | uint8 | bit0 PPG_VALID, bit1 EDA_VALID, bit2 ENV_VALID, bit3 MOTION_REJECT |
| 32 | 2 | `crc16` | uint16 | CRC-16/CCITT-FALSE over bytes 0–31 |

Contract rules:

* **Invalid is `NaN`, never `0`.** A zero meaning "no measurement" is how telemetry silently becomes
  fiction.
* **A corrupt frame is discarded, not repaired.** The parser resynchronises by scanning for the next
  magic byte pair; `crc_errors` and `resyncs` are counted and reported.
* **Frame size is asserted in both languages** (`_Static_assert` in C, `FRAME_SIZE` in Python, plus
  the native test), so a layout change breaks the build rather than desynchronising the ends.
* **No command channel.** The frame is one-way telemetry.

---

## 2. Telemetry envelope — `telemetry.v1`

Implemented in `software/sovereign_hdi/telemetry_schema.py`. The source corpus supplied a *template*
whose "types" were the literal strings `"number"`/`"string"`. This is the enforceable version.

```json
{
  "schema_version": "telemetry.v1",
  "message_id": "3f1c2b7a-2f3e-4c5d-9a11-0b1c2d3e4f50",
  "source_node": "esp32-s3-01",
  "firmware_version": "2.5.0+bench",
  "sequence": 1842,
  "captured_at": "2026-09-22T06:30:00.123Z",
  "received_at": null,
  "channel_id": "heart_rate",
  "value": 68.4,
  "unit": "bpm",
  "precision": 1,
  "uncertainty": 0.9,
  "update_interval_ms": 100,
  "status": "CALIBRATED",
  "quality": { "sensor_ok": true, "calibration_id": "cal-abc123", "fault_flags": [] },
  "transport": { "protocol": "BLE", "rssi_dbm": -61.0 },
  "evidence_seal": {
    "algorithm": "SHA3-256",
    "canonicalization": "hdi-jcs-1",
    "hash": "…64 hex chars…"
  },
  "signature": { "algorithm": "NONE", "key_id": null, "value": null }
}
```

### 2.1 Required and constrained fields

| Field | Rule | Error code |
| --- | --- | --- |
| `schema_version` | required, exactly `telemetry.v1` | `SCHEMA_VERSION_MISSING`, `SCHEMA_VERSION_UNSUPPORTED` |
| `message_id` | UUID when present | `MESSAGE_ID_NOT_UUID` |
| `source_node` | `^[a-z0-9][a-z0-9._-]{2,63}$` | `SOURCE_NODE_INVALID` |
| `sequence` | integer ≥ 0 | `SEQUENCE_INVALID` |
| `captured_at` | ISO-8601 **with** UTC offset | `TIMESTAMP_NOT_STRING`, `TIMESTAMP_UNPARSEABLE`, `TIMESTAMP_NAIVE` |
| `channel_id` | dotted lowercase | `CHANNEL_ID_INVALID` |
| `value` | finite number | `VALUE_NOT_NUMERIC`, `VALUE_NOT_FINITE` |
| `unit` | controlled vocabulary per channel stem | `UNIT_MISSING`, `UNIT_NOT_IN_VOCABULARY` |
| `precision` | integer 0–9 | `PRECISION_INVALID` |
| `uncertainty` | number ≥ 0 | `UNCERTAINTY_INVALID` |
| `update_interval_ms` | integer 1–600 000 | `UPDATE_INTERVAL_INVALID` |
| `status` | `LIVE \| CALIBRATED \| SIMULATED \| PROTOTYPE` | `STATUS_INVALID` |
| `quality.sensor_ok` | boolean | `SENSOR_OK_INVALID` |
| `quality.fault_flags` | list of strings | `FAULT_FLAGS_INVALID` |
| `transport.protocol` | `BLE \| USB \| WiFi \| Serial \| Loopback \| Replay` | `TRANSPORT_PROTOCOL_INVALID` |
| `evidence_seal.algorithm` | `SHA3-256` | `SEAL_ALGORITHM_UNSUPPORTED` |
| `evidence_seal.canonicalization` | `hdi-jcs-1` | `CANONICALIZATION_UNSUPPORTED` |
| `signature.algorithm` | `NONE` (only implemented value) | `SIGNATURE_ALGORITHM_UNSUPPORTED` |

### 2.2 Canonicalisation and sealing (`hdi-jcs-1`)

1. Object keys sorted by code point; no insignificant whitespace; UTF-8.
2. Floats use shortest round-trip representation; `NaN`/`Inf` are rejected.
3. **`evidence_seal.hash` and `signature.value` are set to `null` before hashing**, so a seal can be
   recomputed from the envelope it protects.
4. `hash = SHA3-256(canonical_bytes)`.

The parsed envelope retains the **received** hash (`seal_hash`) rather than recomputing it, so
tampering is detectable. A hash recomputed from current values always matches itself and proves
nothing — this was a real defect found and fixed during development (`CHANGELOG.md`, 2.5.0-rc2).

---

## 3. Ingest contract

`POST /api/v1/telemetry` implements the sequence the source audit listed as missing:

```
parse → schema/type validation → source authorisation → timestamp & sequence window
      → status/quality screening → canonicalise & verify integrity → persist raw envelope
      → derive normalised event → publish → acknowledge
```

| Response | HTTP | `action` | Meaning |
| --- | --- | --- | --- |
| Stored | `202` | `STORED` | Accepted, persisted, integrity verified or explicitly unverified |
| Duplicate | `200` | `DUPLICATE` | Same `message_id` seen before; idempotent, not double-counted |
| Quarantined | `200` | `QUARANTINED` | Structurally valid but untrusted: seal mismatch, sensor fault, fault flags. Stored for review, never used |
| Rejected | `422` | `REJECTED` | Contract failure: schema, range, sequence window, capture age. Not stored |

Rejection reasons are stable strings: `STATUS_INVALID`, `SEQUENCE_OUT_OF_WINDOW`,
`CAPTURE_TOO_OLD` (> 6 h), `CAPTURE_IN_FUTURE` (> 5 min), `SEQUENCE_OUT_OF_WINDOW`,
`EVIDENCE_SEAL_MISMATCH`, `SENSOR_FAULT`, `FAULT_FLAGS:<flag>`.

Window constants (documented, not magic): `MAX_CAPTURE_AGE = 6 h`, `MAX_FUTURE_SKEW = 5 min`,
`MAX_SEQUENCE_LAG = 1000`.

---

## 4. Published state frame

`GET /api/v1/state`, `GET /api/v1/history`, `WS /api/v1/stream`:

```json
{
  "kind": "state_frame",
  "index": 126,
  "t_ms": 12600.0,
  "captured_at": "2026-09-22T06:30:12.600Z",
  "state": { "damage": 0.15, "inflammation": 0.17, "stress": 0.26,
             "fatigue": 0.25, "reserve": 0.74 },
  "state_vector": [0.15, 0.17, 0.26, 0.25, 0.74],
  "control": [0.0],
  "control_requested": [0.0],
  "sensor": [0.12, 0.08],
  "saturation_norm": 0.0015,
  "clipped_channels": 0,
  "status": "OK",
  "detail": null,
  "governor": { "ok": true, "code": "NOMINAL", "action": "NOMINAL", "authority": 1.0 },
  "engine_health": { "ok": true, "code": "NOMINAL", "action": "NOMINAL" },
  "engine_stats": { "steps": 126, "faults": 0, "clip_rate": 0.0 },
  "provenance": {
    "data_mode": "SIMULATED",
    "evidence_label": "SIMULATED",
    "source_node": "sim-node-01",
    "claim": "state estimate of a simulation object — not a clinical measurement"
  },
  "model_version": "prometheus-2.5.0",
  "param_version": "params-2026-09-22-a"
}
```

Every frame carries its own provenance, including `model_version` and `param_version`, so any number
on screen can be traced to the exact configuration that produced it.

---

## 5. Aggregate export

`GET /api/v1/export/json`, `GET /api/v1/export/csv` — the only egress path.

```json
{
  "export_kind": "aggregate_window",
  "contains_raw_biosignals": false,
  "frame_count": 600,
  "invalid_frames": 0,
  "channels": [
    { "channel": "stress", "count": 600, "min": 0.24, "max": 0.71,
      "mean": 0.31, "p95": 0.52, "first_t_ms": 0.0, "last_t_ms": 59900.0 }
  ],
  "governor_action_counts": { "NOMINAL": 512, "THROTTLE": 88 },
  "caveat": "Aggregates of a SIMULATED or PROTOTYPE-labelled state estimate…"
}
```

The export function does not have a raw-signal code path. If raw retention is ever required, it stays
inside the local hash-chained audit log and is a separate, reviewed action.
