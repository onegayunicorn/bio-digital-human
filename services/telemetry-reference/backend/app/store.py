from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict
from .models import TelemetryEnvelope

@dataclass
class DeviceState:
    last_sequence: int = -1
    messages: Dict[str, TelemetryEnvelope] = field(default_factory=dict)

class TelemetryStore:
    def __init__(self):
        self.devices: Dict[str, DeviceState] = {}

    def ingest(self, envelope: TelemetryEnvelope) -> str:
        state = self.devices.setdefault(envelope.device_id, DeviceState())
        key = str(envelope.message_id)
        if key in state.messages:
            return "DUPLICATE"
        if envelope.sequence <= state.last_sequence:
            return "OUT_OF_ORDER"
        state.messages[key] = envelope
        state.last_sequence = envelope.sequence
        return "STORED"

    def latest(self, device_id: str) -> TelemetryEnvelope | None:
        state = self.devices.get(device_id)
        if not state or not state.messages:
            return None
        return max(state.messages.values(), key=lambda x: x.sequence)
