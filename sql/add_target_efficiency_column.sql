-- Add missing target_efficiency column to profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'target_efficiency'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN target_efficiency NUMERIC(5,2) DEFAULT 14.5;
    END IF;
END $$;

-- Add missing icloud_sync_enabled column to profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'icloud_sync_enabled'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN icloud_sync_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;