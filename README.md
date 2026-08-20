<<<<<<< HEAD
# BAIC BJ30e Fuel & Drive Telemetry Suite

A native-caliber, hybrid-aware fuel economy tracker, instrument cluster distance-to-empty (DTE) range gauge analyzer, daily trip logger, and predictive cost estimator specifically tailored for the **BAIC BJ30e Dual-Motor Hybrid SUV**.

---

## Table of Contents

1. [Vehicle Context & Telemetry Philosophy](#1-vehicle-context--telemetry-philosophy)
2. [Key Capabilities & Highlights](#2-key-capabilities--highlights)
3. [System Architecture & State Management](#3-system-architecture--state-management)
4. [Complete End-to-End Application Flows](#4-complete-end-to-end-application-flows)
   - [Flow 1: Fuel Fill-Up & Range Gauge Logging](#flow-1-fuel-fill-up--range-gauge-logging)
   - [Flow 2: Pending Refuel Resolution & Calibration](#flow-2-pending-refuel-resolution--calibration)
   - [Flow 3: Daily Trip & Odometer Telemetry](#flow-3-daily-trip--odometer-telemetry)
   - [Flow 4: Pre-Trip Fuel Level & Full-Tank Cost Estimator](#flow-4-pre-trip-fuel-level--full-tank-cost-estimator)
   - [Flow 5: Interactive Route & Fuel Planners](#flow-5-interactive-route--fuel-planners)
   - [Flow 6: Visual Analytics, Charts & Trend Auditing](#flow-6-visual-analytics-charts--trend-auditing)
   - [Flow 7: Data Portability (CSV Export/Import & JSON Backups)](#flow-7-data-portability-csv-exportimport--json-backups)
5. [Mathematical Formulations Reference](#5-mathematical-formulations-reference)
6. [Prisma ORM & Relational Schema](#6-prisma-orm--relational-schema)
7. [Getting Started & Development](#7-getting-started--development)

---

## 1. Vehicle Context & Telemetry Philosophy

The **BAIC BJ30e** is a dual-motor intelligent hybrid electric vehicle (HEV). Unlike traditional ICE vehicles that rely strictly on standard fuel needles or odometer trip resets, the BJ30e's digital cockpit displays an adaptive **Distance-to-Empty (DTE) Range Gauge (km)** based on current battery charge state, hybrid energy recuperation, and driving style.

This application treats the instrument cluster's **pre-fueling DTE gauge** and **post-fueling DTE gauge** as primary telemetry inputs:
- **Pre-Fueling Range Gauge ($R_{\text{initial}}$)**: The remaining km displayed on the instrument cluster immediately before fuel is pumped into the tank.
- **Post-Fueling Range Gauge ($R_{\text{post}}$)**: The new range estimate displayed on the cluster after the hybrid system recalculates the added fuel capacity.
- **Added Distance ($\Delta R$)**: The actual effective range added by the refuel event ($R_{\text{post}} - R_{\text{initial}}$).
- **Dynamic Fuel Economy ($\eta$)**: $\frac{\Delta R}{\text{Litres Pumped}}\ (\text{km/L})$.

This methodology allows BJ30e owners to measure how faithfully their vehicle's DTE algorithm tracks actual fuel pumped, observe hybrid powertrain efficiency variations, and predict true trip costs.

---

## 2. Key Capabilities & Highlights

- ⚡ **Instant Range Jump Calculations**: Automatic calculation of range gained, fuel volume, unit costs, and hybrid efficiency.
- 🎯 **Predictive Gauge Forecasting**: Uses chronological running average efficiency to predict what the cluster *should* read after fueling; calculates instrument cluster forecast delta error ($\Delta_{\text{forecast}}$).
- ⏳ **Two-Stage Fuel Logging**: Support for logging fuel at the gas pump and completing the post-fueling range cluster reading later once the cluster stabilizes.
- 🛣️ **Daily Trip & Cumulative Odometer Tracker**: Tracks cumulative odometer readings, auto-calculates daily km driven, maintains a 7-day rolling average, and computes daily fuel expenditure.
- ⛽ **Pre-Trip Quick Checker**: Input current cluster range to instantly get estimated liters remaining in the tank, fuel needed for a 100% full tank, and current price to top-up.
- 🧮 **Interactive Calculators**:
  - *Route Cost Calculator*: Estimates fuel volume and monetary cost for any route with passenger and AC load adjustments.
  - *Budget-to-Distance Converter*: Calculates how far a specific budget (e.g. Rs 5,000) will take you.
  - *Full Tank Fill-up Estimator*: Calculates volume and cost to fill the 52L tank from current range.
- 📊 **Visual Analytics**: Interactive Recharts graphs with fuel economy trends, full-range benchmark references, range delta accuracy scatter, and monthly spend breakdowns.
- 💾 **Data Portability**: Standard CSV export/import and lossless JSON backup/restore with demo data reset capabilities.

---

## 3. System Architecture & State Management

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 + TypeScript SPA                       │
├────────────────────────────────────────────────────────────────────────┤
│                           AppContext Provider                          │
│   ├── Vehicle Configuration (Units, Currencies, Tank Capacity)         │
│   ├── Fuel Entries Collection (Chronological running averages)         │
│   ├── Daily Trips Collection (7-day rolling window averages)           │
│   ├── Pre-Trip Logs Collection                                         │
│   └── Summary KPIs Engine                                              │
├───────────────────────────────┬────────────────────────────────────────┤
│          UI Views             │               Modal Dialogs            │
│   ├── DashboardView           │   ├── LogFuelModal                     │
│   ├── FuelLogView (Cards/Tab) │   ├── CompleteFillModal (Quick Resolve)│
│   ├── TripsView               │   ├── LogTripModal                     │
│   ├── CalculatorView          │   ├── PreTripModal                     │
│   └── SettingsView            │   └── FuelEntryDetailModal             │
├───────────────────────────────┴────────────────────────────────────────┤
│                       LocalStorage Persistence Layer                   │
│          (Instant auto-sync on every create, edit, or delete)          │
└────────────────────────────────────────────────────────────────────────┘
```

The application runs entirely client-side using reactive state management with local persistence, guaranteeing zero network latency, offline reliability, and instant response times.

---

## 4. Complete End-to-End Application Flows

### Flow 1: Fuel Fill-Up & Range Gauge Logging

```
[Gas Station Pump]
       │
       ▼
1. Tap "Log Fill-up" (+)
       │
       ├─► Select Station Preset (Ceypetco, LIOC, Sinopec, Shell, Caltex, Mobil)
       ├─► Input Amount Paid (e.g., Rs 10,000)
       ├─► Input Price per Litre (e.g., Rs 310.00) ──► Auto-calculates Litres Pumped (32.26 L)
       ├─► Input Pre-Fuel Range Gauge (e.g., 95 km)
       │
       ▼
2. Has the cluster updated with the new range reading?
       ├── YES: Enter Post-Fuel Range Gauge (e.g., 670 km)
       │         └─► Instant Metric Preview:
       │               • Distance Gained: +575 km
       │               • Calculated Economy: 17.82 km/L
       │               • Driving Cost: Rs 17.39 / km
       │         └─► Saved as "Calculated Record"
       │
       └── NO (Awaiting cluster or driving away):
                 └─► Leave blank (or toggle "Record cluster reading later")
                 └─► App predicts expected reading (e.g., ~665 km) based on prior economy
                 └─► Saved as "Pending Record" (amber badge)
```

---

### Flow 2: Pending Refuel Resolution & Calibration

```
[Vehicle Instrument Cluster Updates]
       │
       ▼
1. User opens App
       │
       ▼
2. Pending Refuel Ribbon displays:
   "1 Refuel Record Awaiting Final Range Gauge"
       │
       ▼
3. Tap "Complete Latest Pending" (or tap on the pending fuel card)
       │
       ▼
4. Modal opens with pre-fueling context:
   • Pre-fuel gauge: 95 km
   • Fuel pumped: 32.26 L
   • Projected cluster reading: 665 km
       │
       ▼
5. Enter actual stabilized cluster reading (e.g., 670 km)
       │
       ▼
6. Tap "Confirm & Calculate Efficiency":
   • Status transitions from Pending ➔ Completed
   • Triggers celebratory particle effect
   • Updates all rolling averages, KPIs, and charts across the app
```

---

### Flow 3: Daily Trip & Odometer Telemetry

```
[End of Day / Start of Morning]
       │
       ▼
1. Tap "Log Daily Trip" (+)
       │
       ▼
2. Select Date (YYYY-MM-DD)
       │
       ▼
3. Enter Cumulative Total Odometer (e.g., 14,350 km)
       │
       ▼
4. Real-time Telemetry Pipeline executes:
   • Reads previous recorded trip (e.g., 14,280 km)
   • Calculates: Distance Driven Today = 14,350 - 14,280 = 70 km
   • Calculates: Estimated Fuel Cost Today = 70 km × Rs 17.39/km = Rs 1,217.30
   • Computes 7-entry rolling average daily travel distance
       │
       ▼
5. Trip saved to historical log with visual daily delta indicator
```

---

### Flow 4: Pre-Trip Fuel Level & Full-Tank Cost Estimator

```
[Before Starting a Journey]
       │
       ▼
1. Tap "Quick Pre-Trip Check"
       │
       ▼
2. Enter current DTE Range reading from cluster (e.g., 210 km)
       │
       ▼
3. Telemetry Engine computes in real-time:
   • Fuel Remaining in Tank: 210 km / 16.5 km/L = 12.7 Litres
   • Range Deficit to Full Benchmark (665 km): 665 - 210 = 455 km
   • Fuel Needed to Top-Up: 455 km / 16.5 km/L = 27.6 Litres
   • Estimated Cost to Full Tank: 27.6 L × Rs 310/L = Rs 8,556.00
       │
       ▼
4. Tap "Save to Pre-Trip Log" for telemetry record
```

---

### Flow 5: Interactive Route & Fuel Planners

The **Calculator & Planner** tab provides three specialized computational engines:

#### 1. Route Cost Estimator
- Input journey distance in kilometers (e.g., 180 km).
- Toggle passenger load (1–5 persons) and AC usage (+5% consumption factor).
- Computes estimated fuel needed, total journey cost, and cost per passenger.

#### 2. Fuel Budget-to-Distance Converter
- Input available budget (e.g., Rs 5,000).
- Calculates exact liters receivable and maximum estimated highway/city driving distance.

#### 3. Tank Top-Up Estimator
- Input current fuel gauge or percentage.
- Computes volume required to reach 52.0 L full tank and exact cost at current fuel rates.

---

### Flow 6: Visual Analytics, Charts & Trend Auditing

The **Dashboard** and **Fuel Log** views render synchronized data visualizations:
- **Fuel Economy History (km/L)**: Recharts line series comparing actual fill-up efficiency against the vehicle's full-range benchmark.
- **Instrument Cluster DTE Leap Progression**: Visual pre-fuel $\to$ added distance $\to$ post-fuel bar graphs.
- **7-Day Rolling Trip Mileage**: Bar charts tracking daily usage patterns.
- **Economy Status Badges**: Micro-badges indicating *Optimal (≥13.5 km/L)*, *Normal (11.5–13.4 km/L)*, or *Pending*.

---

### Flow 7: Data Portability (CSV Export/Import & JSON Backups)

In **Settings** (or direct from the Fuel Log header):
- **Export CSV**: Generates standard RFC 4180 CSV files containing date, spend, unit price, volume, pre/post gauges, calculated km/L, cost/km, station, and notes.
- **Import CSV**: Parses user spreadsheets and appends or reconciles records.
- **Export JSON Backup**: Full snapshot of vehicle config, fuel entries, daily trips, and pre-trip checks.
- **Restore JSON Backup**: 1-click restore from file.
- **Reset to Demo Data**: Instantly populates realistic BAIC BJ30e telemetry data for demonstration and testing.

---

## 5. Mathematical Formulations Reference

All calculation functions are pure and defined in `src/utils/calculations.ts`.

| Metric | Symbol | Mathematical Formula | Units |
| :--- | :---: | :--- | :---: |
| **Fuel Volume Pumped** | $V$ | $V = \frac{\text{Amount Paid}}{\text{Price Per Litre}}$ | Litres ($\text{L}$) |
| **Effective Range Added** | $\Delta R$ | $\Delta R = R_{\text{post}} - R_{\text{initial}}$ | $\text{km}$ |
| **Fill Fuel Economy** | $\eta_{\text{fill}}$ | $\eta_{\text{fill}} = \frac{\Delta R}{V}$ | $\text{km/L}$ |
| **Cost Per Kilometer** | $C_{\text{km}}$ | $C_{\text{km}} = \frac{\text{Amount Paid}}{\Delta R} = \frac{\text{Price Per Litre}}{\eta_{\text{fill}}}$ | $\text{Currency/km}$ |
| **Running Average Economy** | $\bar{\eta}_i$ | $\bar{\eta}_i = \frac{\sum_{k=1}^{i-1} \Delta R_k}{\sum_{k=1}^{i-1} V_k}$ | $\text{km/L}$ |
| **Expected Post-Fuel Gauge** | $\hat{R}_{\text{post}}$ | $\hat{R}_{\text{post}} = R_{\text{initial}} + (V \times \bar{\eta}_i)$ | $\text{km}$ |
| **Forecast Error Delta** | $\Delta_{\text{forecast}}$ | $\Delta_{\text{forecast}} = R_{\text{post}} - \hat{R}_{\text{post}}$ | $\text{km}$ |
| **Daily Distance Driven** | $D_{\text{day}}$ | $D_{\text{day}} = \text{Odo}_{\text{today}} - \text{Odo}_{\text{yesterday}}$ | $\text{km}$ |
| **7-Day Rolling Distance** | $\bar{D}_{\text{7d}}$ | $\bar{D}_{\text{7d}} = \frac{1}{N} \sum_{j=0}^{N-1} D_{\text{day}, i-j} \quad (N \le 7)$ | $\text{km}$ |
| **Daily Fuel Cost** | $C_{\text{day}}$ | $C_{\text{day}} = D_{\text{day}} \times \bar{C}_{\text{km}}$ | $\text{Currency}$ |
| **Estimated Fuel Remaining** | $V_{\text{rem}}$ | $V_{\text{rem}} = \frac{R_{\text{current}}}{\bar{\eta}}$ | $\text{Litres}$ |
| **Top-Up Fuel Needed** | $V_{\text{topup}}$ | $V_{\text{topup}} = \frac{\max(0, R_{\text{benchmark}} - R_{\text{current}})}{\bar{\eta}}$ | $\text{Litres}$ |

---

## 6. Prisma ORM & Relational Schema

For developers wishing to connect a backend database (PostgreSQL, MySQL, CockroachDB, or SQLite), the schema is available at `prisma/schema.prisma`.

### Key Entities & Relations

```
┌────────────────┐          1:N          ┌─────────────────────┐
│      User      │───────────────────────┤    VehicleConfig    │
│  (id, email)   │                       │ (tank, benchmark)   │
└───────┬────────┘                       └──────────┬──────────┘
        │                                           │
        │ 1:N                                       │ 1:N
        ├───────────────────────────────────────────┤
        │                                           │
        ▼                                           ▼
┌──────────────────┐                     ┌─────────────────────┐
│    FuelEntry     │                     │      DailyTrip      │
│ (pre/post gauge, │                     │  (date, total odo,  │
│  amount, litres) │                     │   distance delta)   │
└──────────────────┘                     └─────────────────────┘
        │                                           │
        ▼                                           ▼
┌──────────────────┐                     ┌─────────────────────┐
│    PreTripLog    │                     │    AiAuditReport    │
│  (gauge, notes)  │                     │  (economy rating)   │
└──────────────────┘                     └─────────────────────┘
```

To initialize Prisma in a Node.js/Express backend environment:
```bash
# Generate the Prisma Client
npx prisma generate

# Push schema directly to database (development)
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init_vehicle_telemetry
```

---

## 7. Getting Started & Development

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser

### Installation & Execution
```bash
# Install dependencies
npm install

# Start Vite development server (Port 3000)
npm run dev

# Run TypeScript type validation & linter
npm run lint

# Compile production build to dist/
npm run build
```

---

*Built with React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti, and Zod.*
=======
# fuel_tracker
Tracking Fuel Consumption and Monthly fuelling.
>>>>>>> 6b5e89cc337483ca96d48c167cccd1cbcb8133c0
