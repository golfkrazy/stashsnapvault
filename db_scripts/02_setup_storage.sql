-- Create a bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up access controls for storage
-- 1. Allow public access to view any avatar
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Allow users to upload to their own folder
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Allow users to update files in their own folder
create policy "Users can update their own files"
  on storage.objects for update
  using ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Allow users to delete files in their own folder
create policy "Users can delete their own files"
  on storage.objects for delete
  using ( 
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
