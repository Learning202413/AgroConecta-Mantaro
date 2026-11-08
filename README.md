# AgroConecta Mantaro

> **UPLA 2026-II Hackathon · Track 2: Systems Integration**  
> Geospatial vehicle routing and shared agricultural freight platform for smallholder farmers and local carriers in the Mantaro Valley (Junín, Peru).

---

## 1. Problem Statement & Scope

Small agricultural producers in the Mantaro Valley (*Chupaca, Sicaya, Orcotuna, Mito, Concepción, Jauja*) frequently suffer high transport overheads and logistical fragmentation when moving fresh produce to the **Gran Mercado Mayorista de Huancayo (Puquio)**. Concurrently, local carriers run sub-optimally with partial payloads.

**AgroConecta Mantaro** solves this challenge through:
- **Shared Agricultural Freight:** Multi-producer crop lot aggregation bounded by truck weight constraints.
- **Heuristic Vehicle Routing:** Nearest-Neighbor path computation linking farm gates along the valley to the wholesale market.
- **Human-Centred Interaction Design:** Fast, resilient parcel gate mapping using real mobile GPS sensors and one-click saved plots.

---

## 2. System Architecture

Built on **Clean Architecture** principles to isolate business rules from delivery mechanisms and external persistence.

```
                           +----------------------------+
                           |  React 19 + Vite Frontend  |
                           |    (Leaflet 1.9 + Lucide)  |
                           +--------------+-------------+
                                          | HTTP / JSON REST
                                          v
+-------------------------------------------------------------------------------+
| .NET 8 Web API                                                                |
|                                                                               |
|   [ Presentation Layer ]    Controllers, Swagger/OpenAPI                      |
|             |                                                                 |
|             v                                                                 |
|   [ Application Layer ]     Nearest-Neighbor Heuristic, Route Optimization    |
|             |                                                                 |
|             v                                                                 |
|   [ Domain Layer ]          Entities (HarvestLot, TransportVehicle, Route)    |
|             ^                                                                 |
|             |                                                                 |
|   [ Infrastructure Layer ]  EF Core 8, Npgsql, PostgreSQL 16                  |
+-------------------------------------------------------------------------------+
                                          |
                                          v
                           +----------------------------+
                           |       PostgreSQL 16        |
                           |   (Seed Data & Geospatial) |
                           +----------------------------+
```

---

## 3. Human-Computer Interaction (HCI) & Usability Standards

The platform was designed strictly following the empirical guidelines of leading usability pioneers:

### Jakob Nielsen (10 Usability Heuristics - NN/g)
- **H1: Visibility of System Status:** Live weight capacity progress bar on trucks with color-coded safety margins; instant interactive marker positioning on plot maps.
- **H2: Match between System and the Real World:** Domain language reflects Mantaro agricultural realities (*tranquera, flete compartido, centro poblado, balanza*).
- **H4: Consistency and Standards:** Uniform corporate palette (Emerald, Navy, Royal Purple) with 100% vector iconography (`lucide-react`).
- **H5: Error Prevention:** Overweight loads physically disable optimization dispatches before mistakes occur; CapsLock warnings on credentials.
- **H6: Recognition Rather than Recall:** 1-click persistent habitual parcel chips (*Parcela Santa Rosa*, *Fundo Los Molinos*); 1-click demo role switcher.
- **H7: Flexibility and Efficiency of Use:** District is **100% autocompleted** via Euclidean nearest-neighbor calculation from GPS coordinates without forcing manual dropdown selection.

### Donald Norman (*The Design of Everyday Things*)
- **Signifiers & Affordances:** Differentiated map pins (Purple Wholesale Center, Green Harvest Pins, Sequenced Numbered Stops).
- **Physical & Semantic Constraints:** Producers cannot dispatch or tamper with carrier routes; carriers operate only within licensed payload ceilings.
- **Natural Mapping:** Direct manipulation by clicking anywhere on the mini-map to adjust plot gates down to metric precision.

### Ben Shneiderman (8 Golden Rules of Interface Design)
- **Information Seeking Mantra:** *Overview first, zoom and filter, details-on-demand* implemented across valley routes and crop lot inventories.
- **Prevent Errors & Reduce Memory Load:** Consolidated single-view modal eliminating multi-tab cognitive fragmentation.

### ISO 9241-210 & ISO 9241-11
- **Effectiveness:** Zero blocking steps from parcel registration to sequential route generation.
- **Efficiency:** Crop offer registration in under 20 seconds using mobile GPS sensor integration.

---

## 4. User Roles & Capabilities

| Role | Key Actor | Primary Capabilities |
| :--- | :--- | :--- |
| **Productor Agrícola** | Eusebio Poma (Chupaca) | Registers harvest lots (crop, weight, GPS tranquil gate); tracks pickup status in real time. |
| **Transportista Local** | Carlos Quispe (Camión W2A-841) | Consolidates compatible lots; executes nearest-neighbor heuristic; confirms stops sequentially. |
| **Admin Mayorista** | Mercado Huancayo (Puquio) | Valley-wide surveillance of aggregate incoming tonnage, vehicle telemetry, and delivery audit. |

---

## 5. Technology Stack

- **Backend:** C# .NET 8 Web API, Entity Framework Core 8, Npgsql, PostgreSQL 16.
- **Frontend:** React 19, Vite, React Router 7, Leaflet 1.9, React-Leaflet, Lucide Icons.
- **DevOps & Standards:** Conventional Commits, Git, RESTful API design.

---

## 6. Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16](https://www.postgresql.org/) running locally (configured on port `5433` or standard `5432`)

### 1. Database Setup
Ensure PostgreSQL is running and update `backend/AgroConectaMantaro.API/appsettings.json` if needed:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5433;Database=agroconecta_mantaro;Username=postgres;Password=1234"
}
```

### 2. Run the Backend API
```bash
cd backend/AgroConectaMantaro.API
dotnet run --launch-profile http
```
The API starts at `http://localhost:5029`. Swagger UI is available at `http://localhost:5029/swagger`.

### 3. Run the Frontend Client
```bash
cd frontend
npm install
npm run dev -- --host
```
The React application starts at `http://localhost:5173/`.

---

## 7. Demo Credentials

Quick 1-click profiles are available directly on the login screen:
- **Producer:** `productor@agroconecta.pe` / `1234`
- **Carrier:** `transportista@agroconecta.pe` / `1234`
- **Admin:** `admin@agroconecta.pe` / `1234`

---

## 8. Architectural & UX Documentation

For in-depth specifications prepared for the evaluation committee, consult:
- [Systems Architecture & Domain Flows](file:///docs/ARCHITECTURE_FLOWS.md): Comprehensive review of the decoupled logistics marketplace model, entity state machines, and TSP nearest-neighbor routing engine.
- [UX & Edge Cases Specification](file:///docs/UX_EDGE_CASES.md): Exhaustive analysis of operating contexts, ISO 9241 ergonomics, and failure mode mitigation for all user roles.
