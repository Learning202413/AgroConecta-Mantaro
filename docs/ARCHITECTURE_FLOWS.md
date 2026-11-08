# AgroConecta Mantaro · Systems Architecture & Domain Flows

> **UPLA 2026-II Hackathon · Track 2: Systems Integration**  
> **Topic:** Option 4 — Intelligent Geospatial Routing & Shared Agricultural Freight Platform in the Mantaro Valley.

---

## 1. Domain Model: Decoupled Multi-Role Logistics Marketplace

The platform implements a decoupled, event-driven logistics marketplace tailored to rural Andean logistics:

```mermaid
flowchart LR
    subgraph Farmer[1. Agricultural Producer]
        direction TB
        F1[Harvest Registration] --> F2[Issue Freight Ticket]
        F2 --> F3[Status: Available in Valley Pool]
    end

    subgraph Carrier[2. Rural Carrier / Truck Driver]
        direction TB
        C1[Browse Available Tickets] --> C2[Select Compatible Payload]
        C2 --> C3[Trigger TSP Optimization Engine]
        C3 --> C4[Generate Official Waybill / Route]
    end

    subgraph Admin[3. Wholesale Market Admin / Puquio]
        direction TB
        A1[Manage Fleet: Approve Trucks & Plates]
        A2[Manage Valley Catalog: Add Varieties & Base Prices]
        A3[Supervise In-Transit Routes & Market Reception]
    end

    F3 -->|Shared Pool| C1
    A1 -.->|Truck Master| C1
    A2 -.->|Crop Master| F1
    C4 -->|Route In Transit| A3
```

---

## 2. Core Entities & Lifecycle States

### 2.1 Harvest Ticket (`HarvestLot`)
Represents an offer of agricultural cargo waiting at a farm gate (*tranquera*).
* **Identifier:** Primary key (`Id`) and Ticket Code (`TCK-{Id}`).
* **Payload Attributes:** `WeightKg`, `CropType`, `EstimatedPricePerKg`.
* **Spatial Attributes:** `Latitude`, `Longitude`, `TownName` (Euclidean-derived), `LocationSource` (e.g. *Parcela Santa Rosa*).
* **Lifecycle:**
  $$\text{Available} \xrightarrow{\text{Carrier Consolidates}} \text{Assigned} \xrightarrow{\text{Farm Gate Pickup}} \text{InTransit} \xrightarrow{\text{Wholesale Weighbridge}} \text{Delivered}$$

### 2.2 Vehicle & Payload Unit (`TransportVehicle`)
* **Identifiers:** `LicensePlate`, `DriverName`, `ContactPhone`.
* **Payload Capacity:** `MaxCapacityKg` (e.g., 4,000 kg for 2-axle trucks; 8,000 kg for medium freight).
* **Live Payload:** `CurrentLoadKg`, `IsAvailable`.

### 2.3 Consolidated Waybill (`ConsolidatedRoute`)
* **Mathematical Optimization:** Heuristic Traveling Salesperson Problem (TSP) with Nearest-Neighbor geodesic ordering from furthest valley plot (*Jauja/Concepción*) inward through intermediate gates (*Mito, Orcotuna, Sicaya, Chupaca*) terminating at the **Gran Mercado Mayorista de Huancayo (Puquio)**.
* **Waybill Attributes:** `TotalDistanceKm`, `EstimatedDurationMinutes`, `TotalWeightKg`, `Stops` (sequenced 1 to $N$).
* **Cost Efficiency Model:** Shared freight pro-rata calculation yielding 30% to 35% savings compared to private exclusive charters.

---

## 3. Heuristic Vehicle Routing Engine (`RouteOptimizationService`)

```mermaid
sequenceDiagram
    autonumber
    actor Carrier as Conductor / Transportista
    participant API as RouteOptimizationService (.NET 8)
    participant Repo as EF Core & PostgreSQL
    participant Leaflet as React 19 Client UI

    Carrier->>API: POST /api/routes/optimize (VehicleId, SelectedLotIds)
    API->>Repo: Fetch Vehicle & Selected Lots (Status == 'Available')
    API->>API: Validate TotalWeight <= Vehicle.MaxCapacityKg
    API->>API: Compute Furthest Lot from Huancayo Wholesale Destination
    loop Nearest-Neighbor Heuristic
        API->>API: Calculate Haversine Geodesic Distance to Next Nearest Lot
        API->>API: Append Ordered Stop (1..N) with Gate Coordinates
    end
    API->>API: Add Final Transit Leg to Huancayo (-12.0682, -75.2100)
    API->>Repo: Persist ConsolidatedRoute & Update Lots Status to 'Assigned'
    API-->>Leaflet: Return RouteDto with Sequenced Stops, Polyline & Cost Savings
    Leaflet-->>Carrier: Render Interactive Route on Map & Waybill Breakdown
```
