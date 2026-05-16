create extension if not exists postgis;
create extension if not exists pgcrypto;

create table if not exists public.route_plans (
  id uuid primary key default gen_random_uuid(),
  client_plan_id text not null unique,
  access_token text not null,
  origin geography(point, 4326) not null,
  origin_label text,
  target_type text not null check (target_type in ('distance', 'time')),
  target_value numeric not null check (target_value > 0),
  target_unit text not null check (target_unit in ('m', 'km', 'min')),
  activity text not null check (activity in ('stroll', 'walk', 'jog', 'run')),
  level text not null check (level in ('beginner', 'normal', 'experienced', 'hill_ok')),
  preferences jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.route_candidates (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.route_plans(id) on delete cascade,
  candidate_id text not null,
  name text not null,
  description text not null,
  geometry geography(linestring, 4326) not null,
  distance_m numeric not null check (distance_m > 0),
  estimated_duration_sec integer not null check (estimated_duration_sec > 0),
  metrics jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  labels jsonb not null default '[]'::jsonb,
  cautions jsonb not null default '[]'::jsonb,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  created_at timestamptz not null default now(),
  unique (plan_id, candidate_id)
);

create table if not exists public.saved_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  device_id text,
  route_candidate_id uuid not null references public.route_candidates(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_id is not null or device_id is not null)
);

create table if not exists public.route_feedback (
  id uuid primary key default gen_random_uuid(),
  route_candidate_id uuid not null references public.route_candidates(id) on delete cascade,
  rating text not null check (rating in ('good', 'bad', 'neutral')),
  tags jsonb not null default '[]'::jsonb,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists route_plans_origin_idx
  on public.route_plans
  using gist (origin);

create index if not exists route_candidates_geometry_idx
  on public.route_candidates
  using gist (geometry);

create index if not exists route_candidates_plan_id_idx
  on public.route_candidates (plan_id);

create index if not exists saved_routes_device_id_idx
  on public.saved_routes (device_id);

create index if not exists route_feedback_candidate_id_idx
  on public.route_feedback (route_candidate_id);

create or replace function public.save_route_plan(
  input_request jsonb,
  input_response jsonb
)
returns void
language plpgsql
as $$
declare
  saved_plan_id uuid;
begin
  insert into public.route_plans (
    client_plan_id,
    access_token,
    origin,
    origin_label,
    target_type,
    target_value,
    target_unit,
    activity,
    level,
    preferences,
    warnings,
    generated_at
  )
  values (
    input_response ->> 'planId',
    input_response ->> 'accessToken',
    st_setsrid(
      st_makepoint(
        (input_response #>> '{origin,lng}')::double precision,
        (input_response #>> '{origin,lat}')::double precision
      ),
      4326
    )::geography,
    input_response #>> '{origin,label}',
    input_request #>> '{target,type}',
    (input_request #>> '{target,value}')::numeric,
    input_request #>> '{target,unit}',
    input_request ->> 'activity',
    input_request ->> 'level',
    coalesce(input_request -> 'preferences', '[]'::jsonb),
    coalesce(input_response -> 'warnings', '[]'::jsonb),
    (input_response ->> 'generatedAt')::timestamptz
  )
  on conflict (client_plan_id) do update set
    access_token = excluded.access_token,
    origin = excluded.origin,
    origin_label = excluded.origin_label,
    target_type = excluded.target_type,
    target_value = excluded.target_value,
    target_unit = excluded.target_unit,
    activity = excluded.activity,
    level = excluded.level,
    preferences = excluded.preferences,
    warnings = excluded.warnings,
    generated_at = excluded.generated_at
  returning id into saved_plan_id;

  delete from public.route_candidates
  where plan_id = saved_plan_id;

  insert into public.route_candidates (
    plan_id,
    candidate_id,
    name,
    description,
    geometry,
    distance_m,
    estimated_duration_sec,
    metrics,
    scores,
    labels,
    cautions,
    confidence
  )
  select
    saved_plan_id,
    candidate ->> 'id',
    candidate ->> 'name',
    candidate ->> 'description',
    st_setsrid(
      st_geomfromgeojson((candidate -> 'geometry')::text),
      4326
    )::geography,
    (candidate ->> 'distanceM')::numeric,
    (candidate ->> 'estimatedDurationSec')::integer,
    coalesce(candidate -> 'metrics', '{}'::jsonb),
    coalesce(candidate -> 'scores', '{}'::jsonb),
    coalesce(candidate -> 'labels', '[]'::jsonb),
    coalesce(candidate -> 'cautions', '[]'::jsonb),
    candidate ->> 'confidence'
  from jsonb_array_elements(input_response -> 'candidates') as candidate;
end;
$$;

create or replace function public.get_route_plan(
  input_plan_id text,
  input_access_token text
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'planId', route_plans.client_plan_id,
    'accessToken', route_plans.access_token,
    'origin', jsonb_strip_nulls(jsonb_build_object(
      'lat', st_y(route_plans.origin::geometry),
      'lng', st_x(route_plans.origin::geometry),
      'label', route_plans.origin_label
    )),
    'candidates', coalesce(candidate_list.items, '[]'::jsonb),
    'warnings', route_plans.warnings,
    'generatedAt', to_jsonb(route_plans.generated_at) #>> '{}'
  )
  from public.route_plans
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', route_candidates.candidate_id,
        'name', route_candidates.name,
        'description', route_candidates.description,
        'geometry', jsonb_build_object(
          'type', 'LineString',
          'coordinates', st_asgeojson(route_candidates.geometry::geometry)::jsonb -> 'coordinates'
        ),
        'distanceM', route_candidates.distance_m,
        'estimatedDurationSec', route_candidates.estimated_duration_sec,
        'metrics', route_candidates.metrics,
        'scores', route_candidates.scores,
        'labels', route_candidates.labels,
        'cautions', route_candidates.cautions,
        'confidence', route_candidates.confidence
      )
      order by route_candidates.created_at, route_candidates.candidate_id
    ) as items
    from public.route_candidates
    where route_candidates.plan_id = route_plans.id
  ) as candidate_list on true
  where route_plans.client_plan_id = input_plan_id
    and route_plans.access_token = input_access_token;
$$;
