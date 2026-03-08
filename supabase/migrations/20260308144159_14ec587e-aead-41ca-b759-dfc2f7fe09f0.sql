
-- Allow authenticated users to view any profile (needed for friends search)
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
