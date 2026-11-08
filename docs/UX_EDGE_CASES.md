# AgroConecta Mantaro · UX & Edge Cases Specification

> **Human-Computer Interaction (HCI) & Ergonomic Usability Specification**  
> **Standards:** ISO 9241-11, ISO 9241-210, Nielsen (NN/g), Norman, Shneiderman.

---

## 1. Context of Use & Operating Environment (ISO 9241-11)

| Actor | Physical Context | Device & Input | Primary Constraints & Edge Cases |
| :--- | :--- | :--- | :--- |
| **Agricultural Producer** | Open fields, direct sunlight glare, dust/mud. | Mid-tier mobile smartphone, touch interface. | High sunlight reflection, variable 3G/4G connectivity, risk of entering weight typos (confusion between sacks and kg). |
| **Rural Carrier** | Truck cabin, motor vibration, roadside stops. | Smartphone mounted on dashboard. | Must not perform multi-step nested taps while operating vehicle; physical truck capacity ceilings must never be breached. |
| **Wholesale Admin** | Weighbridge office at Mercado Mayorista (Puquio). | Tablet / Desktop monitor. | High throughput during pre-dawn peak hours (3:00 AM - 5:30 AM); multi-truck queueing and dispatch settlement. |
| **Hackathon Evaluator** | Evaluation workstation. | Laptop / Desktop browser. | Scant evaluation time (under 3 minutes); actively tests boundary limits and invalid inputs. |

---

## 2. Multi-Role Edge Cases Matrix

### A. Producer Journey
* **GPS Jitter / Rural Canyon Interference:**
  * *Failure Mode:* Phone GPS accuracy degrades to >300m in riverbed plots.
  * *Design Pattern (Norman Natural Mapping):* Minimap renders marker instantly with micro-adjustment affordance: tapping any road or gate immediately updates coordinates and recalculates the nearest town.
* **Weight Input Unit Ambiguity:**
  * *Failure Mode:* Farmer types "30" thinking 30 sacks instead of 1,500 kg.
  * *Design Pattern (Nielsen H5):* Immediate visual feedback converts kilogram inputs into standard 50kg sacks equivalent.

### B. Carrier Journey
* **Overload Prevention (Norman Semantic & Physical Constraint):**
  * *Failure Mode:* Carrier attempts to select 5,200 kg on a 4,000 kg licensed truck.
  * *Design Pattern:* The live capacity bar switches to danger red (`#dc2626`), and the optimization dispatch button is physically disabled with an informative banner.
* **Gate Lockout / Inaccessible Plot Gate:**
  * *Failure Mode:* Carrier reaches plot coordinates, but the farm gate is padlocked.
  * *Design Pattern:* Single-tap direct phone dialer (`tel:{contactPhone}`) on the active waybill stop.

### C. Wholesale Admin Journey
* **Discrepancy at Final Weighbridge:**
  * *Failure Mode:* Crop loses 2% weight in transit due to natural transpiration during the 45km mountain journey.
  * *Design Pattern:* 3% tolerance threshold built into reception settlement before raising variance flags.

### D. Evaluator Journey
* **Instant Role Verification:**
  * *Failure Mode:* Judges waste time registering test accounts.
  * *Design Pattern:* Persistent top-bar Evaluator Switcher (`[Productor] [Transportista] [Admin Mayorista]`) loading realistic regional Mantaro seed profiles in 1 click.
