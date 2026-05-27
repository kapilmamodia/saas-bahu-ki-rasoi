-- Storage policies for menu-photos bucket
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zqwfrhxmlwdwskkdcgwz/sql

-- Allow authenticated users (admin) to upload photos
CREATE POLICY "Authenticated users can upload menu photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'menu-photos');

-- Allow public to view photos (bucket is public anyway but belt+suspenders)
CREATE POLICY "Public can view menu photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'menu-photos');

-- Allow authenticated users to update/replace photos
CREATE POLICY "Authenticated users can update menu photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'menu-photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete menu photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'menu-photos');

