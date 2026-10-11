-- Add premium visual themes and personal/business profile types without changing existing cards.
alter table public.profiles
  add column if not exists design_theme text not null default 'classic';

alter table public.profiles
  drop constraint if exists profiles_design_theme_check;
alter table public.profiles
  add constraint profiles_design_theme_check
  check (design_theme in (
    'classic', 'obsidian-gold', 'royal-prestige', 'ivory-minimal',
    'emerald-luxe', 'titanium', 'artisan-classic'
  ));

alter table public.profiles
  add column if not exists profile_type text not null default 'personal';
alter table public.profiles
  add column if not exists business_name text;

alter table public.profiles
  drop constraint if exists profiles_profile_type_check;
alter table public.profiles
  add constraint profiles_profile_type_check
  check (profile_type in ('personal', 'business'));
