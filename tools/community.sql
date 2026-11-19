-- LemmaLab – Wissen aller Nutzer
-- Einmal im Supabase SQL Editor ausführen (Run).
-- Speichert pro Karte nur Summen über alle Konten (wie viele Personen, wie oft
-- beim ersten Mal nicht gewusst). Karten mit weniger als 5 Personen werden nicht
-- veröffentlicht. Keine Konto-IDs, keine E-Mails.

create table if not exists public.card_stats (
  card        text primary key,
  users       int  not null,
  first_n     int  not null,
  first_fail  real not null,
  rev_n       int  not null default 0,
  rev_fail    real,
  updated_at  timestamptz not null default now()
);
alter table public.card_stats enable row level security;
drop policy if exists "card_stats lesen" on public.card_stats;
create policy "card_stats lesen" on public.card_stats for select to anon, authenticated using (true);

-- Neu berechnen, höchstens alle 6 Stunden (jeder Aufruf davor tut nichts)
create or replace function public.refresh_card_stats()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from public.card_stats where card = '__meta__' and updated_at > now() - interval '6 hours') then
    return;
  end if;

  delete from public.card_stats;

  with lg as (
    select p.user_id,
           ((e->>0)::numeric)::bigint            as t,
           e->>1                                 as card,
           ((e->>2)::numeric)::int               as g,
           coalesce(((e->>3)::numeric)::int, 0)  as st,
           coalesce(e->>5, 'l')                  as mode
    from public.progress p,
         jsonb_array_elements(case when jsonb_typeof(p.state->'log') = 'array' then p.state->'log' else '[]'::jsonb end) e
    where jsonb_typeof(e) = 'array'
  ),
  firsts as (
    select distinct on (user_id, card) user_id, card, g
    from lg where mode <> 'q' and card is not null
    order by user_id, card, t
  ),
  f as (
    select card, count(*)::int as first_n, avg((g = 1)::int)::real as first_fail
    from firsts group by card
  ),
  r as (
    select card, count(*)::int as rev_n, avg((g = 1)::int)::real as rev_fail
    from lg where mode <> 'q' and st = 2 group by card
  )
  insert into public.card_stats (card, users, first_n, first_fail, rev_n, rev_fail, updated_at)
  select f.card, f.first_n, f.first_n, f.first_fail, coalesce(r.rev_n, 0), r.rev_fail, now()
  from f left join r using (card)
  where f.first_n >= 5;

  insert into public.card_stats (card, users, first_n, first_fail, rev_n, updated_at)
  values ('__meta__', (select count(*) from public.progress), 0, 0, 0, now());
end;
$$;

revoke all on function public.refresh_card_stats() from public;
grant execute on function public.refresh_card_stats() to anon, authenticated;
