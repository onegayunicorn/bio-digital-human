from __future__ import annotations
import json
from datetime import datetime, timezone
from fastapi import FastAPI, Header, HTTPException, Request, WebSocket, WebSocketDisconnect
from .models import DashboardSummary, IngestAck, TelemetryEnvelope, sha3_digest
from .processing import BiofeedbackProcessor
from .security import AuthError, DeviceKeyStore, ReplayGuard, verify_request
from .store import TelemetryStore

app = FastAPI(title="Bio-Digital Telemetry Hub", version="1.0.0")
store = TelemetryStore()
processor = BiofeedbackProcessor()
keys = DeviceKeyStore.from_env()
replay = ReplayGuard()
subscribers: set[WebSocket] = set()

@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "telemetry-hub", "time": datetime.now(timezone.utc).isoformat()}

@app.post("/v1/telemetry", response_model=IngestAck, status_code=202)
async def ingest(request: Request, x_device_id: str = Header(...), x_timestamp: str = Header(...),
                 x_nonce: str = Header(...), x_signature: str = Header(...)):
    body = await request.body()
    try:
        verify_request(method="POST", path="/v1/telemetry", body=body, device_id=x_device_id,
                       timestamp=x_timestamp, nonce=x_nonce, signature=x_signature,
                       key_store=keys, replay_guard=replay)
    except AuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    try:
        envelope = TelemetryEnvelope.model_validate_json(body)
    except Exception as exc:
        raise HTTPException(status_code=422, detail="invalid telemetry envelope") from exc
    if envelope.device_id != x_device_id:
        raise HTTPException(status_code=403, detail="device header does not match payload")
    if envelope.evidence_seal and envelope.evidence_seal.hash != sha3_digest(envelope):
        return IngestAck(message_id=envelope.message_id, accepted=False, action="QUARANTINED",
                         sequence=envelope.sequence, integrity="FAILED", reason="hash mismatch")
    action = store.ingest(envelope)
    if action == "OUT_OF_ORDER":
        return IngestAck(message_id=envelope.message_id, accepted=False, action=action,
                         sequence=envelope.sequence, integrity="VERIFIED", reason="sequence not newer")
    summary = processor.process(envelope)
    event = {"type": "dashboard.summary", "data": summary.model_dump(mode="json")}
    dead = []
    for ws in subscribers:
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.append(ws)
    for ws in dead:
        subscribers.discard(ws)
    return IngestAck(message_id=envelope.message_id, accepted=True, action=action,
                     sequence=envelope.sequence, integrity="VERIFIED" if envelope.evidence_seal else "UNSEALED")

@app.get("/v1/devices/{device_id}/dashboard", response_model=DashboardSummary)
def dashboard(device_id: str):
    latest = store.latest(device_id)
    if latest is None:
        raise HTTPException(status_code=404, detail="no telemetry for device")
    return processor.process(latest)

@app.websocket("/v1/ws")
async def websocket_bus(ws: WebSocket):
    await ws.accept()
    subscribers.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        subscribers.discard(ws)
