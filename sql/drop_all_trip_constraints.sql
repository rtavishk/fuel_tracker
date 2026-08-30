-- Drop all unique constraints on trip_entries table
-- This ensures multiple trips can be added per day

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop any unique constraints on trip_entries
    FOR constraint_name IN 
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'trip_entries'::regclass
        AND contype = 'u'
    LOOP
        EXECUTE format('ALTER TABLE trip_entries DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
    
    RAISE NOTICE 'All unique constraints removed from trip_entries';
END $$;
