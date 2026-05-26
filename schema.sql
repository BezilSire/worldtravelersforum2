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
  countries text[] default '{}'::text[],
  username text,
  home_country text
);

-- Index: profile lookups by name/search
create index if not exists idx_profiles_full_name on public.profiles (full_name);

-- Posts (Feed)
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  text text not null,
  image_url text,
  flair text default 'note',
  likes_count integer default 0,
  timestamp timestamptz default now()
);

create index if not exists idx_posts_timestamp_desc on public.posts (timestamp desc);
create index if not exists idx_posts_user_id on public.posts (user_id);

-- Comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references auth.users not null,
  text text not null,
  timestamp timestamptz default now()
);

create index if not exists idx_comments_post_id_timestamp on public.comments (post_id, timestamp);

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

create index if not exists idx_stays_user_id_timestamp on public.stays (user_id, timestamp desc);
create index if not exists idx_stays_verified on public.stays (verified, user_id);

-- Missions
create table if not exists public.missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text,
  description text,
  cities text,
  spots_left integer,
  image_url text,
  creator_id uuid references auth.users,
  timestamp timestamptz default now()
);

create index if not exists idx_missions_timestamp_desc on public.missions (timestamp desc);
create index if not exists idx_missions_creator_id on public.missions (creator_id);

-- Post Likes (normalized like tracking)
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

create index if not exists idx_post_likes_post_id on public.post_likes (post_id);
create index if not exists idx_post_likes_user_id on public.post_likes (user_id);

-- Trigger: auto-update likes_count on posts when a like is added/removed
create or replace function public.update_post_likes_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_likes_insert on public.post_likes;
create trigger trg_post_likes_insert
  after insert on public.post_likes
  for each row execute function public.update_post_likes_count();

drop trigger if exists trg_post_likes_delete on public.post_likes;
create trigger trg_post_likes_delete
  after delete on public.post_likes
  for each row execute function public.update_post_likes_count();

-- Discussions (destinations)
create table if not exists public.discussions (
  id text primary key,
  destination text not null,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- Discussion Posts
create table if not exists public.discussion_posts (
  id uuid default gen_random_uuid() primary key,
  discussion_id text references public.discussions on delete cascade not null,
  user_id uuid references auth.users not null,
  user_name text,
  text text not null,
  parent_id uuid references public.discussion_posts on delete cascade,
  topic text default 'general',
  edited boolean default false,
  updated_at timestamptz,
  timestamp timestamptz default now()
);

create index if not exists idx_discussion_posts_discussion_id_timestamp on public.discussion_posts (discussion_id, timestamp desc);
create index if not exists idx_discussion_posts_parent_id on public.discussion_posts (parent_id);

-- Mission Participants
create table if not exists public.mission_participants (
  id uuid default gen_random_uuid() primary key,
  mission_id uuid references public.missions on delete cascade not null,
  user_id uuid references auth.users not null,
  user_name text,
  avatar_url text,
  joined_at timestamptz default now(),
  unique (mission_id, user_id)
);

create index if not exists idx_mission_participants_mission_id on public.mission_participants (mission_id);
create index if not exists idx_mission_participants_user_id on public.mission_participants (user_id);

-- Destination Discussion Messages (legacy, for backward compatibility)
create table if not exists public.discussion_messages (
  id uuid default gen_random_uuid() primary key,
  destination_id text not null,
  user_id uuid references auth.users not null,
  text text not null,
  parent_id uuid references public.discussion_messages,
  timestamp timestamptz default now()
);

create index if not exists idx_discussion_messages_destination_id_timestamp on public.discussion_messages (destination_id, timestamp desc);

-- Group Chats (for missions)
create table if not exists public.group_chats (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  mission_id uuid references public.missions on delete cascade,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

create index if not exists idx_group_chats_mission_id on public.group_chats (mission_id);

-- Group Chat Members
create table if not exists public.group_chat_members (
  id uuid default gen_random_uuid() primary key,
  group_chat_id uuid references public.group_chats on delete cascade not null,
  user_id uuid references auth.users not null,
  unique (group_chat_id, user_id)
);

create index if not exists idx_group_chat_members_lookup on public.group_chat_members (group_chat_id, user_id);

-- Group Chat Messages
create table if not exists public.group_chat_messages (
  id uuid default gen_random_uuid() primary key,
  group_chat_id uuid references public.group_chats on delete cascade not null,
  user_id uuid references auth.users not null,
  user_name text,
  text text not null,
  reactions jsonb default '{}'::jsonb,
  edited boolean default false,
  updated_at timestamptz,
  timestamp timestamptz default now()
);

create index if not exists idx_group_chat_messages_chat_id_timestamp on public.group_chat_messages (group_chat_id, timestamp);

-- Direct Messages
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users not null,
  sender_name text,
  receiver_id uuid references auth.users not null,
  text text not null,
  reactions jsonb default '{}'::jsonb,
  edited boolean default false,
  updated_at timestamptz,
  timestamp timestamptz default now()
);

create index if not exists idx_direct_messages_participants_timestamp on public.direct_messages (sender_id, receiver_id, timestamp desc);
create index if not exists idx_direct_messages_receiver_timestamp on public.direct_messages (receiver_id, timestamp desc);

-- Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  timestamp timestamptz default now()
);

create index if not exists idx_notifications_user_id_read_timestamp on public.notifications (user_id, read, timestamp desc);

-- Vouches
create table if not exists public.vouches (
  id uuid default gen_random_uuid() primary key,
  from_id uuid references auth.users not null,
  to_id uuid references auth.users not null,
  created_at timestamptz default now(),
  unique (from_id, to_id)
);

create index if not exists idx_vouches_to_id on public.vouches (to_id);

-- Feed Events (system activity stream)
create table if not exists public.feed_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  type text default 'system_update',
  text text not null,
  user_name text,
  user_avatar text,
  flair text default 'system_update',
  timestamp timestamptz default now()
);

create index if not exists idx_feed_events_timestamp_desc on public.feed_events (timestamp desc);

-- Test Missions
create table if not exists public.test_missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text,
  destination text,
  city text,
  description text,
  duration text,
  support text[] default '{}'::text[],
  requirements text[] default '{}'::text[],
  image text,
  image_url text,
  created_at timestamptz default now()
);

-- Test Mission Applications
create table if not exists public.test_mission_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mission_title text,
  user_name text,
  country text,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_test_mission_applications_user_id on public.test_mission_applications (user_id);
create index if not exists idx_test_mission_applications_status on public.test_mission_applications (status);

-- ============================================================
-- RATE LIMITING
-- ============================================================

create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users not null,
  action_type text not null,
  window_start timestamptz not null,
  count int not null default 1,
  unique (user_id, action_type, window_start)
);

create index if not exists idx_rate_limits_lookup on public.rate_limits (user_id, action_type, window_start);

create or replace function public.check_rate_limit(
  p_action_type text,
  p_max_requests int,
  p_window_minutes int default 1
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_window_start timestamptz;
  v_count int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then return false; end if;

  v_window_start := date_trunc('minute', now()) - ((p_window_minutes - 1) * interval '1 minute');

  delete from public.rate_limits
  where user_id = v_user_id
    and action_type = p_action_type
    and window_start < v_window_start;

  select coalesce(sum(count), 0) into v_count
  from public.rate_limits
  where user_id = v_user_id
    and action_type = p_action_type
    and window_start >= v_window_start;

  if v_count >= p_max_requests then
    return false;
  end if;

  insert into public.rate_limits (user_id, action_type, window_start, count)
  values (v_user_id, p_action_type, v_window_start, 1)
  on conflict (user_id, action_type, window_start)
  do update set count = public.rate_limits.count + 1;

  return true;
end;
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.stays enable row level security;
alter table public.missions enable row level security;
alter table public.post_likes enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_posts enable row level security;
alter table public.mission_participants enable row level security;
alter table public.discussion_messages enable row level security;
alter table public.group_chats enable row level security;
alter table public.group_chat_members enable row level security;
alter table public.group_chat_messages enable row level security;
alter table public.direct_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.vouches enable row level security;
alter table public.feed_events enable row level security;
alter table public.test_missions enable row level security;
alter table public.test_mission_applications enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Posts: system broadcasts can have null user_id
drop policy if exists "Posts are viewable by everyone." on public.posts;
create policy "Posts are viewable by everyone." on public.posts for select using (true);
drop policy if exists "Users can create posts." on public.posts;
create policy "Users can create posts." on public.posts for insert with check ((auth.uid() = user_id or user_id is null) and (user_id is null or public.check_rate_limit('create_post', 5, 1)));
drop policy if exists "Users can update own posts." on public.posts;
create policy "Users can update own posts." on public.posts for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own posts." on public.posts;
create policy "Users can delete own posts." on public.posts for delete using (auth.uid() = user_id);

-- Comments
drop policy if exists "Comments are viewable by everyone." on public.comments;
create policy "Comments are viewable by everyone." on public.comments for select using (true);
drop policy if exists "Users can comment." on public.comments;
create policy "Users can comment." on public.comments for insert with check (auth.uid() = user_id and public.check_rate_limit('add_comment', 10, 1));
drop policy if exists "Users can update own comments." on public.comments;
create policy "Users can update own comments." on public.comments for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own comments." on public.comments;
create policy "Users can delete own comments." on public.comments for delete using (auth.uid() = user_id);

-- Stays
drop policy if exists "Users can see own stays." on public.stays;
create policy "Users can see own stays." on public.stays for select using (auth.uid() = user_id);
drop policy if exists "Users can submit stays." on public.stays;
create policy "Users can submit stays." on public.stays for insert with check (auth.uid() = user_id and public.check_rate_limit('submit_stay', 5, 1));

-- Missions
drop policy if exists "Missions are viewable by everyone." on public.missions;
create policy "Missions are viewable by everyone." on public.missions for select using (true);
drop policy if exists "Users can create missions." on public.missions;
create policy "Users can create missions." on public.missions for insert with check (auth.uid() = creator_id and public.check_rate_limit('create_mission', 3, 1));

-- Post Likes
drop policy if exists "Post likes are viewable by everyone." on public.post_likes;
create policy "Post likes are viewable by everyone." on public.post_likes for select using (true);
drop policy if exists "Users can like posts." on public.post_likes;
create policy "Users can like posts." on public.post_likes for insert with check (auth.uid() = user_id and public.check_rate_limit('like_post', 30, 1));
drop policy if exists "Users can unlike posts." on public.post_likes;
create policy "Users can unlike posts." on public.post_likes for delete using (auth.uid() = user_id);

-- Discussions
drop policy if exists "Discussions are viewable by everyone." on public.discussions;
create policy "Discussions are viewable by everyone." on public.discussions for select using (true);
drop policy if exists "Users can create discussions." on public.discussions;
create policy "Users can create discussions." on public.discussions for insert with check (auth.uid() = created_by and public.check_rate_limit('start_discussion', 5, 1));

-- Discussion Posts
drop policy if exists "Discussion posts are viewable by everyone." on public.discussion_posts;
create policy "Discussion posts are viewable by everyone." on public.discussion_posts for select using (true);
drop policy if exists "Users can post in discussions." on public.discussion_posts;
create policy "Users can post in discussions." on public.discussion_posts for insert with check (auth.uid() = user_id and public.check_rate_limit('discussion_post', 15, 1));
drop policy if exists "Users can edit own discussion posts." on public.discussion_posts;
create policy "Users can edit own discussion posts." on public.discussion_posts for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own discussion posts." on public.discussion_posts;
create policy "Users can delete own discussion posts." on public.discussion_posts for delete using (auth.uid() = user_id);

-- Mission Participants
drop policy if exists "Participants viewable by everyone." on public.mission_participants;
create policy "Participants viewable by everyone." on public.mission_participants for select using (true);
drop policy if exists "Users can join missions." on public.mission_participants;
create policy "Users can join missions." on public.mission_participants for insert with check (auth.uid() = user_id and public.check_rate_limit('join_mission', 5, 1));

-- Discussion Messages (legacy)
drop policy if exists "Discussion messages viewable by everyone." on public.discussion_messages;
create policy "Discussion messages viewable by everyone." on public.discussion_messages for select using (true);
drop policy if exists "Users can post in discussions." on public.discussion_messages;
create policy "Users can post in discussions." on public.discussion_messages for insert with check (auth.uid() = user_id);

-- Group Chats
drop policy if exists "Group chats viewable by members." on public.group_chats;
create policy "Group chats viewable by members." on public.group_chats for select using (
  exists (
    select 1 from public.group_chat_members
    where group_chat_id = id and user_id = auth.uid()
  ) or auth.uid() = created_by
);

-- Group Chat Members
drop policy if exists "Members viewable by members." on public.group_chat_members;
create policy "Members viewable by members." on public.group_chat_members for select using (true);
drop policy if exists "Users can join group chats." on public.group_chat_members;
create policy "Users can join group chats." on public.group_chat_members for insert with check (auth.uid() = user_id and public.check_rate_limit('join_group_chat', 5, 1));

-- Group Chat Messages: uses EXISTS with index-friendly lookup
drop policy if exists "Group messages viewable by members." on public.group_chat_messages;
create policy "Group messages viewable by members." on public.group_chat_messages for select using (
  exists (
    select 1 from public.group_chat_members
    where group_chat_id = group_chat_id and user_id = auth.uid()
  )
);
drop policy if exists "Users can message in groups." on public.group_chat_messages;
create policy "Users can message in groups." on public.group_chat_messages for insert with check (auth.uid() = user_id and public.check_rate_limit('group_msg', 20, 1));
drop policy if exists "Users can update own group messages" on public.group_chat_messages;
create policy "Users can update own group messages" on public.group_chat_messages for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own group messages" on public.group_chat_messages;
create policy "Users can delete own group messages" on public.group_chat_messages for delete using (auth.uid() = user_id);

-- Direct Messages
drop policy if exists "Users can see their own DMs." on public.direct_messages;
create policy "Users can see their own DMs." on public.direct_messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
drop policy if exists "Users can send DMs." on public.direct_messages;
create policy "Users can send DMs." on public.direct_messages for insert with check (auth.uid() = sender_id and public.check_rate_limit('send_message', 20, 1));
drop policy if exists "Users can update own DMs" on public.direct_messages;
create policy "Users can update own DMs" on public.direct_messages for update using (auth.uid() = sender_id);
drop policy if exists "Users can delete own DMs" on public.direct_messages;
create policy "Users can delete own DMs" on public.direct_messages for delete using (auth.uid() = sender_id);

-- Notifications
drop policy if exists "Users see own notifications." on public.notifications;
create policy "Users see own notifications." on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "System can create notifications." on public.notifications;
create policy "System can create notifications." on public.notifications for insert with check (true);

-- Vouches
drop policy if exists "Vouches are viewable by everyone." on public.vouches;
create policy "Vouches are viewable by everyone." on public.vouches for select using (true);
drop policy if exists "Users can vouch." on public.vouches;
create policy "Users can vouch." on public.vouches for insert with check (auth.uid() = from_id and public.check_rate_limit('vouch', 10, 1));

-- Feed Events
drop policy if exists "Feed events viewable by everyone." on public.feed_events;
create policy "Feed events viewable by everyone." on public.feed_events for select using (true);
drop policy if exists "Anyone can insert feed events." on public.feed_events;
create policy "Anyone can insert feed events." on public.feed_events for insert with check (public.check_rate_limit('feed_event', 10, 1));

-- Test Missions
drop policy if exists "Test missions viewable by everyone." on public.test_missions;
create policy "Test missions viewable by everyone." on public.test_missions for select using (true);
drop policy if exists "Admins can insert test missions." on public.test_missions;
create policy "Admins can insert test missions." on public.test_missions for insert with check (true);

-- Test Mission Applications
drop policy if exists "Test applications viewable by everyone." on public.test_mission_applications;
create policy "Test applications viewable by everyone." on public.test_mission_applications for select using (true);
drop policy if exists "Users can apply to test missions." on public.test_mission_applications;
create policy "Users can apply to test missions." on public.test_mission_applications for insert with check (auth.uid() = user_id and public.check_rate_limit('apply_test_mission', 5, 1));
