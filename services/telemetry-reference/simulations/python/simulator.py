from __future__ import annotations
from datetime import datetime, timezone
from .client import make_envelope

class DeterministicBioSignalSimulator:
    """Replayable, non-clinical fixture generator. No random values or hardware claims."""
    def sample(self, sequence: int, phase: float = 0.0) -> dict:
        # Smooth fixture values model a changing session while remaining reproducible.
        hr = 70.0 + 4.0 * __import__('math').sin(phase)
        rr = 15.5 + 1.0 * __import__('math').sin(phase / 2)
        hrv = 52.0 - 5.0 * max(0.0, __import__('math').sin(phase))
        alpha = 1.0 + 0.1 * __import__('math').cos(phase)
        beta = 0.8 + 0.2 * max(0.0, __import__('math').sin(phase))
        return make_envelope('sim-device-01', sequence, [
            {'channel_id':'vitals.heart_rate_bpm','value':round(hr,3),'unit':'bpm','precision':3,'uncertainty':1.0,'quality':0.98},
            {'channel_id':'vitals.respiratory_rate_bpm','value':round(rr,3),'unit':'breaths_per_min','precision':3,'uncertainty':0.5,'quality':0.98},
            {'channel_id':'vitals.hrv_ms','value':round(hrv,3),'unit':'ms','precision':3,'uncertainty':2.0,'quality':0.95},
            {'channel_id':'neural.alpha_power','value':round(alpha,4),'unit':'relative_power','precision':4,'uncertainty':0.05,'quality':0.9},
            {'channel_id':'neural.beta_power','value':round(beta,4),'unit':'relative_power','precision':4,'uncertainty':0.05,'quality':0.9},
        ], status='SIMULATED')
