# Electrical safety and EMC assessment checklist (Australia)

**Status: DRAFT / CHECKLIST ONLY — NO TESTING HAS BEEN PERFORMED.**
Assessor: `<unassigned>` · Test house: `<unassigned>` · Version: 2.5.0

> The source specification named AS/NZS 61010-1 (electrical safety of measurement, control and
> laboratory equipment) and AS/NZS CISPR 32 (EMC of multimedia equipment) as the applicable
> instruments, and asserted compliant status. **This document claims no compliance.** It records the
> design decisions taken, and lists what must be measured by a competent party.
>
> Confirm the current editions, applicable parts and any product-specific variants with the standards
> body or an accredited test house before relying on any standard reference below.

---

## 1. Design decisions that reduce electrical risk

| Decision | Rationale |
| --- | --- |
| Battery-powered, SELV, < 5 V DC throughout the sensing path | Removes the mains-referenced fault path that causes the classic "wellness device" electrocution risk |
| No mains-powered supply in the normal operating configuration | The primary electrical-safety control available to this design |
| Electrode path referenced only to the isolated node rail | Prevents a body current path through a mains-referenced ground (e.g. via a charger) |
| Passive sensing only — no stimulation, no current injection, no dosing | Removes the largest class of electrical hazard by removing the function |
| No high-voltage or plasma-coupled element in the product | Any such element in the wider concept corpus is excluded and must never be wired to a subject |

## 2. **WARNING — the operating configuration that creates the hazard**

Charging a phone or laptop from a mains supply while the node's electrodes are attached creates a
plausible path to earth through the subject. This configuration is **prohibited** in all operating
documentation.

* Operate the node on battery only.
* Never attach electrodes while any part of the system is connected to a mains-derived supply.
* Where a phone is used as the gateway, keep it on battery while a session is running.
* Label this warning on the device and in the quick-start card.

## 3. Electrical-safety checklist (for the assessor)

| Item | Design position | Status |
| --- | --- | --- |
| Supply classification | SELV, battery, < 5 V DC | By design; verify by inspection |
| Isolation between the sensing path and any external interface | No galvanic path from electrodes to an external supply or a mains-referenced ground | **To verify** — requires a schematic and a review of the analog front end |
| Creepage / clearance | `<to be specified from the schematic>` | **Not documented** |
| Leakage current and dielectric strength | Not applicable to a purely battery-powered SELV design in the normal configuration; still to be confirmed for the charging configuration | **Not measured** |
| Over-current protection and current limiting on the electrode path | `<to be specified>` | **Not designed in this repository** |
| Protective enclosure / ingress | Enclosure not designed here | **Absent** |
| Battery management (over-charge, over-discharge, thermal) | `<module to be specified>` | **Not documented** |
| Thermal limits of skin contact surfaces | Not measured | **Absent** — see `RISK_REGISTER.md` R-04 |
| Single-fault tolerance | Not analysed | **Absent** |
| Biocompatibility of electrode/contact materials | Not assessed | **Absent** |

## 4. EMC checklist (for the test house)

| Item | Statement | Status |
| --- | --- | --- |
| Emission source | 2.4 GHz BLE radio, plus a 240 MHz MCU and switching regulators | Design description only |
| Radiated emissions | Not measured | **Test required** |
| Conducted emissions | Not measured | **Test required** |
| Immunity (ESD, RF field, EFT/burst, surge, conducted RF) | Not measured | **Test required** |
| Human exposure assessment (RF) | Not performed; intended transmit power is low | **Assessment required** — do not assume exemption without checking current requirements |
| Radio apparatus requirements | BLE module may be supplied as a pre-certified module; module certification must be obtained and its conditions respected | **Not obtained** |
| Labels and user information required by the applicable instruments | Not produced | **Outstanding** |

## 5. Declaration boundary

Until accredited testing is complete, permitted wording is:

> "Designed with reference to AS/NZS 61010-1 and AS/NZS CISPR 32; **electrical safety and EMC testing
> has not been performed**. This is an engineering prototype."

Prohibited wording: "compliant with", "certified to", "passed EMC", "approved", or any mark implying
conformity. See `../CLAIMS_REGISTER.md` §3.
