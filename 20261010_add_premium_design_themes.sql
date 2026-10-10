-- Add premium visual palettes while preserving existing Light/Dark/Match phone settings.
alter table public.profiles
  add column if not exists design_theme text not null default 'classic';

alter table public.profiles
  drop constraint if exists profiles_design_theme_check;

alter table public.profiles
  add constraint profiles_design_theme_check
  check (design_theme in (
    'classic',
    'obsidian-gold',
    'royal-prestige',
    'ivory-minimal',
    'emerald-luxe',
    'titanium',
    'artisan-classic'
  ));
