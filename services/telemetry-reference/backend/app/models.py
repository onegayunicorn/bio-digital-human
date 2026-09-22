from __future__ import annotations
from datetime import datetime, timezone
from enum import Enum
from hashlib import sha3_256
import json
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

class TelemetryStatus(str, Enum):
    LIVE = "LIVE"
    CALIBRATED = "CALIBRATED"
    SIMULATED = "SIMULATED"
    PROTOTYPE = "PROTOTYPE"

class Reading(BaseModel):
    model_config = ConfigDict(extra="forbid")
    channel_id: str = Field(pattern=r"^[a-z0-9_.-]{1,80}$")
    value: float
    unit: str = Field(min_length=1, max_length=32)
    precision: int = Field(ge=0, le=12)
    uncertainty: float = Field(ge=0)
    quality: float = Field(default=1.0, ge=0, le=1)

    @field_validator("value")
    @classmethod
    def finite_value(cls, value: float) -> float:
        if value != value or value in (float("inf"), float("-inf")):
            raise ValueError("value must be finite")
        return value

class EvidenceSeal(BaseModel):
    model_config = ConfigDict(extra="forbid")
    algorithm: str = "SHA3-256"
    canonicalization: str = "JCS-like-sorted-json"
    hash: str = Field(pattern=r"^[0-9a-f]{64}$")

class TelemetryEnvelope(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: str = Field(default="telemetry.v1", pattern=r"^telemetry\.v1$")
    message_id: UUID
    device_id: str = Field(pattern=r"^[a-zA-Z0-9._-]{1,64}$")
    firmware_version: str = Field(min_length=1, max_length=128)
    sequence: int = Field(ge=0)
    captured_at: datetime
    status: TelemetryStatus
    readings: List[Reading] = Field(min_length=1, max_length=64)
    evidence_seal: Optional[EvidenceSeal] = None

    @field_validator("captured_at")
    @classmethod
    def timezone_required(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("captured_at must include a timezone")
        return value.astimezone(timezone.utc)

def canonical_payload(envelope: TelemetryEnvelope) -> bytes:
    data = envelope.model_dump(mode="json", exclude={"evidence_seal"})
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()

def sha3_digest(envelope: TelemetryEnvelope) -> str:
    return sha3_256(canonical_payload(envelope)).hexdigest()

class IngestAck(BaseModel):
    message_id: UUID
    accepted: bool
    action: str
    sequence: int
    integrity: str
    reason: Optional[str] = None

class DashboardMetric(BaseModel):
    name: str
    value: float
    unit: str
    quality: float
    scale: str = "0..1"

class DashboardSummary(BaseModel):
    device_id: str
    last_sequence: int
    metrics: List[DashboardMetric]
    generated_at: datetime
