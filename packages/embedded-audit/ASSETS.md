# Assets — image manifest

## Image Manifest

| Slot | Source | Path | Notes |
| --- | --- | --- | --- |
| *(none)* | — | — | This project intentionally ships **zero raster images**. |

## Why there are no images

1. **Truth policy.** The reference screens' centrepiece is a glowing brain render. A raster brain
   photograph or AI render is exactly the kind of asset that gets mistaken for a scan or for evidence
   of a neural interface. The central visual is therefore an **inline SVG network motif**
   (`src/components/NeuralCore.jsx`) that is explicitly labelled `ILLUSTRATIVE`. Being drawn from data
   and code, it cannot be mistaken for a medical image.
2. **Sovereignty.** No hotlinked third-party images, no external CDNs, no tracking pixels. The bundle
   makes no outbound requests for assets, which is verifiable by inspection.
3. **Offline-first.** The PWA must render with no network at all; inline SVG guarantees it.

## Placeholder

`public/assets/images/placeholder.svg` exists as the canonical fallback required by the asset contract.
It is referenced only if a future revision adds a generated asset that fails to load; no runtime code
currently references it, and it is listed here as an unused-but-intentional asset.

## Fonts

No web fonts. The design uses the system UI stack plus the platform monospace stack, so there is no
font CDN request and no `@font-face` download (`DESIGN.md` §3).
