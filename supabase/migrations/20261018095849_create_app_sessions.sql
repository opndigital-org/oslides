
create table if not exists public.app_sessions (
    id_hash text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    access_token_encrypted text not null,
    refresh_token_encrypted text not null,
    access_token_expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    absolute_expires_at timestamptz not null,
    revoked_at timestamptz
);

create index if not exists app_sessions_user_id_idx
    on public.app_sessions (user_id);

create index if not exists app_sessions_absolute_expires_at_idx
    on public.app_sessions (absolute_expires_at);

alter table public.app_sessions enable row level security;

revoke all on public.app_sessions from anon, authenticated;
grant all on public.app_sessions to service_role;
