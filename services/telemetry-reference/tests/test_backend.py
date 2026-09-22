import hashlib, hmac, json, time, uuid
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parents[1]))
from fastapi.testclient import TestClient
from backend.app.main import app, keys
from backend.app.models import TelemetryEnvelope
from backend.app.security import signing_string

SECRET=b"test-secret"
DEVICE="test-device"
keys.keys[DEVICE]=SECRET
client=TestClient(app)

def envelope(seq=1):
    return {"schema_version":"telemetry.v1","message_id":str(uuid.uuid4()),"device_id":DEVICE,
      "firmware_version":"test-1.0","sequence":seq,"captured_at":"2026-09-22T06:30:00Z","status":"SIMULATED",
      "readings":[
       {"channel_id":"vitals.heart_rate_bpm","value":72.0,"unit":"bpm","precision":1,"uncertainty":1.0,"quality":0.99},
       {"channel_id":"vitals.respiratory_rate_bpm","value":16.0,"unit":"breaths_per_min","precision":1,"uncertainty":0.5,"quality":0.99},
       {"channel_id":"vitals.hrv_ms","value":52.0,"unit":"ms","precision":1,"uncertainty":2.0,"quality":0.95},
       {"channel_id":"neural.alpha_power","value":1.0,"unit":"relative_power","precision":2,"uncertainty":0.05,"quality":0.90},
       {"channel_id":"neural.beta_power","value":0.8,"unit":"relative_power","precision":2,"uncertainty":0.05,"quality":0.90}]}

def signed(body, nonce=None):
    nonce=nonce or str(uuid.uuid4()); ts=str(time.time())
    b=json.dumps(body,separators=(",",":"),sort_keys=True).encode()
    msg=signing_string("POST","/v1/telemetry",ts,nonce,b)
    sig=hmac.new(SECRET,msg,hashlib.sha256).hexdigest()
    return b,{"X-Device-ID":DEVICE,"X-Timestamp":ts,"X-Nonce":nonce,"X-Signature":sig}

def test_valid_ingest_and_dashboard_scale():
    body, headers=signed(envelope(100))
    r=client.post('/v1/telemetry',content=body,headers=headers)
    assert r.status_code==202
    assert r.json()['accepted'] is True
    summary=client.get(f'/v1/devices/{DEVICE}/dashboard')
    assert summary.status_code==200
    assert all(0 <= m['value'] <= 1 for m in summary.json()['metrics'])

def test_duplicate_is_idempotent():
    body_obj=envelope(101); body, headers=signed(body_obj)
    assert client.post('/v1/telemetry',content=body,headers=headers).json()['action']=='STORED'
    # Same body with a new auth nonce is a duplicate message, not a second event.
    body2, headers2=signed(body_obj)
    assert client.post('/v1/telemetry',content=body2,headers=headers2).json()['action']=='DUPLICATE'

def test_replayed_nonce_rejected():
    body, headers=signed(envelope(102), nonce='fixed-replay-nonce')
    assert client.post('/v1/telemetry',content=body,headers=headers).status_code==202
    assert client.post('/v1/telemetry',content=body,headers=headers).status_code==401

def test_unknown_device_rejected():
    body_obj=envelope(103); body, headers=signed(body_obj)
    headers['X-Device-ID']='unknown'
    assert client.post('/v1/telemetry',content=body,headers=headers).status_code==401
