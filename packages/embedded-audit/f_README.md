# Samsung A17 gateway (Termux)

The phone is the local-first gateway: it receives frames from the node over BLE, runs the state engine
and the governor, serves the hub on **loopback only**, and stores the audit log.

**EVIDENCE LABEL: CONCEPTUAL_ARCHITECTURE.** These scripts target Termux on aarch64 Android and are
written to be runnable, but no device run is recorded in this repository. The first execution on a real
phone is a bench task — record the outcome and update this file.

---

## Install

```bash
# In Termux (F-Droid build; the Play Store build is deprecated)
git clone <this repository> ~/sovereign-hdi-src
cd ~/sovereign-hdi-src
bash services/termux/install.sh
termux-services restart sovereign-hdi
tail -f $PREFIX/var/log/sv/sovereign-hdi/current
```

`install.sh` installs `python`, `termux-services` and `openssl-tool`, installs the Python extras on a
best-effort basis (NumPy and the hub are optional — the software tier has a pure-stdlib path), creates
`~/sovereign-hdi/{var,config,.env}`, registers the runit service, and runs a self-check that includes
the shared CRC vector and a frame round trip.

## Operate

```bash
termux-wake-lock                          # Android will otherwise suspend the service
termux-services status sovereign-hdi
curl -s http://127.0.0.1:8077/api/health
curl -s http://127.0.0.1:8077/api/v1/status | python -m json.tool | head -30
```

Serve the built dashboard from the same process so the whole system stays on loopback:

```bash
cd ~/sovereign-hdi-src/dashboard && npm ci && npm run build
HDI_STATIC_DIR=$PWD/dist termux-services restart sovereign-hdi
# open http://127.0.0.1:8077 on the phone, then "Add to Home screen"
```

That configuration needs no CORS headers, no token and no open port. It is the recommended topology.

## Layout on device

| Path | Contents |
| --- | --- |
| `~/sovereign-hdi/.env` | Local configuration (mode 600). No secrets in the default configuration |
| `~/sovereign-hdi/var/` | Hash-chained NDJSON audit log — treat as evidence, back it up, never edit it |
| `~/sovereign-hdi/run-service.sh` | Copy of the runit script, for manual runs |
| `$PREFIX/var/service/sovereign-hdi/run` | The supervised service entry point |

## Troubleshooting

| Symptom | Cause | Action |
| --- | --- | --- |
| `sv: service not found` | Service not registered, or `termux-services` missing | Re-run `install.sh`; `pkg install termux-services` |
| Port already in use | A previous run survived `sv down` | `sv down sovereign-hdi && pkill -f 'uvicorn sovereign_hdi'` |
| Service dies when the screen locks | No wake lock | `termux-wake-lock` (and allow Termux to run in the background in Android settings) |
| `fastapi missing` at start-up | Extras failed to install (no network / no wheel) | The dashboard still works in offline demo mode; install the extras when network is available |
| Audit log grows quickly | Long sessions at 10 Hz | Expected: ~30 MB/hour of raw frames. Aggregates, not the raw log, are the export path |

## Safety reminder

Battery only while electrodes are attached. The gateway has no actuator path — it cannot stimulate,
dose, or command the node; the firmware's BLE characteristic is notify-only.
