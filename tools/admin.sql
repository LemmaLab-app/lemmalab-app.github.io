-- LemmaLab – Admin-Statistik
-- Einmal im Supabase SQL Editor ausführen (Run).
-- Liefert nur zusammengefasste Zahlen, keine E-Mails oder Namen.
-- Nur die Admin-Konten (unten in der Liste) dürfen die Funktion aufrufen;
-- die Prüfung passiert in der Datenbank, nicht im Browser.

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
  d bigint := 86400000;
  res jsonb;
begin
  if not exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in ('lemmalab.app@gmail.com', 'martin.senn2@gmail.com')
      and u.email_confirmed_at is not null
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  with
  lg as (
    select p.user_id,
           ((e->>0)::numeric)::bigint            as t,
           e->>1                                 as card,
           ((e->>2)::numeric)::int               as g,
           coalesce(((e->>3)::numeric)::int, 0)  as st,
           coalesce((e->>4)::numeric, 0)         as ds,      -- Zehntelsekunden
           coalesce(e->>5, 'l')                  as mode
    from public.progress p,
         jsonb_array_elements(case when jsonb_typeof(p.state->'log') = 'array' then p.state->'log' else '[]'::jsonb end) e
    where jsonb_typeof(e) = 'array'
  ),
  lgd as (
    select *, ((to_timestamp(t / 1000.0) at time zone 'Europe/Zurich') - interval '4 hours')::date as day
    from lg
  ),
  per_user as (
    select user_id,
           count(*)                                   as n,
           count(distinct day)                        as days,
           max(t)                                     as last_t,
           sum(ds) / 600.0                            as minutes,
           count(*) filter (where mode <> 'q' and st = 2)            as rev,
           count(*) filter (where mode <> 'q' and st = 2 and g >= 2) as rev_ok
    from lgd group by user_id
  ),
  intro as (
    select p.user_id, count(*) as n
    from public.progress p,
         jsonb_each(case when jsonb_typeof(p.state->'cards') = 'object' then p.state->'cards' else '{}'::jsonb end) c
    where coalesce(((c.value->>'st')::numeric)::int, 0) >= 1
    group by p.user_id
  ),
  days30 as (
    select gs::date as day
    from generate_series(((now() at time zone 'Europe/Zurich') - interval '4 hours')::date - 29,
                         ((now() at time zone 'Europe/Zurich') - interval '4 hours')::date, interval '1 day') gs
  ),
  daily as (
    select d30.day,
           count(distinct l.user_id)            as users,
           count(l.user_id)                     as reviews,
           coalesce(sum(l.ds), 0) / 600.0       as minutes
    from days30 d30 left join lgd l on l.day = d30.day
    group by d30.day order by d30.day
  ),
  cards as (
    select card,
           count(*)                                      as n,
           count(distinct user_id)                       as users,
           count(*) filter (where st = 2)                as rev,
           count(*) filter (where st = 2 and g = 1)      as again,
           count(*) filter (where g = 1)                 as again_all,
           avg(ds) / 10.0                                as avg_s
    from lgd where mode <> 'q' and card is not null
    group by card
  )
  select jsonb_build_object(
    'generated', now(),
    'users', jsonb_build_object(
      'total',   (select count(*) from auth.users),
      'new7',    (select count(*) from auth.users where created_at > now() - interval '7 days'),
      'new30',   (select count(*) from auth.users where created_at > now() - interval '30 days'),
      'withProgress', (select count(*) from public.progress),
      'learning',     (select count(*) from per_user),
      'active1',  (select count(*) from per_user where last_t > now_ms - d),
      'active7',  (select count(*) from per_user where last_t > now_ms - 7 * d),
      'active30', (select count(*) from per_user where last_t > now_ms - 30 * d),
      'days2',    (select count(*) from per_user where days >= 2),
      'days7',    (select count(*) from per_user where days >= 7),
      'providers', (select coalesce(jsonb_object_agg(pr, n), '{}'::jsonb) from
                     (select coalesce(raw_app_meta_data->>'provider', '?') pr, count(*) n from auth.users group by 1) x)
    ),
    'totals', jsonb_build_object(
      'reviews',  (select count(*) from lg),
      'minutes',  (select coalesce(sum(ds), 0) / 600.0 from lg),
      'reviews7', (select count(*) from lg where t > now_ms - 7 * d),
      'minutes7', (select coalesce(sum(ds), 0) / 600.0 from lg where t > now_ms - 7 * d),
      'retention', (select case when sum(rev) > 0 then sum(rev_ok)::numeric / sum(rev) end from per_user),
      'medianMinutesPerUser', (select percentile_cont(0.5) within group (order by minutes) from per_user),
      'medianDaysPerUser',    (select percentile_cont(0.5) within group (order by days) from per_user),
      'medianIntro',          (select percentile_cont(0.5) within group (order by n) from intro)
    ),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'users', users, 'reviews', reviews, 'minutes', round(minutes::numeric, 1)) order by day), '[]'::jsonb) from daily),
    'cards', (select coalesce(jsonb_agg(jsonb_build_object('id', card, 'n', n, 'users', users, 'rev', rev, 'again', again, 'againAll', again_all, 'avgS', round(avg_s::numeric, 1))), '[]'::jsonb) from cards)
  ) into res;

  return res;
end;
$$;

revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
