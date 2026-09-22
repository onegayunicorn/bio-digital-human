# Bio-Digital Human

Private consolidated repository for the Bio-Digital platform and NeuroScan Interface dashboard.

## Repository layout

- `apps/neuroscan-dashboard/` — interactive React/Vite NeuroScan dashboard with responsive module navigation and PWA support.
- `services/telemetry-reference/` — non-clinical FastAPI telemetry reference implementation.
- `packages/embedded-audit/` — embedded engineering and assurance material.
- `docs/` — research, extraction, deployment, and SOVEREIGN HDI documentation.
- `assets/` — deduplicated source visual assets.
- `manifest/` — source provenance, inventory, and duplicate-removal records.

## Documentation

Read [`docs/MANUAL.md`](docs/MANUAL.md) for the complete operator, developer, deployment, testing, PWA, security, safety, troubleshooting, and release manual.

## NeuroScan dashboard

The dashboard uses the supplied neural reference imagery through WebDev-managed storage paths, includes Activity, Networks, Genetics, Analytics, Reports, and Settings modules, and provides PWA manifest, icon, offline shell, and install-prompt support.

## Safety boundary

The telemetry reference implementation is non-clinical and non-invasive. It does not implement neural stimulation, diagnosis, treatment, direct cortical upload, biological storage, or high-voltage control.
