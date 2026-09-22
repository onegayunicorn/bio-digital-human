# Bio-Digital Telemetry Reference Implementation

A safe, non-invasive reference implementation replacing the conceptual ESP32–FastAPI interface with a versioned telemetry contract, signed ingestion, bounded retries, deterministic biofeedback processing, dashboard events, firmware boundaries, tests, and deployment documentation.

## Quick start

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. pytest -q
PYTHONPATH=. uvicorn backend.app.main:app --reload
```

The API exposes `GET /healthz`, `POST /v1/telemetry`, `GET /v1/devices/{device_id}/dashboard`, and a minimal `/v1/ws` event stream.

## Important safety boundary

All processing is **non-clinical and non-invasive**. The repository does not implement neural stimulation, direct cortical data upload, biological storage, high-voltage control, treatment, or diagnosis. Simulator records must use `status=SIMULATED`. Real deployment requires hardware, security, privacy, safety, and domain review.

## Layout

- `contracts/telemetry.schema.json` — versioned envelope schema.
- `backend/app/` — FastAPI, validation, HMAC authentication, replay guard, store, and processing.
- `simulations/python/` — deterministic simulator and retrying client.
- `simulations/javascript/` — matching normalized processor and signed client.
- `firmware/esp32/` — typed firmware-side contract boundary.
- `deploy/` — Dockerfile and Compose staging deployment.
- `tests/` — contract, auth, idempotency, and processing tests.
- `docs/PRODUCTION_BLUEPRINT.md` — full development, deployment, operations, and safety blueprint.

## Environment

For local testing, the default device key is `demo-device-01:replace-me`. Never use it outside local development. In deployment set `DEVICE_KEYS` through a secret manager, for example `esp32-s3-01:long-random-secret`.

## Protocol summary

`POST /v1/telemetry` requires `X-Device-ID`, `X-Timestamp`, `X-Nonce`, and `X-Signature`. The signature is HMAC-SHA256 over the method, path, timestamp, nonce, and SHA-256 body digest. Retries reuse `message_id` and sequence but use a fresh nonce. The server rejects stale timestamps, replayed nonces, invalid signatures, malformed payloads, and out-of-order sequences.
