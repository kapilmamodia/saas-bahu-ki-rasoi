-- Migration: create the invoices storage bucket for PDF invoice files.
-- Run this in Supabase SQL editor or via supabase db push.

-- Create private invoices bucket (not publicly accessible — uses signed URLs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,                          -- private — access via signed URLs only
  10485760,                       -- 10 MB limit per file
  ARRAY['application/pdf']        -- only PDFs allowed
)
ON CONFLICT (id) DO NOTHING;     -- safe to re-run

-- Allow the service role to upload and read from the invoices bucket
-- (service role bypasses RLS, so no policy needed for server-side operations)

-- Allow authenticated users (admins) to read invoice files
CREATE POLICY "Admins can read invoices"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'invoices');

