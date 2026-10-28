-- Vibespot public schema
-- Run this in Supabase SQL Editor (once).

create table if not exists public.places (
  id text primary key,
  name text not null,
  address text not null,
  category text not null,
  maps_url text,
  latitude double precision,
  longitude double precision,
  price_per_two integer,
  tags text[] default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  image_url text,
  gallery text[] default '{}'
);

create table if not exists public.place_ratings (
  place_id text not null references public.places(id) on delete cascade,
  firebase_uid text not null,
  price_rating integer not null check (price_rating between 1 and 5),
  ambience_rating integer not null check (ambience_rating between 1 and 5),
  food_quality_rating integer not null check (food_quality_rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (place_id, firebase_uid)
);

create or replace view public.place_rating_summary as
select
  place_id,
  round(avg(price_rating)::numeric, 2) as avg_price_rating,
  round(avg(ambience_rating)::numeric, 2) as avg_ambience,
  round(avg(food_quality_rating)::numeric, 2) as avg_food_quality,
  count(*)::int as rating_count
from public.place_ratings
group by place_id;

alter table public.places enable row level security;
alter table public.place_ratings enable row level security;

drop policy if exists "public read published places" on public.places;
create policy "public read published places"
  on public.places for select
  using (is_published = true);

drop policy if exists "service role writes places" on public.places;
-- Dashboard / service role bypasses RLS. Owners can also insert via service key.

drop policy if exists "public read ratings" on public.place_ratings;
create policy "public read ratings"
  on public.place_ratings for select
  using (true);

-- Ratings are written through Next.js /api/ratings with the service role key.
grant usage on schema public to anon, authenticated;
grant select on public.places to anon, authenticated;
grant select on public.place_ratings to anon, authenticated;
grant select on public.place_rating_summary to anon, authenticated;
