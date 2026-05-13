-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  bio text,
  level integer default 1,
  xp integer default 0,
  xp_next integer default 500,
  level_title text default 'Newcomer',
  countries_count integer default 0,
  stays_count integer default 0,
  vouches_count integer default 0,
  missions_count integer default 0,
  joined_date date default now(),
  socials jsonb default '{}'::jsonb,
  countries text[] default '{}'::text[]
);

-- Posts (Feed)
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  image_url text,
  flair text default 'note',
  likes_count integer default 0,
  timestamp timestamptz default now()
);

-- Comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references auth.users not null,
  text text not null,
  timestamp timestamptz default now()
);

-- Stays
create table if not exists public.stays (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  hotel text not null,
  country text not null,
  booking_id text not null,
  check_in date,
  check_out date,
  verified boolean default false,
  timestamp timestamptz default now()
);

-- Missions
create table if not exists public.missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text,
  description text,
  cities text,
  spots_left integer,
  image_url text,
  creator_id uuid references auth.users not null,
  timestamp timestamptz default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.stays enable row level security;
alter table public.missions enable row level security;

-- Policies for Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Policies for Posts
drop policy if exists "Posts are viewable by everyone." on public.posts;
create policy "Posts are viewable by everyone." on public.posts for select using (true);
drop policy if exists "Users can create posts." on public.posts;
create policy "Users can create posts." on public.posts for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete own posts." on public.posts;
create policy "Users can delete own posts." on public.posts for delete using (auth.uid() = user_id);

-- Policies for Comments
drop policy if exists "Comments are viewable by everyone." on public.comments;
create policy "Comments are viewable by everyone." on public.comments for select using (true);
drop policy if exists "Users can comment." on public.comments;
create policy "Users can comment." on public.comments for insert with check (auth.uid() = user_id);

-- Policies for Stays
drop policy if exists "Users can see own stays." on public.stays;
create policy "Users can see own stays." on public.stays for select using (auth.uid() = user_id);
drop policy if exists "Users can submit stays." on public.stays;
create policy "Users can submit stays." on public.stays for insert with check (auth.uid() = user_id);

-- Policies for Missions
drop policy if exists "Missions are viewable by everyone." on public.missions;
create policy "Missions are viewable by everyone." on public.missions for select using (true);
drop policy if exists "Verified users can create missions." on public.missions;
create policy "Verified users can create missions." on public.missions for insert with check (auth.uid() = creator_id);
