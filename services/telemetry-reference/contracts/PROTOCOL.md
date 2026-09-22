# Telemetry Protocol v1

## Transport

HTTPS is required between the mobile/LAN bridge and FastAPI. TLS certificate validation is mandatory. The ESP32 may use a local bridge if it cannot safely maintain the HTTPS session itself.

## Request

`POST /v1/telemetry` with a JSON `telemetry.v1` envelope and headers `X-Device-ID`, `X-Timestamp`, `X-Nonce`, and `X-Signature`.

## Authentication

The reference profile uses a per-device HMAC-SHA256 key. The signature input is:

```text
METHOD\nPATH\nUNIX_TIMESTAMP\nNONCE\nSHA256(REQUEST_BODY)
```

The server rejects unknown devices, stale timestamps outside ±300 seconds, repeated nonces, and invalid signatures. Production provisioning should use a secret manager or secure element, key rotation, revocation, TLS, and audited device enrolment.

## Delivery semantics

The combination of `message_id` and `sequence` provides idempotent delivery. Retries preserve the same message ID and sequence. A fresh nonce is required per transport attempt. The server stores only a newer sequence for a device and reports duplicates or out-of-order messages explicitly.

## Retry policy

Retry network failures, HTTP 429, and HTTP 5xx with bounded exponential backoff. Do not retry authentication, authorisation, schema, or contract errors. Offline devices use a bounded durable queue and must expose queue depth and dropped-message counts.

## Error model

Responses contain `accepted`, `action`, `sequence`, `integrity`, and an optional reason. A producer must treat `QUARANTINED`, `REJECTED`, and `OUT_OF_ORDER` as operational events requiring correction or review, not as successful telemetry delivery.
