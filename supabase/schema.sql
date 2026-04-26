create extension if not exists pgcrypto;

create table if not exists public.trip_settings (
  id boolean primary key default true,
  password_hash text not null,
  check (id)
);

create table if not exists public.players (
  id text primary key,
  name text not null,
  handicap integer not null,
  milk_preference text not null,
  image_url text not null,
  display_order integer not null
);

create table if not exists public.rounds (
  id text primary key,
  name text not null,
  course_name text not null,
  round_date date not null,
  display_order integer not null
);

create table if not exists public.holes (
  id bigint generated always as identity primary key,
  round_id text not null references public.rounds(id) on delete cascade,
  number integer not null,
  par integer not null,
  stroke_index integer,
  unique (round_id, number)
);

create table if not exists public.score_entries (
  id bigint generated always as identity primary key,
  round_id text not null references public.rounds(id) on delete cascade,
  player_id text not null references public.players(id) on delete cascade,
  hole_number integer not null,
  strokes integer,
  updated_at timestamptz not null default now(),
  unique (round_id, player_id, hole_number),
  check (strokes is null or strokes between 1 and 12)
);

alter table public.trip_settings enable row level security;
alter table public.players enable row level security;
alter table public.rounds enable row level security;
alter table public.holes enable row level security;
alter table public.score_entries enable row level security;

drop policy if exists "Public player read" on public.players;
create policy "Public player read"
  on public.players for select
  to anon
  using (true);

drop policy if exists "Public round read" on public.rounds;
create policy "Public round read"
  on public.rounds for select
  to anon
  using (true);

drop policy if exists "Public hole read" on public.holes;
create policy "Public hole read"
  on public.holes for select
  to anon
  using (true);

drop policy if exists "Public score read" on public.score_entries;
create policy "Public score read"
  on public.score_entries for select
  to anon
  using (true);

create or replace function public.verify_trip_password(p_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    exists (
      select 1
      from public.trip_settings
      where id = true
        and password_hash = crypt(p_password, password_hash)
    ),
    false
  );
$$;

create or replace function public.upsert_score_entry(
  p_trip_password text,
  p_round_id text,
  p_player_id text,
  p_hole_number integer,
  p_strokes integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.verify_trip_password(p_trip_password) then
    raise exception 'Invalid trip password';
  end if;

  if p_strokes is null then
    delete from public.score_entries
    where round_id = p_round_id
      and player_id = p_player_id
      and hole_number = p_hole_number;
    return;
  end if;

  insert into public.score_entries (
    round_id,
    player_id,
    hole_number,
    strokes,
    updated_at
  )
  values (
    p_round_id,
    p_player_id,
    p_hole_number,
    p_strokes,
    now()
  )
  on conflict (round_id, player_id, hole_number)
  do update set
    strokes = excluded.strokes,
    updated_at = now();
end;
$$;

grant execute on function public.verify_trip_password(text) to anon;
grant execute on function public.upsert_score_entry(text, text, text, integer, integer) to anon;

insert into public.trip_settings (id, password_hash)
values (true, crypt('milk', gen_salt('bf')))
on conflict (id) do nothing;

insert into public.players (id, name, handicap, milk_preference, image_url, display_order)
values
  ('matt-colman', 'Matt Colman', 20, 'Unpasterised Full Cream', '/players/matt-colman.svg', 1),
  ('alex-scotts', 'Alex Scotts', 6, 'A2', '/players/alex-scotts.svg', 2),
  ('will-turner', 'Will Turner', 14, 'Light white', '/players/will-turner.svg', 3),
  ('charlie-turner', 'Charlie Turner', 6, 'So good soy milk', '/players/charlie-turner.svg', 4)
on conflict (id) do update set
  name = excluded.name,
  handicap = excluded.handicap,
  milk_preference = excluded.milk_preference,
  image_url = excluded.image_url,
  display_order = excluded.display_order;

insert into public.rounds (id, name, course_name, round_date, display_order)
values
  ('bougle-run', 'Round 1', 'Bougle Run', '2026-05-17', 1),
  ('barnbougle-dunes', 'Round 2', 'Barnbougle Dunes', '2026-05-18', 2),
  ('lost-farm', 'Round 3', 'Lost Farm', '2026-05-19', 3)
on conflict (id) do update set
  name = excluded.name,
  course_name = excluded.course_name,
  round_date = excluded.round_date,
  display_order = excluded.display_order;

insert into public.holes (round_id, number, par)
select 'bougle-run', number, par
from unnest(array[3, 4, 3, 4, 3, 4, 3, 4, 3, 3, 4, 3, 4, 3]) with ordinality as hole(par, number)
on conflict (round_id, number) do update set par = excluded.par;

insert into public.holes (round_id, number, par)
select 'barnbougle-dunes', number, par
from unnest(array[4, 4, 4, 3, 4, 5, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 4]) with ordinality as hole(par, number)
on conflict (round_id, number) do update set par = excluded.par;

insert into public.holes (round_id, number, par)
select 'lost-farm', number, par
from unnest(array[5, 4, 4, 3, 4, 4, 5, 3, 4, 4, 5, 3, 4, 4, 4, 3, 5, 4]) with ordinality as hole(par, number)
on conflict (round_id, number) do update set par = excluded.par;
