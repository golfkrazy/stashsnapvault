-- Set up access controls for the item-photos storage bucket
-- 1. Allow public access to view any item photo
create policy "Item photos are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'item-photos' );

-- 2. Allow users to upload to their own folder (folder name is user_id)
create policy "Users can upload item photos to their own folder"
  on storage.objects for insert
  with check ( 
    bucket_id = 'item-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Allow users to update files in their own folder
create policy "Users can update their own item photos"
  on storage.objects for update
  using ( 
    bucket_id = 'item-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Allow users to delete files in their own folder
create policy "Users can delete their own item photos"
  on storage.objects for delete
  using ( 
    bucket_id = 'item-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
