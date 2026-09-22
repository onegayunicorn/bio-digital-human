export class BiofeedbackProcessor {
  constructor(alpha = 0.1) {
    this.alpha = alpha;
    this.baselines = new Map();
  }
  clamp(value, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, Number(value))); }
  baseline(deviceId) {
    if (!this.baselines.has(deviceId)) this.baselines.set(deviceId, { alphaBeta: 1, heartRate: 70, respiratoryRate: 16, hrvMs: 50, initialized: false });
    return this.baselines.get(deviceId);
  }
  reading(envelope, channel) {
    return envelope.readings.find(r => r.channel_id === channel && Number.isFinite(r.value))?.value ?? null;
  }
  process(envelope) {
    const b = this.baseline(envelope.device_id);
    const hr = this.reading(envelope, 'vitals.heart_rate_bpm');
    const rr = this.reading(envelope, 'vitals.respiratory_rate_bpm');
    const hrv = this.reading(envelope, 'vitals.hrv_ms');
    const alpha = this.reading(envelope, 'neural.alpha_power');
    const beta = this.reading(envelope, 'neural.beta_power');
    const quality = Math.min(...envelope.readings.map(r => r.quality ?? 1));
    if (alpha > 0 && beta != null) {
      const ratio = beta / alpha;
      b.alphaBeta = b.initialized ? (1-this.alpha)*b.alphaBeta + this.alpha*ratio : ratio;
    }
    if (!b.initialized) {
      b.heartRate = hr ?? b.heartRate; b.respiratoryRate = rr ?? b.respiratoryRate; b.hrvMs = hrv ?? b.hrvMs; b.initialized = true;
    } else {
      for (const [key, value] of [['heartRate', hr], ['respiratoryRate', rr], ['hrvMs', hrv]]) {
        if (value != null) b[key] = (1-this.alpha)*b[key] + this.alpha*value;
      }
    }
    const ratio = alpha > 0 && beta != null ? beta/alpha : b.alphaBeta;
    const load = this.clamp((ratio / Math.max(b.alphaBeta, 1e-6) - 0.5) / 1.5);
    const hrPart = this.clamp(Math.abs((hr ?? b.heartRate)-b.heartRate)/40);
    const rrPart = this.clamp(Math.abs((rr ?? b.respiratoryRate)-b.respiratoryRate)/10);
    const hrvPart = this.clamp(1-(hrv ?? b.hrvMs)/Math.max(b.hrvMs*2,1));
    const stress = this.clamp(0.45*hrPart + 0.25*rrPart + 0.30*hrvPart);
    return { device_id: envelope.device_id, last_sequence: envelope.sequence, scale: '0..1', metrics: {
      cognitive_load: Number(load.toFixed(4)), stress_index: Number(stress.toFixed(4)), signal_quality: Number(quality.toFixed(4))
    }};
  }
}

export function validateEnvelope(envelope) {
  if (envelope.schema_version !== 'telemetry.v1') throw new Error('unsupported schema version');
  if (!Number.isInteger(envelope.sequence) || envelope.sequence < 0) throw new Error('invalid sequence');
  if (!Array.isArray(envelope.readings) || envelope.readings.length === 0) throw new Error('readings required');
  for (const r of envelope.readings) {
    if (!Number.isFinite(r.value) || !Number.isFinite(r.uncertainty) || r.uncertainty < 0) throw new Error('invalid reading');
  }
  return true;
}
