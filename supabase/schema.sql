-- Croc & Hamster's World Relief Atlas
-- Run this SQL once in your Supabase Dashboard -> SQL Editor

create table if not exists public.city_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null check (user_id in ('crocodile', 'hamster')),
  city text not null,
  country text not null,
  country_code text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  visited_at date not null,
  venue_type text check (venue_type in ('hotel', 'cafe', 'airport', 'public', 'nature', 'home', 'transit', 'other')),
  rating integer check (rating >= 1 and rating <= 5),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_city_logs_user_id on public.city_logs (user_id);
create index if not exists idx_city_logs_visited_at on public.city_logs (visited_at desc);

-- Enable Row Level Security
alter table public.city_logs enable row level security;

-- Shared couple/duo access policy (no login required, instant two-tap profile switcher)
-- Note: Keep your repo private or add a custom header check if you want extra privacy.
drop policy if exists "Allow shared read/write access" on public.city_logs;
create policy "Allow shared read/write access"
  on public.city_logs
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Enable real-time updates so pins appear live across both phones
alter publication supabase_realtime add table public.city_logs;
