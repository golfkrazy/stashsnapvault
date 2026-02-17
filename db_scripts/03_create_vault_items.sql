-- Create a table for vault items
create table vault_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  category text not null,
  location text,
  value decimal(12,2) default 0.00,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table vault_items enable row level security;

-- 1. Allow users to see only their own items
create policy "Users can view their own vault items."
  on vault_items for select
  using ( auth.uid() = user_id );

-- 2. Allow users to insert their own items
create policy "Users can insert their own vault items."
  on vault_items for insert
  with check ( auth.uid() = user_id );

-- 3. Allow users to update their own items
create policy "Users can update their own vault items."
  on vault_items for update
  using ( auth.uid() = user_id );

-- 4. Allow users to delete their own items
create policy "Users can delete their own vault items."
  on vault_items for delete
  using ( auth.uid() = user_id );

-- Create a trigger to update the updated_at column
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on vault_items
for each row
execute function handle_updated_at();
