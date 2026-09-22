from __future__ import annotations
from dataclasses import dataclass
from hashlib import sha256
import hmac
import time
from typing import Dict

class AuthError(Exception):
    pass

@dataclass
class DeviceKeyStore:
    keys: Dict[str, bytes]

    @classmethod
    def from_env(cls) -> "DeviceKeyStore":
        # Production deployments should load this from a secret manager.
        import os
        raw = os.getenv("DEVICE_KEYS", "demo-device-01:replace-me")
        keys = {}
        for item in raw.split(","):
            if ":" in item:
                device, secret = item.split(":", 1)
                keys[device] = secret.encode()
        return cls(keys)

class ReplayGuard:
    def __init__(self, ttl_seconds: int = 300):
        self.ttl_seconds = ttl_seconds
        self._seen: Dict[str, float] = {}

    def accept(self, nonce: str, now: float | None = None) -> bool:
        now = now or time.time()
        self._seen = {k: t for k, t in self._seen.items() if now - t <= self.ttl_seconds}
        if nonce in self._seen:
            return False
        self._seen[nonce] = now
        return True

def signing_string(method: str, path: str, timestamp: str, nonce: str, body: bytes) -> bytes:
    body_hash = sha256(body).hexdigest()
    return f"{method.upper()}\n{path}\n{timestamp}\n{nonce}\n{body_hash}".encode()

def verify_request(*, method: str, path: str, body: bytes, device_id: str, timestamp: str,
                   nonce: str, signature: str, key_store: DeviceKeyStore,
                   replay_guard: ReplayGuard, max_skew_seconds: int = 300) -> None:
    key = key_store.keys.get(device_id)
    if not key:
        raise AuthError("unknown device")
    try:
        sent_at = float(timestamp)
    except ValueError as exc:
        raise AuthError("invalid timestamp") from exc
    if abs(time.time() - sent_at) > max_skew_seconds:
        raise AuthError("timestamp outside allowed skew")
    if not replay_guard.accept(f"{device_id}:{nonce}"):
        raise AuthError("replayed nonce")
    expected = hmac.new(key, signing_string(method, path, timestamp, nonce, body), sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise AuthError("invalid signature")
