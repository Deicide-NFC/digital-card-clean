-- =====================================================================
-- NFC Digital Business Card: database schema
-- Run this once in Supabase: SQL Editor > New query > paste > Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles: one row per digital business card
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key default gen_random_uuid(),
  -- The permanent public handle. It is part of the URL printed on the QR
  -- code and written to the NFC card: https://DOMAIN/c/<profile_id>
  profile_id     text not null,
  profile_type   text not null default 'personal',
  business_name  text,
  design_theme   text not null default 'classic',
  full_name      text not null,
  job_title      text,
  company        text,
  bio            text,
  profile_photo  text,
  company_logo   text,

  phone          text,
  email          text,
  website        text,

  facebook       text,
  instagram      text,
  tiktok         text,
  linkedin       text,
  messenger      text,
  whatsapp       text,
  viber          text,

  address        text,
  maps_url       text,
  business_hours text,
  menu_items     text,
  faq1_question  text,
  faq1_answer    text,
  faq2_question  text,
  faq2_answer    text,
  faq3_question  text,
  faq3_answer    text,

  theme          text not null default 'light',
  primary_color  text not null default '#2347F0',
  background     text not null default 'soft',
  button_style   text not null default 'rounded',

  status         text not null default 'active',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint profiles_profile_id_format
    check (profile_id ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  constraint profiles_status_check
    check (status in ('active', 'disabled')),
  constraint profiles_profile_type_check
    check (profile_type in ('personal', 'business')),
  constraint profiles_design_theme_check
    check (design_theme in ('classic', 'obsidian-gold', 'royal-prestige', 'ivory-minimal', 'emerald-luxe', 'titanium', 'artisan-classic')),
  constraint profiles_theme_check
    check (theme in ('light', 'dark', 'auto')),
  constraint profiles_background_check
    check (background in ('soft', 'gradient', 'mesh', 'dots')),
  constraint profiles_button_style_check
    check (button_style in ('rounded', 'pill', 'square')),
  constraint profiles_color_check
    check (primary_color ~ '^#[0-9a-fA-F]{6}$')
);

-- profile_id must be unique (case-insensitive)
create unique index if not exists profiles_profile_id_key
  on public.profiles (lower(profile_id));
create index if not exists profiles_status_idx     on public.profiles (status);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- profile_stats: privacy-friendly counters (no IPs, no user agents)
-- ---------------------------------------------------------------------
create table if not exists public.profile_stats (
  profile_uuid        uuid primary key references public.profiles(id) on delete cascade,
  views               bigint not null default 0,
  last_viewed_at      timestamptz,
  save_contact_clicks bigint not null default 0,
  phone_clicks        bigint not null default 0,
  email_clicks        bigint not null default 0,
  message_clicks      bigint not null default 0,
  website_clicks      bigint not null default 0,
  social_clicks       bigint not null default 0,
  map_clicks          bigint not null default 0
);

create or replace function public.track_event(p_profile uuid, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile_stats (profile_uuid)
  values (p_profile)
  on conflict (profile_uuid) do nothing;

  update public.profile_stats set
    views               = views               + case when p_event = 'view'         then 1 else 0 end,
    last_viewed_at      = case when p_event = 'view' then now() else last_viewed_at end,
    save_contact_clicks = save_contact_clicks + case when p_event = 'save_contact' then 1 else 0 end,
    phone_clicks        = phone_clicks        + case when p_event = 'phone'        then 1 else 0 end,
    email_clicks        = email_clicks        + case when p_event = 'email'        then 1 else 0 end,
    message_clicks      = message_clicks      + case when p_event = 'message'      then 1 else 0 end,
    website_clicks      = website_clicks      + case when p_event = 'website'      then 1 else 0 end,
    social_clicks       = social_clicks       + case when p_event = 'social'       then 1 else 0 end,
    map_clicks          = map_clicks          + case when p_event = 'map'          then 1 else 0 end
  where profile_uuid = p_profile;
end $$;

revoke all on function public.track_event(uuid, text) from public, anon, authenticated;
grant execute on function public.track_event(uuid, text) to service_role;

-- ---------------------------------------------------------------------
-- Row Level Security
-- RLS is ON and there are NO policies for anon/authenticated users, so
-- nobody can read or write these tables through the public API keys.
-- The Next.js server uses the service_role key (server-only) and decides
-- what is public (active profiles only) and what is admin-only.
-- ---------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.profile_stats enable row level security;

-- ---------------------------------------------------------------------
-- Storage bucket for profile photos and company logos (public read).
-- Uploads happen only from the server with the service_role key.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do nothing;
