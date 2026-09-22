# Operations runbook

## 1. Health triage

| Symptom | First check | Likely cause | Action |
| --- | --- | --- | --- |
| `/api/health` unreachable | Is the hub running? `HDI_ENGINE_AUTOSTART`, service state | Service stopped, port conflict | Restart the service; confirm the port is free |
| `/api/v1/status` returns 401 | Host header / token config | Hub in loopback-only mode and the client is remote, or token mismatch | Access from the device itself, or set the same token on client and server |
| `/api/v1/state` returns 503 | Has any frame been published? | `HDI_ENGINE_AUTOSTART=0` and no manual tick, or the loop died | `POST /api/v1/tick`, or restart with autostart enabled |
| Dashboard shows `RECOVERY` | `governor.code` on the frame | Reserve below floor | Expected behaviour: enhancement loops are disabled. Treat as "the operator should rest", not as a fault to clear |
| Dashboard shows `THROTTLE` repeatedly | `engine_stats.clip_rate`, `sensor` values | Sensor deviation pinned near 1.0, or calibration is stale | Re-run baseline capture; check electrode contact and LED current |
| `INPUT_FAULT` counter climbing | `engine_stats.faults`, node side `sensor_invalid` | Loose electrode, LED current, motion, or a partially failed frame stream | Inspect the node log; check `MOTION_REJECT` rate; re-seat electrodes |
| `SEQUENCE_OUT_OF_WINDOW` rejections | `ingest_counters.rejected` | Node rebooted (sequence reset) or frames replayed | Verify with the node uptime; dedupe is by `message_id`, so replays are idempotent only when ids are reused |
| `EVIDENCE_SEAL_MISMATCH` | `ingest_counters.quarantined`, audit log | Envelope modified in transit or a client bug in sealing | Treat as a security event; inspect the quarantined records, do not "fix" by disabling the check |
| Audit log grows unexpectedly | `du` on `HDI_DATA_DIR` | Loop logging at a high rate | Rotate daily files; aggregates are the intended export, not the raw log |

---

## 2. Routine procedures

### Daily
* Confirm `/api/health` reports the expected `data_mode` (`SIMULATED` during evaluation).
* Check `governor` codes seen in the last session (`GET /api/v1/status`).
* Confirm the audit chain still verifies: `sovereign-hdi seal-check var/audit-<date>.ndjson`.

### Weekly
* Inspect electrode/optics condition and clean per the manufacturer's instructions.
* Export aggregates for the record: `curl -s localhost:8077/api/v1/export/json -o weekly.json`.
* Verify the last release hash: `sha256sum -c MANIFEST.sha256`.

### After a firmware change
1. Run the native framing test (see `TESTING.md` §3).
2. Flash, then confirm the boot self-test log line.
3. Confirm frame counters on the host: `frames_decoded` increases, `crc_errors` stays at 0.

---

## 3. Backup and retention

```bash
tar -czf sovereign-hdi-var-$(date +%F).tgz var/   # audit log is the evidence record
```

* The audit log is **append-only**; never edit it (editing breaks the chain and the record is then
  worthless as evidence).
* Recommended retention for a prototype: 30 days of raw log, aggregates retained indefinitely.
  This is a placeholder policy, **not** an approved retention schedule (`PRIVACY.md`).
* On removable media, encrypt at rest. The log contains pseudonymous identifiers and state estimates.

---

## 4. Incident handling

| Incident | Immediate action | Follow-up |
| --- | --- | --- |
| Skin reaction at an electrode site | Stop the session, remove electrodes, inspect the skin | Record the event, seek medical advice if it does not resolve, review electrode type and session duration |
| Any electrical sensation | **Stop immediately**, disconnect the node, do not reconnect while the supply could be mains-referenced | Do not resume until the supply and isolation are reviewed by someone competent to do so |
| Suspected data exposure | Rotate `HDI_API_TOKEN`, stop remote access, snapshot the audit log | Determine the exposure window; the log tells you exactly which frames were accepted and when |
| Suspected log tampering | Do not delete anything | Run `seal-check`; the failing index localises the edit; preserve the file as-is |
| Device overheating | Stop the session, power down | Thermal design is not validated (`LIMITATIONS.md` §4) — treat any heat as a design fault |

An incident log entry records: timestamp (UTC), session id, what was observed, what was changed, and
who was informed. Keep it in the same place as the audit log so the two can be read together.

---

## 5. Operator script (simulated session, end to end)

```bash
# Terminal 1 — hub
HDI_DATA_MODE=simulated HDI_DATA_DIR=./var uvicorn sovereign_hdi.api.app:app --port 8077

# Terminal 2 — drive and inspect
curl -s localhost:8077/api/health
for i in $(seq 1 20); do curl -s -X POST localhost:8077/api/v1/tick > /dev/null; done
curl -s localhost:8077/api/v1/status | python -m json.tool | head -30
curl -s localhost:8077/api/v1/export/json | python -c "import json,sys; print(json.load(sys.stdin)['payload']['contains_raw_biosignals'])"

# Terminal 3 — verify the record
sovereign-hdi seal-check var/audit-$(date -u +%Y%m%d).ndjson
```

This exercises the whole path: ingest → engine → governor → publish → audit → seal verification. It is
the recommended smoke test after any change.
