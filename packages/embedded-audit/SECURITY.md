# Security policy and threat model

Status: **prototype**. No independent security assessment has been performed. Do not deploy this on an
untrusted network or in a multi-user configuration without the controls listed in §5.

---

## 1. Reporting

Report a suspected vulnerability privately to the maintainer of your copy of this repository. Include:
the component (software / firmware / dashboard), the version (`VERSION` plus the `param_version` from
the frame), a reproduction, and whether any real subject data was involved. If real biosignal data may
have been exposed, treat it as a data-breach candidate and follow `docs/compliance/APP_PRIVACY_ASSESSMENT.md`
§3 — assume notification obligations apply until advised otherwise.

---

## 2. Assets worth protecting

| Asset | Why it matters | Where it lives |
| --- | --- | --- |
| Raw biosignals | Sensitive personal information by any reasonable reading | RAM only, never persisted by the reference implementation |
| State estimates | Inferred physiological state; re-identifiable in context | Local audit log (NDJSON) |
| Calibration profiles | Baseline physiology, effectively a biometric | Local config file |
| Audit log integrity | The record that makes any claim reviewable | Local filesystem, hash-chained |
| The node's BLE surface | Physical-adjacency attack surface | Firmware |
| Hub control endpoint | The only path that changes the control vector | Local hub (HTTP) |

---

## 3. Trust boundaries

```
[ sensors ] --(I2C/ADC, in-device)--> [ node firmware ] --(BLE, untrusted)--> [ host ]
                                                                            |
                                                        [ hub: trusted process, loopback ]
                                                                            |
                                                        [ dashboard: untrusted-ish client ]
```

* **BLE is hostile.** Anyone in radio range can observe notifications and attempt connection.
* **The hub is trusted but small.** It validates everything arriving from a node; it does not trust
  the LAN.
* **The browser is untrusted input.** It renders what the hub sends and can be manipulated; it holds
  no authority.

---

## 4. Controls implemented (each has a code reference)

| Control | Implementation |
| --- | --- |
| Loopback-only by default | `api/app.py::require_access` — non-loopback clients are rejected unless `HDI_API_TOKEN` is set |
| Timing-safe token comparison | `hmac.compare_digest` (HTTP and WebSocket) |
| Message integrity | SHA3-256 envelope seals; a mismatch is **quarantined**, never stored as valid |
| Tamper-evident audit log | Hash chain across NDJSON records; `seal-check` localises an edit |
| Idempotent ingest | Dedupe by `message_id`; replays do not double-count |
| Input validation before arithmetic | Schema, range, finiteness, dimension checks; fail-closed |
| No raw-signal egress | `telemetry/export.py` has no raw path; only aggregates |
| No command channel to the node | Firmware is notify-only; the BLE characteristic is not writable |
| No autonomous control | The control vector is only ever set by an authenticated user request |
| Bounded resource use | Fixed-size history ring buffer, bounded subscriber count, per-client queue drops |
| No secrets in code | Names only in `.env.example`; the manifest excludes `.env` |

---

## 5. Not implemented (do not assume otherwise)

* TLS termination inside the hub (put it behind a proxy, or keep it on loopback).
* Multi-factor authentication — a single bearer token is the only remote control.
* Key management, rotation or an HSM; **firmware signing is a CI hook with no key configured**.
* Signature authority: `signature.algorithm` accepts `NONE` only. A seal proves integrity, not origin.
* External timestamping or Merkle inclusion proofs.
* Dependency/container vulnerability scanning in CI, or a patch SLA.
* Rate limiting, request-size limits, or per-client quotas on the hub.
* Formal threat-model review, penetration test, or independent assessment.

---

## 6. Operational rules that carry security weight

1. **Run on loopback, or run with a token and a proxy.** There is no third option.
2. **Battery operation only while electrodes are attached.** This is an electrical-safety rule, but it
   is also the configuration in which no third-party power supply is present.
3. **Treat the audit log as evidence.** Never edit it; editing breaks the chain and destroys its value.
4. **Encrypt at rest.** Phone storage encryption plus an encrypted backup for `HDI_DATA_DIR`.
5. **Rotate the token immediately** if a device holding it is lost, and check the log for frames you
   cannot account for.
6. **Never paste a token into a chat, an issue, or a screenshot.** If it happens, treat it as
   compromised and rotate.

---

## 7. Abuse cases explicitly out of scope

This project will not implement, and will not accept patches for: stimulation output, dosing, neural
data writing, or any automatic loop that adjusts the control vector without a human action. Those are
excluded on evidence and safety grounds (`docs/CLAIMS_REGISTER.md` §3), not merely unbuilt.
