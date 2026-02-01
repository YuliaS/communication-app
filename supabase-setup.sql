-- Communication Trainer - Supabase Setup
-- Run this in the SQL Editor at: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Create progress table
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  completed_days integer[] default '{}',
  current_day integer default 1,
  streak integer default 0,
  last_completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists user_progress_user_id_idx on user_progress(user_id);

-- Enable Row Level Security
alter table user_progress enable row level security;

-- Drop existing policies if any (for re-running this script)
drop policy if exists "Users can view own progress" on user_progress;
drop policy if exists "Users can insert own progress" on user_progress;
drop policy if exists "Users can update own progress" on user_progress;

-- Create policies - users can only access their own data
create policy "Users can view own progress" 
  on user_progress for select 
  using (auth.uid() = user_id);

create policy "Users can insert own progress" 
  on user_progress for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own progress" 
  on user_progress for update 
  using (auth.uid() = user_id);

-- Optional: Create a function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update updated_at
drop trigger if exists update_user_progress_updated_at on user_progress;
create trigger update_user_progress_updated_at
  before update on user_progress
  for each row
  execute function update_updated_at_column();
