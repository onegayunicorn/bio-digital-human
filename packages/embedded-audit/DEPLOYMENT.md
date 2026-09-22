# Deployment

Three supported topologies. Choose by trust boundary, not by convenience.

| Topology | Use when | Trust boundary |
| --- | --- | --- |
| **A. Edge node + phone gateway** | Primary sovereign deployment; no cloud; single-person use | Node (BLE) → phone (loopback hub + local PWA). Nothing leaves the device |
| **B. Containerised backend** | A workstation or NAS runs the hub; multiple local clients | LAN with a bearer token; TLS behind a proxy |
| **C. Static PWA only** | Demonstration, evaluation, design review | Browser only; SIMULATED mode; no telemetry at all |

**Hard pre-condition for A and B with real sensing:** never operate the node while it is connected to a
mains-powered supply. Battery-powered SELV operation is the primary electrical-safety control
available to this design (`SAFETY.md` §5).

---

## 1. Development setup

```bash
# Python 3.11+ (3.12 tested). NumPy optional; the package runs without it.
cd software && python -m pip install -e ".[dev]"
python -m pytest -q                       # full suite
python -m sovereign_hdi model-card        # frozen configuration + provenance
python -m sovereign_hdi simulate --minutes 5 --verbose

# Hub (needs the api extra)
uvicorn sovereign_hdi.api.app:app --host 127.0.0.1 --port 8077

# Dashboard
cd ../dashboard && npm install && npm run dev     # http://localhost:5173
```

---

## 2. Topology A — ESP32-S3 node + Samsung A17 gateway (Termux)

### 2.1 Flash the node

```bash
cd firmware/esp32-omniroot
pio run -e esp32-s3                 # or: idf.py set-target esp32s3 && idf.py build
pio run -e esp32-s3 -t upload       # LAB BENCH ONLY for the first flash
pio device monitor -b 921600        # expect: "self test passed (frame size 34 bytes)"
```

Expected boot log lines: `monitoring-only firmware: no stimulation or actuation path exists`, the
self-test result, the four probe results, then `advertising as OMNIROOT-XXXX`.

Before connecting anything to a person, complete the bench checklist in `../firmware/esp32-omniroot/docs/CALIBRATION.md`.

### 2.2 Start the gateway on the phone

```bash
# On the Samsung A17, in Termux (F-Droid build; the Play Store build is deprecated)
bash services/termux/install.sh
termux-services restart sovereign-hdi
tail -f $PREFIX/var/log/sv/sovereign-hdi/current
```

`install.sh` installs `python`, `numpy`/`uvicorn` (best effort), writes the service definition under
`$PREFIX/var/service/`, and creates `~/sovereign-hdi/{var,config}`. The hub binds `127.0.0.1:8077` —
reachable only from the phone itself.

### 2.3 Build and serve the dashboard on the phone

```bash
cd dashboard && npm ci && npm run build
HDI_STATIC_DIR=$PWD/dist uvicorn sovereign_hdi.api.app:app --host 127.0.0.1 --port 8077
# open http://127.0.0.1:8077 in the phone browser, then "Add to Home screen" (PWA)
```

Serving the built PWA from the same origin as the API removes the CORS question entirely and keeps the
whole system on loopback — the strongest configuration available.

---

## 3. Topology B — containerised backend

```bash
cd deploy/docker
cp .env.example .env        # set HDI_API_TOKEN to a long random value
docker compose up -d --build
docker compose exec hub python -m sovereign_hdi model-card
curl -s -H "Authorization: Bearer $HDI_API_TOKEN" localhost:8077/api/v1/status | head
```

`docker-compose.yml` runs the hub with a read-only app filesystem, a writable `./data` volume for the
audit log, `no-new-privileges`, and a dropped capability set. TLS: terminate in a reverse proxy; the
hub does not implement TLS itself and should not be exposed directly to an untrusted network.

---

## 4. Configuration reference

| Variable | Default | Meaning |
| --- | --- | --- |
| `HDI_API_TOKEN` | *(unset)* | Bearer token. Unset ⇒ **loopback-only** mode |
| `HDI_DATA_MODE` | `simulated` | `simulated` or `live`; drives the provenance label |
| `HDI_ENGINE_HZ` | `10` | State-update rate, 1–200 |
| `HDI_ENGINE_AUTOSTART` | `1` | `0` disables the loop so ticks can be driven manually |
| `HDI_DATA_DIR` | `./var` | Audit-log directory (NDJSON) |
| `HDI_SIM_SEED` | `7` | Seed for the simulated source; makes demos reproducible |
| `HDI_CORS_ORIGINS` | *(unset)* | Comma-separated allow-list; unset ⇒ no CORS headers |
| `HDI_STATIC_DIR` | *(unset)* | Built dashboard directory to serve at `/` |
| `HDI_MODEL_CONFIG` | `config/default_model.json` | Alternative model configuration |

Deployment notes:

* Setting `HDI_API_TOKEN` **requires** the same protection for the WebSocket (`?token=` or
  `Authorization` header). Prefer the header.
* The hub never writes secrets and has no outbound network calls in the reference implementation.
* `HDI_DATA_DIR` on a phone should live in shared internal storage only if the phone is encrypted at
  rest; the audit log contains state estimates and pseudonymous identifiers.

---

## 5. Upgrade procedure

```bash
# 1. Verify the release
sha256sum -c MANIFEST.sha256
cat CHANGELOG.md                      # check for PARTIAL entries
# 2. Back up the audit log (it is the evidence record, not a cache)
cp -a var/audit-*.ndjson /backup/
# 3. Update
git fetch --tags && git checkout v2.5.0
cd software && python -m pip install -e ".[api]"
# 4. Re-run the safety-relevant suites before restarting the service
python -m pytest ../tests/safety ../tests/contract -q
python -m sovereign_hdi verify --steps 20000
# 5. Restart and confirm
termux-services restart sovereign-hdi    # or: docker compose up -d --build
curl -s localhost:8077/api/health
```

**Parameter changes are behavioural changes.** If `param_version` differs after an upgrade, telemetry
produced before and after are not directly comparable. The version is carried on every frame precisely
so this stays visible.

---

## 6. Rollback

```bash
git checkout <previous-tag>
cd software && python -m pip install -e ".[api]"
termux-services restart sovereign-hdi
```

The audit log is append-only and forward-compatible: older code ignores unknown keys. A rollback
therefore never invalidates previously recorded evidence.

---

## 7. Uninstall / data removal

```bash
# Stop and remove the service
termux-services stop sovereign-hdi && rm -rf $PREFIX/var/service/sovereign-hdi

# Delete local data (irreversible — this is the audit record)
cd ~/sovereign-hdi && ls var/            # inspect first
```
Deleting the audit log removes the ability to verify past sessions. Export aggregates first if a
summary is required after removal (`GET /api/v1/export/json`).
