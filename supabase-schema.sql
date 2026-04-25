-- Users Table (Profiles)
create table if not exists users (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks Table
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text default 'medium',
  category text default 'personal',
  due_date date,
  project_id uuid,
  order_index integer default 0,
  subtasks jsonb default '[]'::jsonb,
  recurring_pattern text,
  time_spent integer default 0,
  tags text[] default '{}',
  estimated_minutes integer default null,
  dependencies uuid[] default '{}',
  shared_with jsonb default '[]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects Table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  color text default '#3b82f6',
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Journal Entries Table
create table if not exists journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  content text not null default '',
  mood text,
  completed_task_ids uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Enable Row Level Security
alter table users enable row level security;
alter table tasks enable row level security;
alter table projects enable row level security;
alter table journal_entries enable row level security;

-- RLS Policies
do $$
begin
    -- Users
    if not exists (select 1 from pg_policies where policyname = 'Users can view own profile') then
        create policy "Users can view own profile" on users for select using (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
        create policy "Users can update own profile" on users for update using (auth.uid() = id);
    end if;

    -- Tasks
    if not exists (select 1 from pg_policies where policyname = 'Users can view own tasks') then
        create policy "Users can view own tasks" on tasks for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert own tasks') then
        create policy "Users can insert own tasks" on tasks for insert with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can update own tasks') then
        create policy "Users can update own tasks" on tasks for update using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can delete own tasks') then
        create policy "Users can delete own tasks" on tasks for delete using (auth.uid() = user_id);
    end if;

    -- Projects
    if not exists (select 1 from pg_policies where policyname = 'Users can view own projects') then
        create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert own projects') then
        create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
    end if;

    -- Journal
    if not exists (select 1 from pg_policies where policyname = 'Users can manage own journal') then
        create policy "Users can manage own journal" on journal_entries for all using (auth.uid() = user_id);
    end if;
end $$;

-- Enable Realtime
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  alter publication supabase_realtime add table tasks;
exception
  when others then 
    alter publication supabase_realtime add table tasks;
end $$;

-- Auto-profile creation trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, avatar)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
