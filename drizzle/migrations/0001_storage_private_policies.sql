DROP POLICY IF EXISTS "complaint images public read" ON storage.objects;
CREATE POLICY "complaint images read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'complaint-images' AND public.can_view_complaint(auth.uid(), ((storage.foldername(name))[2])::uuid));