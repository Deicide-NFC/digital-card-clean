-- NFC card ordering: orders are private and are written only by the server.
-- Run this migration in Supabase SQL Editor before deploying the /order page.
create table if not exists public.card_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  plan text not null check (plan in ('personal', 'business')),
  price_php integer not null check (
    (plan = 'personal' and price_php = 99) or
    (plan = 'business' and price_php = 149)
  ),
  customer_email text not null,
  payment_reference text not null,
  design jsonb not null default '{}'::jsonb,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'verified', 'rejected')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'in_production', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists card_orders_created_at_idx
  on public.card_orders (created_at desc);
create index if not exists card_orders_payment_status_idx
  on public.card_orders (payment_status);

alter table public.card_orders enable row level security;
-- No anon/authenticated policies: customers cannot read or alter order records.
-- The Next.js API uses the server-only service-role key to insert orders.

-- Define a dedicated trigger function so this migration works even if the
-- existing project does not already have a public.set_updated_at() function.
create or replace function public.set_card_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists card_orders_set_updated_at on public.card_orders;
create trigger card_orders_set_updated_at
  before update on public.card_orders
  for each row execute function public.set_card_orders_updated_at();
