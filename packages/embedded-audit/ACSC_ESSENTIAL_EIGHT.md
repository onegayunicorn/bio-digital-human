# ACSC Essential Eight — mapping (draft)

**Status: DRAFT MAPPING — NOT an assessment against the ACSC Maturity Model.**
Assessor: `<unassigned>` · Date: `<unassigned>` · Version: 2.5.0

> The Essential Eight is targeted at organisations and is assessed per maturity level. This project is
> a prototype, and no maturity level is claimed. The table records which strategies have a
> corresponding design decision in this repository, and — more usefully — which do not.
>
> Confirm current strategy definitions and assessment requirements with the ACSC's published guidance.

---

## 1. Mapping

| Strategy | What exists here | Gap |
| --- | --- | --- |
| **1. Application control** | Only declared dependencies are used; no dynamic code loading; the hub has no plugin or eval path | No allow-listing or application-control enforcement on the host devices; no signed-build enforcement at install time |
| **2. Patch applications** | Dependency set is minimal by design (Python stdlib + optional FastAPI/NumPy); CI runs the suite on every change | No automated dependency-vulnerability scanning configured; no defined patch SLA |
| **3. Configure Microsoft Office macro settings** | Not applicable — no Office documents in the runtime path | n/a |
| **4. User application hardening** | No browser-exposed plugin surface; the PWA has a strict content policy; there is no writable control characteristic on the BLE service | Browser hardening guidance not applied or reviewed; no CSP audit |
| **5. Restrict administrative privileges** | Container deployment drops capabilities, sets `no-new-privileges`, and runs without host privileges; the hub separates read and control endpoints | On a phone/Termux host the operator *is* the administrator; no privilege separation there |
| **6. Patch operating systems** | Out of scope for the codebase | No OS patch policy for the phone or workstation |
| **7. Multi-factor authentication** | Bearer token (single factor) for remote access; loopback default | **MFA not implemented.** A single bearer token is the only remote control |
| **8. Regular backups** | Audit-log backup procedure documented (`OPERATIONS.md` §3); log is append-only and tamper-evident | No automated backup, no restore test, no encryption-at-rest policy |

## 2. Honest summary

* **Implemented in code:** minimal dependency surface, least-privilege container posture, loopback-only
  default, timing-safe token comparison, append-only tamper-evident logging, provenance on every datum.
* **Not implemented:** MFA, dependency vulnerability scanning, firmware signing keys, TLS in the hub,
  formal threat model, security assessment, key management/rotation policy, backup automation and
  restore testing.
* **Risk consequence:** the reference deployment is a single-user, loopback-only system on a personal
  device. That reduces exposure substantially but does **not** constitute a security posture suitable
  for multi-user or internet-facing operation. Do not deploy that way without the missing controls.

## 3. Security-relevant design decisions (evidence in code)

| Decision | Where |
| --- | --- |
| Loopback-only unless a token is configured | `api/app.py::require_access`, `test_loopback_only_mode_blocks_remote_clients` |
| Timing-safe token comparison | `hmac.compare_digest` in `api/app.py`, `sealing.constant_time_equal` |
| No raw biosignal egress | `telemetry/export.py`, `test_export_is_aggregate_only` |
| Envelope tampering detected and quarantined, never silently accepted | `api/state_store.py`, `test_tampered_seal_is_quarantined_not_stored` |
| Audit log tamper evidence (edit/delete/reorder) | `sealing.verify_chain`, `test_audit_chain.py` |
| No secrets in the repository; no outbound calls | grep-able; `.env.example` contains names only |
| Notify-only BLE (no writable control characteristic) | `firmware/.../ble_service.c` |

## 4. Required before any multi-user or remote deployment

1. Threat model with data-flow diagram and trust boundaries, reviewed by a second party.
2. TLS termination with certificate management, or an authenticated tunnel only.
3. Replace the bearer token with an authenticated session model; add MFA for administrative actions.
4. Firmware signing with a managed key (and a documented rotation/revocation procedure).
5. Dependency and container scanning in CI, with a patch SLA.
6. Automated encrypted backups with a tested restore procedure.
7. Independent penetration test of the hub and the BLE surface.
