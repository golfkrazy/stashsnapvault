-- Create a table for public profiles
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  
  -- User Identification
  email text,
  first_name text,
  last_name text,
  
  -- Profile Details
  bio text,
  avatar_url text,
  location text,
  timezone text,
  preferred_language text,
  
  -- Status
  profile_completed boolean default false
);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.user_profiles
  for select using (true);

create policy "Users can insert their own profile." on public.user_profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.user_profiles
  for update using ((select auth.uid()) = id);

-- Trigger to automatically create a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (
    id, 
    email, 
    first_name, 
    avatar_url,
    created_at
  )
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', -- Attempt to map full_name to first_name initially if present
    new.raw_user_meta_data->>'avatar_url',
    new.created_at
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger (dropping first to ensure clean state if re-running)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
