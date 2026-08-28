-- ========================================================================
-- FUEL TRACKER — POSTGRESQL & SUPABASE PRODUCTION SCHEMA WITH RLS
-- Dual Odometer Domain: Distance-to-Empty Gauge (Fuel) vs Cumulative Total Odo (Trips)
-- Compatible with Prisma ORM & Supabase Authentication & Realtime
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. PROFILES / USERS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    currency_symbol TEXT DEFAULT 'Rs.',
    distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'mi')),
    volume_unit TEXT DEFAULT 'L' CHECK (volume_unit IN ('L', 'gal')),
    target_efficiency NUMERIC(5,2) DEFAULT 14.5,
    icloud_sync_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------
-- 2. VEHICLES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    license_plate TEXT,
    tank_capacity_litres NUMERIC(6,2) NOT NULL DEFAULT 47.00,
    -- Clustered Distance-to-Empty Range Gauge benchmark when tank is filled full (~650-680 km)
    full_range_benchmark_km NUMERIC(7,2) DEFAULT 680.00,
    -- Real cumulative total odometer reading (e.g. 42,850 km)
    current_cumulative_odometer NUMERIC(9,2) NOT NULL DEFAULT 0.00,
    fuel_type TEXT DEFAULT 'Petrol (95)',
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------
-- 3. FUEL ENTRIES (Fill-Up Log)
-- IMPORTANT DOMAIN DISTINCTION:
-- current_range_gauge and after_fueling_range_gauge are DISTANCE-TO-EMPTY gauges,
-- NOT cumulative total odometer.
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fuel_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME,
    amount_paid NUMERIC(10,2) NOT NULL CHECK (amount_paid > 0),
    price_per_litre NUMERIC(8,3) NOT NULL CHECK (price_per_litre > 0),
    -- Stored for data integrity: litres_fueled = amount_paid / price_per_litre
    litres_fueled NUMERIC(8,3) NOT NULL,
    -- Gauge BEFORE fueling (Distance-To-Empty reading, e.g. 85 km)
    current_range_gauge NUMERIC(7,2) NOT NULL,
    -- Gauge AFTER fueling (Distance-To-Empty reading, e.g. 675 km). NULL = pending state.
    after_fueling_range_gauge NUMERIC(7,2),
    fuel_station TEXT,
    notes TEXT,
    is_full_tank BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------
-- 4. DAILY TRIP LOG (Uses Cumulative Total Odometer)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trip_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- Cumulative total car odometer (e.g. 42,150 km)
    total_cumulative_odometer NUMERIC(9,2) NOT NULL,
    category TEXT DEFAULT 'Commute' CHECK (category IN ('Commute', 'Highway', 'City', 'Business', 'Roadtrip', 'Errand', 'Other')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (vehicle_id, date)
);

-- ------------------------------------------------------------------------
-- 5. PRE-TRIP LOG ENTRIES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pretrip_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    -- Current remaining range gauge reading (e.g. 520 km)
    current_range_gauge NUMERIC(7,2) NOT NULL,
    trip_purpose TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------
-- 6. ENGINE MAINTENANCE SCHEDULES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Engine', 'Fluids', 'Chassis', 'Filters', 'Electrical', 'Safety')),
    interval_km INT NOT NULL CHECK (interval_km > 0),
    interval_months INT,
    last_service_odometer NUMERIC(9,2) NOT NULL DEFAULT 0.00,
    last_service_date DATE NOT NULL,
    estimated_cost NUMERIC(10,2),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fuel_entries_user_veh ON public.fuel_entries(user_id, vehicle_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trip_entries_user_veh ON public.trip_entries(user_id, vehicle_id, date ASC);
CREATE INDEX IF NOT EXISTS idx_pretrip_entries_user_veh ON public.pretrip_entries(user_id, vehicle_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_veh ON public.maintenance_schedules(vehicle_id);

-- ------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Note: Disabled for now since Supabase Auth is not configured
-- Can be enabled later when authentication is set up
-- ------------------------------------------------------------------------
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.trip_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pretrip_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (commented out - enable when auth is configured)
-- CREATE POLICY "Users can view own profile"
--     ON public.profiles FOR SELECT
--     USING (auth.uid() = id);

-- CREATE POLICY "Users can update own profile"
--     ON public.profiles FOR UPDATE
--     USING (auth.uid() = id);

-- CREATE POLICY "Users can insert own profile"
--     ON public.profiles FOR INSERT
--     WITH CHECK (auth.uid() = id);

-- Vehicles Policies (commented out - enable when auth is configured)
-- CREATE POLICY "Users can CRUD own vehicles"
--     ON public.vehicles FOR ALL
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);

-- Fuel Entries Policies (commented out - enable when auth is configured)
-- CREATE POLICY "Users can CRUD own fuel entries"
--     ON public.fuel_entries FOR ALL
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);

-- Trip Entries Policies (commented out - enable when auth is configured)
-- CREATE POLICY "Users can CRUD own trip entries"
--     ON public.trip_entries FOR ALL
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);

-- Pre-trip Entries Policies (commented out - enable when auth is configured)
-- CREATE POLICY "Users can CRUD own pretrip entries"
--     ON public.pretrip_entries FOR ALL
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);

-- Maintenance Schedules Policies (commented out - enable when auth is configured)
-- CREATE POLICY "Users can CRUD own maintenance schedules"
--     ON public.maintenance_schedules FOR ALL
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------
-- 9. REALTIME REPLICATION ENABLEMENT
-- ------------------------------------------------------------------------
-- Drop publication if it exists, then create it
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pretrip_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_schedules;

-- Add missing column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'target_efficiency'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN target_efficiency NUMERIC(5,2) DEFAULT 14.5;
    END IF;
END $$;
