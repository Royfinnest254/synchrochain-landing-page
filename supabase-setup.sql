-- Waitlist table for SynchroChain landing page
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Create the waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    interest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for signups from the public site)
CREATE POLICY "Allow public inserts" ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow updating existing records (for upsert on duplicate email)
CREATE POLICY "Allow public updates" ON public.waitlist
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy: Allow counting records for the live counter (select with count)
CREATE POLICY "Allow public count" ON public.waitlist
    FOR SELECT
    USING (true);

-- Enable real-time for the waitlist table
-- Go to Database > Replication and enable the 'waitlist' table
-- OR run this (requires superuser/service role):
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist;

-- Create index for faster email lookups (for duplicate checking)
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Optional: Create index for analytics by interest
CREATE INDEX IF NOT EXISTS idx_waitlist_interest ON public.waitlist(interest);
