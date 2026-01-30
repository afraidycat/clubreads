-- ClubReads Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  is_premium boolean default false,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clubs table
create table public.clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  invite_code text unique default encode(gen_random_bytes(6), 'hex'),
  current_theme text,
  meeting_cadence text default 'monthly' check (meeting_cadence in ('monthly', '6-week')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Club members (join table)
create table public.club_members (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(club_id, user_id)
);

-- Themes catalog
create table public.themes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  sort_order int default 0
);

-- Insert default themes
insert into public.themes (name, description, icon, sort_order) values
  ('Psychological Thriller', 'Mind-bending suspense that keeps you guessing', '🧠', 1),
  ('Obscure Memoir', 'Life stories from unexpected voices', '📝', 2),
  ('Sci-Fi Not Adapted', 'Science fiction that hasn''t hit the screen yet', '🚀', 3),
  ('Non-Fiction Power', 'Deep dives into influence, politics, and control', '⚡', 4),
  ('International Fiction', 'Stories from around the world', '🌍', 5),
  ('Hidden Gem', 'Under 10k Goodreads ratings - discovered treasures', '💎', 6),
  ('Classic Literature', 'Timeless works that shaped storytelling', '📚', 7),
  ('Contemporary Fiction', 'Modern stories reflecting our times', '✨', 8),
  ('Historical Fiction', 'The past brought vividly to life', '🏛️', 9),
  ('Mystery & Detective', 'Whodunits and clever investigations', '🔍', 10),
  ('Fantasy', 'Magical worlds and epic adventures', '🐉', 11),
  ('Essays & Short Stories', 'Bite-sized brilliance', '📖', 12);

-- Books table
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  title text not null,
  author text not null,
  page_count int,
  cover_url text,
  goodreads_url text,
  theme_id uuid references public.themes(id),
  status text default 'nominated' check (status in ('nominated', 'voting', 'selected', 'reading', 'completed')),
  nominated_by uuid references public.profiles(id),
  selected_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Book votes
create table public.book_votes (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rank int not null check (rank >= 1 and rank <= 3),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(book_id, user_id)
);

-- Meetings table
create table public.meetings (
  id uuid default uuid_generate_v4() primary key,
  club_id uuid references public.clubs(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete set null,
  title text not null,
  scheduled_at timestamp with time zone not null,
  location text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Discussion questions (AI generated)
create table public.discussion_questions (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  question text not null,
  assigned_to uuid references public.profiles(id),
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Email notifications log
create table public.email_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  email_type text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'sent'
);

-- Row Level Security Policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.themes enable row level security;
alter table public.books enable row level security;
alter table public.book_votes enable row level security;
alter table public.meetings enable row level security;
alter table public.discussion_questions enable row level security;
alter table public.email_logs enable row level security;

-- Profiles: users can read any profile, update their own
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Themes: anyone can read
create policy "Themes are viewable by everyone" on public.themes
  for select using (true);

-- Clubs: members can read their clubs
create policy "Club members can view club" on public.clubs
  for select using (
    exists (
      select 1 from public.club_members
      where club_members.club_id = clubs.id
      and club_members.user_id = auth.uid()
    )
    or owner_id = auth.uid()
  );

create policy "Users can create clubs" on public.clubs
  for insert with check (auth.uid() = owner_id);

create policy "Club owners can update club" on public.clubs
  for update using (auth.uid() = owner_id);

create policy "Club owners can delete club" on public.clubs
  for delete using (auth.uid() = owner_id);

-- Allow viewing clubs by invite code (for joining)
create policy "Anyone can view club by invite code" on public.clubs
  for select using (invite_code is not null);

-- Club members
create policy "Members can view club members" on public.club_members
  for select using (
    exists (
      select 1 from public.club_members as cm
      where cm.club_id = club_members.club_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can join clubs" on public.club_members
  for insert with check (auth.uid() = user_id);

create policy "Users can leave clubs" on public.club_members
  for delete using (auth.uid() = user_id);

-- Books: club members can manage books
create policy "Club members can view books" on public.books
  for select using (
    exists (
      select 1 from public.club_members
      where club_members.club_id = books.club_id
      and club_members.user_id = auth.uid()
    )
  );

create policy "Club members can nominate books" on public.books
  for insert with check (
    exists (
      select 1 from public.club_members
      where club_members.club_id = books.club_id
      and club_members.user_id = auth.uid()
    )
  );

create policy "Club members can update books" on public.books
  for update using (
    exists (
      select 1 from public.club_members
      where club_members.club_id = books.club_id
      and club_members.user_id = auth.uid()
    )
  );

-- Votes: members can vote
create policy "Club members can view votes" on public.book_votes
  for select using (
    exists (
      select 1 from public.books
      join public.club_members on club_members.club_id = books.club_id
      where books.id = book_votes.book_id
      and club_members.user_id = auth.uid()
    )
  );

create policy "Club members can vote" on public.book_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their votes" on public.book_votes
  for update using (auth.uid() = user_id);

create policy "Users can delete their votes" on public.book_votes
  for delete using (auth.uid() = user_id);

-- Meetings
create policy "Club members can view meetings" on public.meetings
  for select using (
    exists (
      select 1 from public.club_members
      where club_members.club_id = meetings.club_id
      and club_members.user_id = auth.uid()
    )
  );

create policy "Club members can create meetings" on public.meetings
  for insert with check (
    exists (
      select 1 from public.club_members
      where club_members.club_id = meetings.club_id
      and club_members.user_id = auth.uid()
    )
  );

-- Discussion questions
create policy "Club members can view questions" on public.discussion_questions
  for select using (
    exists (
      select 1 from public.books
      join public.club_members on club_members.club_id = books.club_id
      where books.id = discussion_questions.book_id
      and club_members.user_id = auth.uid()
    )
  );

-- Email logs: users can view their own
create policy "Users can view own email logs" on public.email_logs
  for select using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_clubs_updated_at
  before update on public.clubs
  for each row execute procedure public.update_updated_at_column();
