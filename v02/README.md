# Mantaro Frost Alert • Sistema de Alerta Temprana de Heladas

Proyecto desarrollado para el curso **Construcción de Software** (Semana 03 / Hackaton v02).  
Implementa una solución integral con **Clean Architecture** en C# ASP.NET Core (.NET 8), base de datos **PostgreSQL**, y frontend moderno en **React + Vite + Tailwind CSS**, integrando un modelo de Machine Learning híbrido desplegado en VPS para la predicción de heladas meteorológicas en el Valle del Mantaro (Junín, Perú).

---

## 1. Arquitectura del Sistema

```
                    ┌────────────────────────────────────────────────────────┐
                    │               React + Vite + Tailwind CSS              │
                    │   (PredictEvening, History, DataExplorer, Transparency)│
                    └───────────────────────────┬────────────────────────────┘
                                                │ HTTP / REST (JSON)
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │         Backend .NET 8 (Clean Architecture)            │
                    │                                                        │
                    │  [API Layer] Controllers (Predictions, Model, Health)  │
                    │       │                                                │
                    │       ▼                                                │
                    │  [Application Layer] Interfaces, DTOs, Services        │
                    │       │                                                │
                    │       ▼                                                │
                    │  [Domain Layer] Entities (FrostPredictionRecord)       │
                    │       ▲                                                │
                    │       │                                                │
                    │  [Infrastructure Layer]                                │
                    │       ├── EF Core Repositories & DbContext             │
                    │       └── VPS ML Client (HttpClient)                   │
                    └───────────┬────────────────────────────────┬───────────┘
                                │                                │
                                ▼                                ▼
              ┌──────────────────────────────────┐ ┌─────────────────────────┐
              │  PostgreSQL (Port 5433)          │ │  ML VPS Cloud Service   │
              │  Database: mantaro_frost_db      │ │  heladas-api.astrazynk  │
              │  Table: frost_predictions        │ │  (Ridge + Random Forest)│
              └──────────────────────────────────┘ └─────────────────────────┘
```

---

## 2. Estructura de Proyectos

### Backend (`/backend/MantaroFrostAlert.sln`)
- **`MantaroFrostAlert.Domain`**:
  - `Entities/FrostPredictionRecord.cs`: Entidad central del dominio con campos climáticos de las 18:00 h, Tmin pronosticada, descomposición física Ridge, residual Random Forest, nivel de alerta (`RED`, `YELLOW`, `GREEN`) y timestamp de auditoría.
- **`MantaroFrostAlert.Application`**:
  - `DTOs/`: `PredictEveningRequestDto`, `PredictionResponseDto`, `ModelMetadataDto`, `HourlyObservationDto`.
  - `Interfaces/`: `IFrostPredictionRepository`, `IVpsMlClient`, `IFrostPredictionService`.
  - `Services/FrostPredictionService.cs`: Orquesta el consumo del VPS, genera recomendaciones agronómicas para los agricultores del Mantaro (riego por aspersión, mantas térmicas), y persiste en repositorio.
- **`MantaroFrostAlert.Infrastructure`**:
  - `Data/AppDbContext.cs`: Contexto EF Core con mapeo a PostgreSQL y soporte de resiliencia InMemory.
  - `Repositories/FrostPredictionRepository.cs`: Implementación asíncrona del repositorio.
  - `Clients/VpsMlClient.cs`: Cliente HTTP tipado hacia `https://heladas-api.astrazynk.pp.ua`.
- **`MantaroFrostAlert.API`**:
  - `Controllers/PredictionsController.cs`: `POST /api/predictions`, `GET /api/predictions`, `GET /api/predictions/{id}`, `DELETE /api/predictions/{id}`.
  - `Controllers/ModelController.cs`: `GET /api/model/info`.
  - `Controllers/HealthController.cs`: `GET /api/health` (reporta salud de DB y VPS).
  - `Program.cs`: Configuración de CORS, Inyección de Dependencias y Swagger UI.

### Frontend (`/frontend/`)
- **`src/components/`**: Componentes atómicos y limpios (`Sidebar.jsx`, `Header.jsx`, `PageContainer.jsx`, `StatusBadge.jsx`, `Button.jsx`, `InputField.jsx`, `FormMessage.jsx`, `KpiCard.jsx`, `PredictionTable.jsx`, `PredictionRow.jsx`).
- **`src/layouts/MainLayout.jsx`**: Layout maestro con barra lateral, cabecera de conectividad y área principal.
- **`src/pages/`**:
  - `PredictEvening.jsx`: Formulario de predicción a las 18:00 h con botones de escenarios rápidos, validación en vivo, tarjeta de descomposición dual (Ridge + RF) y recomendaciones agronómicas.
  - `PredictionHistory.jsx`: Tabla interactiva de registros con filtros por nivel de alerta (`TODOS`, `ROJO`, `AMARILLO`, `VERDE`), búsqueda por fecha, visor modal de detalles y exportación a CSV.
  - `StationDataExplorer.jsx`: Explorador de datos reales de la estación meteorológica automática del Observatorio de Huayao (IGP) con botón "Simular en Predictor".
  - `ModelTransparency.jsx`: Panel de explicabilidad del modelo híbrido (Ridge + Random Forest), umbrales operativos y validación geográfica.
- **`src/services/`**:
  - `api.js`: Cliente de red con tolerancia a fallos y fallback automático directo al VPS.
  - `frostPredictionService.js`: Capa de servicio desacoplada para consumo del frontend.
- **`src/utils/sampleData.js`**: Datos de prueba y registros históricos extraídos de `IGP_EstacionEMA_data_2018_2025.csv`.

---

## 3. Instrucciones de Ejecución

### Requisitos Previos
- .NET 8 SDK
- Node.js 18+ y npm
- PostgreSQL corriendo en puerto 5433 (base de datos: `mantaro_frost_db`)

### 1. Iniciar el Backend (.NET 8)
```bash
cd backend/MantaroFrostAlert.API
dotnet run --launch-profile http
```
- API REST disponible en: `http://localhost:5029`
- Swagger UI interactivo en: `http://localhost:5029/swagger`

### 2. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
- Aplicación web accesible en: `http://localhost:5173`

---

## 4. Verificación de Compilación
- **Backend**: `dotnet build MantaroFrostAlert.sln` -> `0 Errores, 0 Advertencias`
- **Frontend**: `npm run build` -> `built in 1.01s (0 Errores)`
