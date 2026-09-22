# Evidence directory

Artefacts a reviewer can check, and the rules for adding to them.

## What belongs here

| Artefact | Produced by | What it lets a reviewer conclude |
| --- | --- | --- |
| `MANIFEST.sha256` (repo root) | `scripts/gen_evidence_manifest.py` | The bytes they hold are the bytes that were tested |
| `EVIDENCE.json` (repo root) | same, with `--json` | Structured inventory: versions, tier counts, per-file hashes |
| `VERIFICATION.txt` (inside the release ZIP) | `tools/package_release.sh` | A plain statement of what was verified and what was not |
| `stability-*.json` | `scripts/verify_stability.py --json` | Numerical stability results for a specific run |
| `bench-*.md` | A human, from `firmware/…/docs/CALIBRATION.md` | Sensor-accuracy results, with the protocol and the failures included |

## What must never be committed here

* **Real participant data** — no raw signals, no state series, no calibration profile from a real
  person. Those stay on the device and in the local audit log.
* **Secrets** — tokens, keys, certificates, `.env` files.
* **Anything that presents a plan as a result.** A checklist with unfilled criteria is a plan; label it
  as one.

## Rules

1. **Evidence names its configuration.** A result without `model_version`, `param_version` and the
   firmware hash cannot be attached to a build, and is therefore not evidence about that build.
2. **Negative results stay in.** A failed bench step is the most useful row in the table; removing it
   turns a record into marketing.
3. **Regenerate, do not hand-edit.** Manifests and stability reports are generated; if one is wrong, fix
   the generator.
4. **A seal proves integrity, not origin.** SHA3-256 seals and the hash chain show that a record was not
   altered after sealing. They do not establish who produced it, or when. Only a signature and an
   external timestamp would do that, and neither is implemented (`docs/LIMITATIONS.md` §5).
