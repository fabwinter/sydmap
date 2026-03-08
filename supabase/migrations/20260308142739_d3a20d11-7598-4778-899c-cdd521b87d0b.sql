
-- Add cover_photo_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;

-- Create storage bucket for cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover-photos', 'cover-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own cover photos
CREATE POLICY "Users can upload cover photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own cover photos
CREATE POLICY "Users can update cover photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own cover photos
CREATE POLICY "Users can delete cover photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cover-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to cover photos
CREATE POLICY "Public read access to cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cover-photos');
