# Bio-Digital Human Manual

**Document status:** Complete repository manual  
**Repository:** `bio-digital-human`  
**Audience:** Operators, developers, reviewers, and maintainers  
**Author:** Manus AI  
**Last updated:** 2026-09-22

## 1. Purpose and scope

Bio-Digital Human is a private repository containing two related deliverables. The first is the NeuroScan Interface, a client-side dashboard for visualising non-clinical telemetry concepts. The second is a reference telemetry service that demonstrates signed ingestion, validation, replay protection, deterministic processing, dashboard summaries, simulations, and deployment boundaries.

This manual explains how to install, run, use, test, deploy, troubleshoot, and maintain the repository. It is written for the actual contents of this repository rather than for capabilities that are only described in the source material.

> **Safety boundary:** This repository is non-clinical and non-invasive. It does not diagnose, treat, cure, regenerate tissue, modify cognition, stimulate neural tissue, upload cortical data, store biological data, or control high-voltage hardware. Dashboard values are simulated or reference values unless a separately reviewed integration proves otherwise.

The manual does not establish medical, electrical, regulatory, or operational approval. A real deployment requires domain review, privacy review, security review, hardware validation, and the appropriate legal or regulatory determination.

## 2. Repository map

The repository uses a monorepo structure so the interface, telemetry reference service, assurance material, research, and provenance records can be reviewed together.

| Path | Purpose |
| --- | --- |
| `apps/neuroscan-dashboard/` | React, Vite, TypeScript, and Tailwind dashboard with module navigation and PWA support. |
| `services/telemetry-reference/` | FastAPI reference service for signed telemetry ingestion and deterministic processing. |
| `packages/embedded-audit/` | Embedded engineering, safety, assurance, and deployment material from the source package. |
| `docs/` | Research, deployment blueprints, extraction reports, the SOVEREIGN HDI material, and this manual. |
| `assets/` | Deduplicated visual assets retained from the source archive. |
| `manifest/` | Source provenance, SHA-256 inventory, and duplicate-removal records. |

The dashboard is intentionally independent of the telemetry service at runtime. It can be developed and previewed as a static frontend. The telemetry service can be run separately when an operator needs to exercise the ingestion contract or simulation workflow.

## 3. Prerequisites

### 3.1 Required tools

A development workstation should provide the following tools:

- Git 2.40 or later.
- Node.js 22 or a compatible current LTS release.
- pnpm 10 or a compatible package manager supported by the lockfile.
- Python 3.11 or later for the telemetry reference service.
- Docker Engine and Docker Compose for containerised service testing.
- A C compiler only when working on the native firmware framing checks.

The dashboard does not require a database, an API key, or a server-side secret. The telemetry service does require a device-key configuration for authenticated ingestion.

### 3.2 Repository checkout

Clone the private repository and enter its directory:

```bash
git clone https://github.com/onegayunicorn/bio-digital-human.git
cd bio-digital-human
```

Do not place real credentials in the repository. The root `.gitignore` excludes common environment files, dependency directories, build output, Python caches, and local WebDev logs.

## 4. Quick start

### 4.1 Start the NeuroScan dashboard

Install the dashboard dependencies and start the Vite development server:

```bash
cd apps/neuroscan-dashboard
pnpm install
pnpm dev
```

Vite prints the local preview address. Open that address in a browser. The development server supports hot module replacement, so changes to dashboard source files appear without a manual rebuild.

The dashboard is a frontend prototype. Its displayed values are local presentation data, and its buttons update client-side state. It does not silently connect to the telemetry service.

### 4.2 Run the telemetry service locally

Create a virtual environment, install the pinned Python dependencies, run the tests, and start FastAPI:

```bash
cd services/telemetry-reference
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. pytest -q
PYTHONPATH=. uvicorn backend.app.main:app --reload
```

The service listens on port `8000` by default. Confirm that it is healthy:

```bash
curl http://127.0.0.1:8000/healthz
```

A healthy response contains `"status": "ok"` and identifies the service as `telemetry-hub`.

## 5. NeuroScan dashboard user manual

### 5.1 Interface model

The dashboard presents a dark, high-contrast telemetry workspace. The top bar identifies the interface and its online state. The left navigation rail selects a functional module. The main workspace presents a subject profile, scan progress, neural-field image, vitals, regional activity, band-spectrum traces, and summary indicators.

The interface is designed for a wide desktop viewport but collapses to a responsive layout on smaller screens. On mobile widths the navigation rail becomes a slide-out menu, the right-hand panels stack below the main neural field, and the bottom control dock remains accessible.

### 5.2 Header and status indicators

The header contains the following elements:

- **NeuroScan Interface:** identifies the application and shows the prototype version.
- **Live Analysis:** indicates that the dashboard is in its live-analysis presentation mode.
- **System Status:** reports the interface state as online. This is a UI state, not proof that a device or biological signal is connected.
- **Install App:** appears when the browser exposes a supported PWA installation prompt. Selecting it asks the browser to install the dashboard as a standalone application.

The dashboard uses a local-first presentation model. The `online` label should not be interpreted as a clinical, device, or network assurance statement.

### 5.3 Navigation modules

The left rail contains seven modules. Selecting a module updates the page heading and opens its module panel. The existing overview workspace remains available below the module panel so the operator can compare the selected context with the baseline dashboard.

| Module | Function |
| --- | --- |
| **Overview** | Shows the complete subject overview, scan progress, neural field, vitals, regional activation, band spectrum, and summary metrics. |
| **Activity** | Shows a signal-activity page with extracted imagery, signal quality, peak coherence, and input-fault indicators. |
| **Networks** | Shows a connectivity page with strong, moderate, and weak link counts. |
| **Genetics** | Shows a reference-layer page. It is contextual imagery only and performs no genetic inference. |
| **Analytics** | Shows an analytics workspace with session count, baseline delta, and selected time window. |
| **Reports** | Shows the report archive state with latest report, review state, and export count. |
| **Settings** | Shows local interface settings such as theme, stream mode, and application version. |

The Activity, Networks, and Genetics pages use the three images supplied in `app-pages.zip`. They are stored through WebDev-managed asset paths in the dashboard implementation. The repository source references those storage paths; it does not duplicate large image files inside the frontend bundle.

### 5.4 Time window selector

The **Window** selector supports `24 hours`, `7 days`, and `30 days`. In the current prototype it updates the selected client-side state and displays a confirmation message. It does not query a historical data service. A production integration must define the data source, timezone, retention policy, and loading/error behavior before connecting this control to real records.

### 5.5 Subject profile and scan progress

The subject profile shows the example subject identifier `AX-7G`, session identifier `7G-842-19`, age `29`, and session date `05/31/2024`. These values are demonstration content and should be replaced by an approved data model before any real subject workflow is considered.

The scan-progress panel shows `78%`, an estimated completion time, and a streaming indicator. These are presentation values. They do not constitute a measurement of a biological process.

### 5.6 Neural field controls

The neural-field panel uses the supplied visual reference as a focal image. It adds a scan grid, target rings, a crosshair, and readouts for coherence, field load, and nominal status.

The bottom control dock provides these interactions:

- **Rotate** rotates the neural field by 90 degrees per activation.
- **Zoom out** and **Zoom in** adjust the field between 75% and 130%.
- **Pause** changes the interface state to paused. **Resume** returns it to the live presentation state.
- **Reset view** returns zoom and rotation to baseline and restores the initial vitals state.
- **Export data** downloads a JSON snapshot containing the example subject, selected window, current state, vitals, and regional values.

The export is a local browser download. It is not an evidence manifest and must not be treated as a regulated record without a separately designed retention and integrity process.

### 5.7 Vitals, regions, and waveforms

The vitals panel presents heart rate, brain activity, oxygen level, and respiratory rate. The region panel presents activation values for the frontal lobe, parietal lobe, temporal lobe, occipital lobe, cerebellum, and brain stem. The activity panel presents Alpha, Beta, Gamma, Delta, and Theta bands.

These values and waveforms are simulated presentation data. They are useful for evaluating layout, hierarchy, interactions, and visual density. They are not validated sensor measurements and must not be used for diagnosis or treatment decisions.

### 5.8 Module actions and status messages

Module pages provide **Refresh View** and **Export Snapshot** actions. In the current frontend they update a local status message. The buttons are integration points for future data loading and export workflows. They do not transmit data to an external service.

## 6. Progressive Web App operation

### 6.1 PWA components

The dashboard includes the following PWA files:

- `apps/neuroscan-dashboard/client/public/manifest.json` defines the application name, standalone display mode, theme colors, scope, start URL, and icon.
- `apps/neuroscan-dashboard/client/public/neuroscan-icon.svg` supplies the application icon.
- `apps/neuroscan-dashboard/client/public/sw.js` caches the app shell and uses a cache-first strategy for previously retrieved GET requests.
- `apps/neuroscan-dashboard/client/src/main.tsx` registers the service worker in production builds.
- `apps/neuroscan-dashboard/client/index.html` provides manifest, theme-color, mobile web-app, and favicon metadata.

The service worker is deliberately registered only when `import.meta.env.PROD` is true. Development mode therefore remains predictable and does not retain stale cached code.

### 6.2 Installing the PWA

Use a supported Chromium-based or mobile browser. Open the deployed dashboard, wait for the page to load, and select the browser's install action. If the browser exposes the `beforeinstallprompt` event, the dashboard also shows **Install App** in the header.

On iOS and iPadOS, use the browser's **Add to Home Screen** action. The exact wording depends on the operating-system version and browser.

### 6.3 Offline behavior and limitations

The service worker caches the application shell and successful GET responses. Offline behavior is therefore best-effort. A first visit must complete while online. Dynamic telemetry, future API requests, new assets, and uncached routes may be unavailable offline.

When releasing a new service-worker cache version, change `CACHE_NAME` in `client/public/sw.js`. This causes old caches to be removed during activation. Do not cache private responses unless the retention, encryption, and deletion behavior has been reviewed.

## 7. Dashboard development and release workflow

The dashboard package provides these commands:

```bash
pnpm dev      # start the Vite development server
pnpm check    # run TypeScript validation
pnpm build    # build the Vite frontend and bundled server entrypoint
pnpm preview  # preview the Vite output
pnpm start    # start the bundled production server
pnpm format   # format source files with Prettier
```

The frontend source is under `client/src`. Page-level components belong in `client/src/pages`, reusable components belong in `client/src/components`, static PWA files belong in `client/public`, and the global visual system belongs in `client/src/index.css`.

The `server/` directory is a static-serving compatibility layer generated by the WebDev template. Do not add backend endpoints there without changing the deployment and security review. The dashboard should remain a frontend-only application unless the project explicitly adds a reviewed backend capability.

Before committing a dashboard change, run:

```bash
cd apps/neuroscan-dashboard
pnpm check
pnpm build
```

Then open the preview and exercise at least one navigation path, one state-changing control, and the export control. Confirm that the browser console contains no new runtime errors.

## 8. Telemetry reference service

### 8.1 Service responsibilities

The reference service demonstrates a bounded telemetry pipeline. It validates an envelope, authenticates the device request, rejects replayed requests, enforces sequence ordering, optionally validates an evidence seal, processes the envelope into a dashboard summary, and broadcasts a summary event to WebSocket subscribers.

The service is intentionally small and local. It is not a production medical, clinical, or safety-control service.

### 8.2 Service layout

- `backend/app/main.py` defines the FastAPI application and routes.
- `backend/app/models.py` defines the telemetry envelope, acknowledgement, dashboard summary, and digest models.
- `backend/app/security.py` implements device-key lookup, request signature verification, timestamp validation, and replay protection.
- `backend/app/store.py` stores the latest in-memory telemetry state.
- `backend/app/processing.py` computes the deterministic biofeedback summary.
- `contracts/telemetry.schema.json` documents the versioned telemetry envelope.
- `simulations/python/` contains the Python simulator and retrying client.
- `simulations/javascript/` contains the matching JavaScript processor and client.
- `firmware/esp32/` contains the typed firmware contract boundary.
- `tests/` contains backend, contract, authentication, idempotency, and processing checks.
- `deploy/` contains the Dockerfile, Compose file, and environment example.

### 8.3 Configuration

For local development, copy the environment example:

```bash
cd services/telemetry-reference
cp deploy/.env.example .env
```

The example value is `demo-device-01:replace-me`. It is suitable only for local development. Replace it with a long, randomly generated secret for any shared environment. Never commit the real value.

The `DEVICE_KEYS` variable maps a device identifier to a secret. The implementation expects the configured device ID and secret to be available to the authentication layer. If multiple devices are supported by the deployment, use the format documented in the service's key-store implementation and keep the configuration in a secret manager.

### 8.4 HTTP API

The service exposes the following routes:

| Method and path | Purpose | Expected behavior |
| --- | --- | --- |
| `GET /healthz` | Health check | Returns a JSON object with service status and UTC time. |
| `POST /v1/telemetry` | Authenticated ingestion | Accepts a signed telemetry envelope and returns an acknowledgement with HTTP 202 on accepted input. |
| `GET /v1/devices/{device_id}/dashboard` | Latest processed summary | Returns the latest summary or HTTP 404 when no telemetry exists for the device. |
| `WS /v1/ws` | Summary event stream | Accepts WebSocket clients and broadcasts dashboard summary events after accepted ingestion. |

The ingestion endpoint requires these HTTP headers:

- `X-Device-ID` identifies the sending device.
- `X-Timestamp` supplies the signed request timestamp.
- `X-Nonce` supplies a request-unique replay token.
- `X-Signature` supplies the HMAC-SHA256 request signature.

The signature covers the HTTP method, request path, timestamp, nonce, and SHA-256 digest of the request body. A retry must reuse the envelope `message_id` and sequence but must use a fresh nonce. The server rejects stale timestamps, replayed nonces, invalid signatures, malformed envelopes, device-header mismatches, and out-of-order sequences.

### 8.5 Ingestion outcomes

A valid request can produce several meaningful outcomes:

- **Accepted:** the envelope is stored and processed.
- **Out of order:** the envelope is rejected because its sequence is not newer than the stored sequence.
- **Quarantined:** an evidence seal is present but its digest does not match the envelope.
- **Unauthenticated:** the request fails signature, timestamp, nonce, or device-key checks.
- **Invalid:** the request body does not conform to the envelope model.

Operators should preserve the acknowledgement, request identifiers, timestamps, and reason fields when integrating the service with a real audit system.

### 8.6 Local API examples

A health check is unauthenticated:

```bash
curl -s http://127.0.0.1:8000/healthz | jq
```

A telemetry request cannot be sent safely by copying an unsigned JSON body into `curl`. The signature must be generated over the exact method, path, timestamp, nonce, and body digest. Use the supplied Python or JavaScript simulation clients as the reference for constructing signed requests.

The dashboard summary route can be queried after the simulator has ingested at least one valid envelope:

```bash
curl -s http://127.0.0.1:8000/v1/devices/demo-device-01/dashboard | jq
```

If the route returns `404`, the service has not accepted telemetry for that device in its current in-memory process.

## 9. Testing and verification

### 9.1 Python tests

Run the reference-service tests from its directory:

```bash
cd services/telemetry-reference
. .venv/bin/activate
PYTHONPATH=. pytest -q
```

The suite covers validation, authentication, replay protection, idempotency, sequence handling, and deterministic processing. A clean test run is necessary but not sufficient for a production decision.

### 9.2 JavaScript simulation tests

Run the JavaScript simulator tests without installing a second application:

```bash
cd services/telemetry-reference/simulations/javascript
node test.js
```

The JavaScript processor should agree with the contract and normalized processing behavior expected by the service.

### 9.3 Python compilation check

A dependency-light syntax check is useful when the full Python environment is unavailable:

```bash
cd services/telemetry-reference
python3 -m compileall -q backend simulations tests
```

### 9.4 Dashboard verification

Run the dashboard validation commands:

```bash
cd apps/neuroscan-dashboard
pnpm check
pnpm build
```

Then verify the following manually:

1. Overview loads without a blank screen.
2. Each navigation item changes the module heading.
3. Activity, Networks, and Genetics display their corresponding supplied imagery.
4. Rotate, zoom, pause/resume, reset, and export controls respond.
5. The PWA manifest and icon load from `/manifest.json` and `/neuroscan-icon.svg`.
6. The production build contains `/sw.js` and registers it after a production launch.
7. The browser console contains no application errors.

## 10. Container deployment

The telemetry service includes a read-only container configuration. From the deployment directory:

```bash
cd services/telemetry-reference/deploy
cp .env.example .env
# Replace DEVICE_KEYS in .env with a real development secret.
docker compose up --build
```

The Compose service publishes port `8000`, runs with a read-only filesystem, enables `no-new-privileges`, and defines a health check against `/healthz`.

Stop the service with:

```bash
docker compose down
```

Do not use the example key in a shared or production environment. Do not expose the service directly to the public internet without an explicit threat model, TLS termination, access control, rate limiting, secret custody, logging policy, and operational review.

The dashboard itself can be built with `pnpm build` and served with `pnpm start`. In a managed WebDev environment, use the project checkpoint and deployment workflow rather than treating the local `dist` directory as a release artefact.

## 11. Security and privacy operations

### 11.1 Secrets

Keep device keys outside Git. Use a secret manager or the deployment environment's protected configuration. Rotate keys when a device is retired, a credential may have been exposed, or an operator's access changes.

The repository's `.env.example` files are documentation only. A file named `.env` must remain uncommitted. Before pushing changes, inspect staged files for credentials and private keys.

### 11.2 Authentication and replay protection

The ingestion endpoint authenticates each request using a device key and request signature. The timestamp limits replay windows. The nonce prevents a previously accepted request from being accepted again. The sequence number provides ordering protection at the envelope level.

These controls do not replace transport security, device identity provisioning, key rotation, authorization policy, monitoring, or incident response. Use TLS for any network path outside a trusted local process.

### 11.3 Data handling

The reference service stores the latest telemetry state in memory. It is not a durable clinical record store. If persistence is added, define data minimisation, retention, access logging, deletion, backup, encryption, and subject-rights behavior before implementation.

The dashboard's JSON export contains client-side example values. A future real export must define who may export, what fields are included, how the file is protected, and how its integrity is established.

## 12. Safety and evidence boundaries

The repository distinguishes between code that exists, simulated behavior, conceptual interfaces, research hypotheses, and fictional visualisation. Visual polish does not upgrade an unmeasured claim into evidence.

Do not describe the dashboard as a medical device, diagnostic system, treatment system, neural-writing system, or physiological safety system. Do not infer physiological meaning from the demonstration values. Do not connect an actuator, stimulator, current source, or other intervention path without a separate safety and regulatory programme.

The existing SOVEREIGN HDI blueprint and engineering-audit material contain more detailed boundary language, claims registers, limitations, and deployment considerations. Consult those documents before changing user-facing claims or adding hardware integrations.

## 13. Troubleshooting

### The dashboard shows a blank page

Run `pnpm check` and `pnpm build` from `apps/neuroscan-dashboard`. Inspect the browser console. Confirm that the development server is running from the dashboard directory and that the browser is using the printed Vite URL.

### The dashboard shows old styling after a release

The production service worker may be serving a cached shell. Close all application tabs, reload once while online, and check whether the new cache version was deployed. If the release intentionally changes cache behavior, increment `CACHE_NAME` in `client/public/sw.js` and rebuild.

### The supplied module image does not render

Confirm that the WebDev-managed storage path in `client/src/components/ModulePage.tsx` is still valid. The paths are not local filesystem paths. They require the asset to have been uploaded to the active WebDev project.

### The API returns 401

Check the device ID, secret, timestamp, nonce, exact request path, body bytes, and signature construction. A signature computed over formatted JSON that differs from the transmitted body will fail. Check that the service loaded `DEVICE_KEYS` from the intended environment.

### The API returns 422

Validate the JSON against `contracts/telemetry.schema.json` and the Pydantic envelope model. Check field names, types, sequence values, timestamps, and required nested fields.

### The API returns OUT_OF_ORDER

The service has already accepted a newer sequence for that device. Send a strictly newer sequence, or restart the local in-memory service when resetting a development session.

### The dashboard export does not download

The export action uses the browser's Blob and download APIs. Check that downloads are permitted for the site and that the browser did not block a download. The export is generated locally and does not require an API connection.

### Docker Compose fails before startup

Confirm Docker is running, `.env` exists in `services/telemetry-reference/deploy`, and `DEVICE_KEYS` is set. Run `docker compose config` to inspect the resolved configuration without starting the service.

## 14. Change management

Use small, descriptive commits. Keep dashboard changes in `apps/neuroscan-dashboard` and telemetry-service changes in `services/telemetry-reference`. Update the relevant README or manual section when an operational command, environment variable, route, safety boundary, or release step changes.

Before a pull request or release:

1. Run the dashboard TypeScript check and production build.
2. Run the Python test suite and JavaScript simulation tests.
3. Check for secrets and generated files.
4. Review changes to safety claims and user-visible labels.
5. Update provenance or inventory records when source assets are added or removed.
6. Record known limitations rather than silently filling them with assumptions.

A release should identify the commit, test results, configuration source, deployment target, and any gates that remain intentionally unsatisfied. Do not create a signing key or claim a signed production artefact unless the custody and verification process is actually configured.

## 15. Contributor guidance

New dashboard pages should be implemented as page-level or module-level components rather than adding more conditional markup to the overview. Reusable visual elements should be extracted into `client/src/components`. Keep the design tokens and responsive rules in `client/src/index.css`.

New telemetry fields must be added to the contract, model validation, simulator fixtures, processor behavior, and tests together. A field that is only added to the UI is not a telemetry capability.

All new claims should be classified before they are written into UI copy or documentation. If the claim is not measured, label it as simulated, conceptual, or not measured. Keep the interface informative without making clinical or safety assertions.

## 16. Release checklist

### Dashboard

- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes.
- [ ] Overview and all navigation modules render.
- [ ] Extracted imagery loads from approved managed-storage paths.
- [ ] PWA manifest, icon, and service worker are served.
- [ ] Install behavior was checked in a supported browser.
- [ ] No browser console errors are present.
- [ ] User-facing claims remain within the non-clinical boundary.

### Telemetry service

- [ ] Python environment is recreated from `requirements.txt`.
- [ ] `pytest` passes.
- [ ] JavaScript simulation tests pass.
- [ ] Device keys are supplied through protected configuration.
- [ ] `/healthz` is healthy.
- [ ] Signed-ingestion behavior is tested with a simulator.
- [ ] Replay, stale timestamp, invalid signature, malformed envelope, and out-of-order paths are covered.
- [ ] Deployment exposure, TLS, logs, retention, and incident response are reviewed.

### Repository

- [ ] No `.env`, private key, credential, dependency directory, build output, or local log is staged.
- [ ] Documentation reflects the actual commands and paths.
- [ ] Source provenance and inventory are updated when source material changes.
- [ ] The commit message identifies the purpose of the release.
- [ ] The private remote and default branch are correct.

## 17. References

[1]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps "MDN Progressive web apps"

[2]: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API "MDN Service Worker API"

[3]: https://vite.dev/guide/ "Vite official guide"

[4]: https://fastapi.tiangolo.com/ "FastAPI official documentation"

[5]: https://docs.docker.com/compose/ "Docker Compose documentation"

[6]: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository "GitHub documentation for creating repositories"
