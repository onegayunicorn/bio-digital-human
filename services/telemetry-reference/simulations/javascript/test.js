import assert from 'node:assert/strict';
import { BiofeedbackProcessor, validateEnvelope } from './biofeedback.js';
const envelope = {schema_version:'telemetry.v1', device_id:'sim-device-01', sequence:1, readings:[
 {channel_id:'vitals.heart_rate_bpm',value:72,uncertainty:1,quality:.99},
 {channel_id:'vitals.respiratory_rate_bpm',value:16,uncertainty:.5,quality:.99},
 {channel_id:'vitals.hrv_ms',value:52,uncertainty:2,quality:.95},
 {channel_id:'neural.alpha_power',value:1,uncertainty:.05,quality:.9},
 {channel_id:'neural.beta_power',value:.8,uncertainty:.05,quality:.9}]};
validateEnvelope(envelope);
const summary = new BiofeedbackProcessor().process(envelope);
for (const value of Object.values(summary.metrics)) assert.ok(value >= 0 && value <= 1);
assert.throws(() => validateEnvelope({...envelope, schema_version:'bad'}));
console.log('javascript tests passed');
