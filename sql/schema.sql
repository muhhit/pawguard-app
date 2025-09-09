-- Enable PostGIS
create extension if not exists postgis;

-- Users additions
alter table if exists users add column if not exists trust_score integer default 0;
alter table if exists users add column if not exists phone_verified boolean default false;
alter table if exists users add column if not exists id_verified boolean default false;
alter table if exists users add column if not exists verification_level varchar(20) default 'unverified';

-- Pets table (if not exists)
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  name text not null,
  type text not null,
  breed text,
  ownership text check (ownership in ('owned','street')) default 'owned',
  last_location geography(POINT),
  reward_amount integer default 0,
  is_found boolean default false,
  photos text[] default '{}',
  privacy_level varchar(20) default 'community',
  trust_level varchar(20) default 'community',
  verification_score integer default 0,
  created_at timestamptz default now()
);

-- Sightings
create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  reporter_id uuid references auth.users(id),
  location geography(POINT) not null,
  notes text,
  photo text,
  created_at timestamptz default now()
);

-- Reward claims
create table if not exists reward_claims (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  claimer_id uuid references auth.users(id),
  owner_id uuid references auth.users(id),
  amount integer not null,
  status text check (status in ('pending','approved','rejected','paid')) default 'pending',
  evidence_photo text,
  evidence_notes text,
  payment_id text,
  payment_method text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Push tokens
create table if not exists user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  push_token text not null,
  device_type text check (device_type in ('ios','android','web')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Emergency broadcasts
create table if not exists emergency_broadcasts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  location geography(POINT),
  recipients_count integer default 0,
  broadcast_type text check (broadcast_type in ('emergency','update','found')) default 'emergency',
  created_at timestamptz default now()
);

-- Referrals
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id),
  referee_id uuid references auth.users(id),
  reward_status text check (reward_status in ('pending','fulfilled','expired')) default 'pending',
  referrer_reward_type text,
  referrer_reward_value integer,
  referee_reward_type text,
  referee_reward_value integer,
  created_at timestamptz default now(),
  fulfilled_at timestamptz
);

-- Verification attempts
create table if not exists pet_verification_attempts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  user_id uuid references auth.users(id),
  verification_score integer,
  steps_completed jsonb,
  created_at timestamptz default now(),
  approved boolean default false
);

-- Suspicious activities
create table if not exists suspicious_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  activity_type varchar(50),
  description text,
  severity varchar(10),
  auto_detected boolean default false,
  created_at timestamptz default now()
);

-- Feeding records
create table if not exists feeding_records (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references pets(id),
  user_id uuid references auth.users(id),
  food_type varchar(100),
  quantity varchar(20),
  photos text[],
  health_notes text,
  location geography(POINT),
  created_at timestamptz default now()
);

-- Spatial index
create index if not exists pets_location_idx on pets using gist (last_location);
create index if not exists sightings_location_idx on sightings using gist (location);

-- Nearby pets function
create or replace function nearby_pets(user_lat float8, user_lng float8, radius_meters float8 default 5000)
returns table(id uuid, name text, type text, reward_amount integer, is_found boolean, lat double precision, lng double precision, created_at timestamptz)
language sql
as $$
  select p.id, p.name, p.type, p.reward_amount, p.is_found,
         ST_Y(p.last_location::geometry) as lat,
         ST_X(p.last_location::geometry) as lng,
         p.created_at
  from pets p
  where p.is_found = false
    and p.last_location is not null
    and ST_DWithin(
      p.last_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    );
$$;

-- Privacy-aware fetch (example): fuzz location based on privacy_level and requester trust
create or replace function get_pets_with_privacy(requester_id uuid)
returns table(
  id uuid,
  owner_id uuid,
  name text,
  type text,
  breed text,
  ownership text,
  reward_amount integer,
  is_found boolean,
  photos text[],
  created_at timestamptz,
  lat double precision,
  lng double precision
)
language plpgsql
as $$
declare requester_trust integer;
begin
  select coalesce(trust_score,0) into requester_trust from users where id = requester_id;

  return query
  select p.id, p.owner_id, p.name, p.type, p.breed, p.ownership, p.reward_amount, p.is_found, p.photos, p.created_at,
    case
      when (p.ownership = 'street') and requester_trust < 90 then null
      when p.privacy_level = 'protected' and requester_trust < 90 then null
      when p.privacy_level = 'trusted' and requester_trust < 70 then ST_Y(ST_Translate(p.last_location::geometry, 0.002, 0.002))
      when p.privacy_level = 'community' and requester_trust < 30 then ST_Y(ST_Translate(p.last_location::geometry, 0.004, 0.004))
      else ST_Y(p.last_location::geometry)
    end as lat,
    case
      when (p.ownership = 'street') and requester_trust < 90 then null
      when p.privacy_level = 'protected' and requester_trust < 90 then null
      when p.privacy_level = 'trusted' and requester_trust < 70 then ST_X(ST_Translate(p.last_location::geometry, 0.002, 0.002))
      when p.privacy_level = 'community' and requester_trust < 30 then ST_X(ST_Translate(p.last_location::geometry, 0.004, 0.004))
      else ST_X(p.last_location::geometry)
    end as lng
  from pets p
  where p.is_found = false;
end;
$$;

-- Notify nearby users (stub)
create or replace function notify_nearby_users() returns trigger as $$
begin
  -- TODO: implement push dispatch. For now, record analytics event only.
  insert into analytics_events(user_id, event, properties)
  select p.owner_id, 'pet_location_update', jsonb_build_object('pet_id', new.id)
  from pets p where p.id = new.id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists pet_location_update on pets;
create trigger pet_location_update
after update of last_location on pets
for each row execute procedure notify_nearby_users();

-- Notification rate limiting (DB side)
create table if not exists notification_limits (
  user_id uuid references auth.users(id),
  notification_type text,
  count integer default 1,
  window_start timestamptz default now(),
  unique(user_id, notification_type)
);

create or replace function should_send_notification(
  target_user_id uuid,
  notif_type text,
  max_per_hour integer default 5
) returns boolean as $$
declare current_count integer; begin
  select count into current_count from notification_limits
    where user_id = target_user_id
      and notification_type = notif_type
      and window_start > now() - interval '1 hour';
  return coalesce(current_count,0) < max_per_hour;
end; $$ language plpgsql;

-- Advanced privacy v2 (city-aware) skeleton
create or replace function get_pets_with_privacy_v2(requester_id uuid, city text default 'istanbul')
returns table(id uuid, name text, type text, lat double precision, lng double precision) as $$
declare requester_trust integer; base_fuzzing float8; begin
  select coalesce(trust_score,0) into requester_trust from users where id = requester_id;
  base_fuzzing := case when city = 'istanbul' then 0.001 when city = 'ankara' then 0.002 else 0.004 end;
  return query
  select p.id, p.name, p.type,
    case when requester_trust >= 90 then ST_Y(p.last_location::geometry)
         when requester_trust >= 70 then ST_Y(ST_Translate(p.last_location::geometry, base_fuzzing*random(), base_fuzzing*random()))
         else ST_Y(ST_Translate(p.last_location::geometry, base_fuzzing*2*random(), base_fuzzing*2*random())) end as lat,
    case when requester_trust >= 90 then ST_X(p.last_location::geometry)
         when requester_trust >= 70 then ST_X(ST_Translate(p.last_location::geometry, base_fuzzing*random(), base_fuzzing*random()))
         else ST_X(ST_Translate(p.last_location::geometry, base_fuzzing*2*random(), base_fuzzing*2*random())) end as lng
  from pets p where p.is_found = false;
end; $$ language plpgsql;

-- NOTE: Add appropriate RLS policies to enforce row-level security for each table.

-- Rescue channels (ephemeral coordination)
create table if not exists rescue_channels (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id),
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists rescue_tasks (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references rescue_channels(id) on delete cascade,
  title text not null,
  notes text,
  status text check (status in ('open','doing','done')) default 'open',
  assignee uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Content reports (moderation)
create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id),
  pet_id uuid references pets(id),
  reason text,
  details text,
  created_at timestamptz default now()
);

-- Analytics events
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event text not null,
  properties jsonb,
  created_at timestamptz default now()
);

-- Circles (groups)
create table if not exists circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text check (role in ('member','admin')) default 'member',
  created_at timestamptz default now(),
  unique(circle_id, user_id)
);

create table if not exists circle_posts (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references circles(id) on delete cascade,
  author_id uuid references auth.users(id),
  content text,
  images text[],
  created_at timestamptz default now()
);
