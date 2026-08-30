-- Remove unique constraint on trip_entries to allow multiple trips per day
-- This allows users to log multiple trips for the same vehicle on the same day

DO $$
BEGIN
    -- Drop the unique constraint if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'trip_entries'
        AND constraint_type = 'UNIQUE'
    ) THEN
        ALTER TABLE trip_entries DROP CONSTRAINT IF EXISTS trip_entries_vehicleId_date_key;
        RAISE NOTICE 'Removed unique constraint from trip_entries table';
    ELSE
        RAISE NOTICE 'No unique constraint found on trip_entries table';
    END IF;
END $$;
