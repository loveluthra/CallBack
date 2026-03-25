-- Callback v2 Schema
-- Run this in your Supabase SQL editor

create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  owner_name text,
  name text,
  city text,
  phone text,
  twilio_sid text,
  twilio_token text,
  twilio_from text,
  plan text default 'starter',
  created_at timestamptz default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  service text,
  stylist text,
  appointment_time timestamptz not null,
  status text default 'pending',
  reminder_sent boolean default false,
  call_sid text,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table salons enable row level security;
alter table appointments enable row level security;

-- Policies: salons can only see their own data
create policy "salons_own_data" on salons
  for all using (true);

create policy "appointments_own_data" on appointments
  for all using (true);
