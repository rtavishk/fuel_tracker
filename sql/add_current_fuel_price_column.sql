-- Add current_fuel_price column to vehicles table
-- This column stores the active fuel price for each vehicle

DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vehicles'
        AND column_name = 'current_fuel_price'
    ) THEN
        ALTER TABLE vehicles
        ADD COLUMN current_fuel_price DOUBLE PRECISION DEFAULT 106.5;
        
        RAISE NOTICE 'Added current_fuel_price column to vehicles table';
    ELSE
        RAISE NOTICE 'current_fuel_price column already exists in vehicles table';
    END IF;
END $$;
