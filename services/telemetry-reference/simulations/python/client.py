from __future__ import annotations
import hashlib, hmac, json, time, uuid
from datetime import datetime, timezone
from typing import Callable

class TelemetryClient:
    """Reference client with bounded exponential retry and idempotent message IDs."""
    def __init__(self, post: Callable, base_url: str, device_id: str, secret: bytes,
                 max_attempts: int = 4, max_backoff_seconds: float = 8.0):
        self.post, self.base_url, self.device_id, self.secret = post, base_url.rstrip('/'), device_id, secret
        self.max_attempts, self.max_backoff_seconds = max_attempts, max_backoff_seconds

    def _signature(self, path: str, timestamp: str, nonce: str, body: bytes) -> str:
        digest = hashlib.sha256(body).hexdigest()
        message = f"POST\n{path}\n{timestamp}\n{nonce}\n{digest}".encode()
        return hmac.new(self.secret, message, hashlib.sha256).hexdigest()

    def send(self, envelope: dict) -> object:
        body = json.dumps(envelope, sort_keys=True, separators=(',', ':')).encode()
        path = '/v1/telemetry'
        last_error = None
        for attempt in range(self.max_attempts):
            timestamp = str(time.time())
            nonce = str(uuid.uuid4())
            headers = {'X-Device-ID': self.device_id, 'X-Timestamp': timestamp,
                       'X-Nonce': nonce, 'X-Signature': self._signature(path, timestamp, nonce, body)}
            try:
                response = self.post(self.base_url + path, content=body, headers=headers, timeout=5)
                if response.status_code in (401, 403, 409, 422):
                    raise RuntimeError(f'non-retryable telemetry error: {response.status_code}')
                if response.status_code >= 500:
                    raise RuntimeError(f'retryable server error: {response.status_code}')
                return response
            except Exception as exc:
                last_error = exc
                if attempt == self.max_attempts - 1:
                    raise
                time.sleep(min(self.max_backoff_seconds, 0.25 * (2 ** attempt)))
        raise last_error

def make_envelope(device_id: str, sequence: int, readings: list[dict], status: str = 'SIMULATED') -> dict:
    return {'schema_version': 'telemetry.v1', 'message_id': str(uuid.uuid4()), 'device_id': device_id,
            'firmware_version': 'sim-1.0.0', 'sequence': sequence,
            'captured_at': datetime.now(timezone.utc).isoformat(), 'status': status, 'readings': readings}
