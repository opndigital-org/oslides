-- User Profiles
-- stores user profile data

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    display_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Slide Deck
-- Each Deck belongs to one user

create table public.decks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    title text not null default 'Untitled',
    theme text,
    markdown_content text not null default '',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Speeds up listing a user's presentations by most recently updated.
create index decks_user_updated_idx
    on public.decks (user_id, updated_at desc);

-- Update updated_at on changes
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger decks_set_updated_at
before update on public.decks
for each row
execute function public.set_updated_at();

-- Create a profile when a user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, email, display_name)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data ->> 'display_name'
    );

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.decks enable row level security;

-- Profile access policies
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Deck access policies
create policy "Users can read their own decks"
on public.decks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own decks"
on public.decks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own decks"
on public.decks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own decks"
on public.decks
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Table permissions for authenticated users
grant select, update
on public.profiles
to authenticated;

grant select, insert, update, delete
on public.decks
to authenticated;
