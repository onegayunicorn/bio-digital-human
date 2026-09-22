from __future__ import annotations
from dataclasses import dataclass
from math import isfinite
from typing import Dict
from .models import DashboardMetric, DashboardSummary, TelemetryEnvelope
from datetime import datetime, timezone

@dataclass
class Baseline:
    alpha_beta: float = 1.0
    heart_rate: float = 70.0
    respiratory_rate: float = 16.0
    hrv_ms: float = 50.0
    initialized: bool = False

class BiofeedbackProcessor:
    """Non-clinical signal processing for UI feedback.

    All output metrics use the same normalized 0..1 scale. This is not a
    diagnostic or treatment algorithm. Production clinical use requires
    validated models, calibrated sensors, and domain approval.
    """
    def __init__(self, alpha: float = 0.1):
        self.alpha = alpha
        self.baselines: Dict[str, Baseline] = {}

    def _baseline(self, device_id: str) -> Baseline:
        return self.baselines.setdefault(device_id, Baseline())

    @staticmethod
    def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
        return max(low, min(high, float(value)))

    @staticmethod
    def _reading(envelope: TelemetryEnvelope, channel: str) -> float | None:
        for r in envelope.readings:
            if r.channel_id == channel and isfinite(r.value):
                return r.value
        return None

    def process(self, envelope: TelemetryEnvelope) -> DashboardSummary:
        baseline = self._baseline(envelope.device_id)
        hr = self._reading(envelope, "vitals.heart_rate_bpm")
        rr = self._reading(envelope, "vitals.respiratory_rate_bpm")
        hrv = self._reading(envelope, "vitals.hrv_ms")
        alpha = self._reading(envelope, "neural.alpha_power")
        beta = self._reading(envelope, "neural.beta_power")
        quality = min((r.quality for r in envelope.readings), default=0.0)

        if alpha is not None and beta is not None and alpha > 0:
            ratio = beta / alpha
            if not baseline.initialized:
                baseline.alpha_beta = ratio
            else:
                baseline.alpha_beta = (1-self.alpha)*baseline.alpha_beta + self.alpha*ratio
        if not baseline.initialized:
            baseline.heart_rate = hr if hr is not None else baseline.heart_rate
            baseline.respiratory_rate = rr if rr is not None else baseline.respiratory_rate
            baseline.hrv_ms = hrv if hrv is not None else baseline.hrv_ms
            baseline.initialized = True
        else:
            for attr, value in (("heart_rate", hr), ("respiratory_rate", rr), ("hrv_ms", hrv)):
                if value is not None:
                    old = getattr(baseline, attr)
                    setattr(baseline, attr, (1-self.alpha)*old + self.alpha*value)

        ratio = (beta / alpha) if alpha and beta and alpha > 0 else baseline.alpha_beta
        cognitive_load = self._clamp((ratio / max(baseline.alpha_beta, 1e-6) - 0.5) / 1.5)
        hr_component = self._clamp(abs((hr or baseline.heart_rate) - baseline.heart_rate) / 40.0)
        rr_component = self._clamp(abs((rr or baseline.respiratory_rate) - baseline.respiratory_rate) / 10.0)
        hrv_component = self._clamp(1.0 - (hrv or baseline.hrv_ms) / max(baseline.hrv_ms * 2.0, 1.0))
        stress = self._clamp(0.45*hr_component + 0.25*rr_component + 0.30*hrv_component)
        return DashboardSummary(
            device_id=envelope.device_id,
            last_sequence=envelope.sequence,
            generated_at=datetime.now(timezone.utc),
            metrics=[
                DashboardMetric(name="cognitive_load", value=round(cognitive_load, 4), unit="ratio", quality=quality),
                DashboardMetric(name="stress_index", value=round(stress, 4), unit="ratio", quality=quality),
                DashboardMetric(name="signal_quality", value=round(quality, 4), unit="ratio", quality=quality),
            ],
        )
