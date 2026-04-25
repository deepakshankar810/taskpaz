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
  priority text default 'low',
  category text,
  due_date date,
  project_id uuid,
  order_index integer default 0,
  subtasks jsonb default '[]'::jsonb,
  recurring_pattern text,
  time_spent integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migration block (safe to run if table already exists)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='order_index') then
    alter table tasks add column order_index integer default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='subtasks') then
    alter table tasks add column subtasks jsonb default '[]'::jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='recurring_pattern') then
    alter table tasks add column recurring_pattern text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='time_spent') then
    alter table tasks add column time_spent integer default 0;
  end if;
end $$;

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

-- Transactions Table
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category text not null,
  description text,
  date date not null,
  created_at timestamptz default now()
);

-- Subscriptions Table
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric not null,
  billing_cycle text not null,
  billing_interval integer default 1,
  category text not null,
  next_billing_date date not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Savings Goals Table
create table if not exists savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table tasks enable row level security;
alter table projects enable row level security;
alter table transactions enable row level security;
alter table subscriptions enable row level security;
alter table savings_goals enable row level security;

-- Policies (using do block to avoid errors if they exist)
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
    if not exists (select 1 from pg_policies where policyname = 'Users can update own projects') then
        create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can delete own projects') then
        create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);
    end if;

    -- Transactions
    if not exists (select 1 from pg_policies where policyname = 'Users can view own transactions') then
        create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert own transactions') then
        create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
    end if;

    -- Subscriptions
    if not exists (select 1 from pg_policies where policyname = 'Users can view own subscriptions') then
        create policy "Users can view own subscriptions" on subscriptions for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert own subscriptions') then
        create policy "Users can insert own subscriptions" on subscriptions for insert with check (auth.uid() = user_id);
    end if;

    -- Savings Goals
    if not exists (select 1 from pg_policies where policyname = 'Users can view own savings_goals') then
        create policy "Users can view own savings_goals" on savings_goals for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert own savings_goals') then
        create policy "Users can insert own savings_goals" on savings_goals for insert with check (auth.uid() = user_id);
    end if;
end $$;

-- Indexes
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists transactions_user_id_idx on transactions(user_id);
create index if not exists transactions_date_idx on transactions(date);
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists savings_goals_user_id_idx on savings_goals(user_id);

-- Trigger to create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, avatar)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists before creating
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
