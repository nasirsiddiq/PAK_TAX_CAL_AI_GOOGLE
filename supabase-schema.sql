-- Supabase Database Schema for Pakistan Tax Calculator
-- Run this SQL in your Supabase SQL Editor to set up all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  phone_number text,
  country text default 'Pakistan',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on users
alter table public.users enable row level security;

create policy "Users can read their own data"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users
  for update
  using (auth.uid() = id);

-- Calculations table (stores history of all calculations)
create table public.calculations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  calculation_type text not null, -- 'salary', 'withholding', 'sales_tax', 'zakat', 'property', etc.
  calculation_data jsonb not null, -- Input data for the calculation
  result jsonb not null, -- Calculation results
  name text, -- User-defined name
  description text,
  authority text default 'General',
  supplier text default 'General',
  calculation_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for calculations
create index calculations_user_id_idx on public.calculations(user_id);
create index calculations_created_at_idx on public.calculations(created_at desc);
create index calculations_type_idx on public.calculations(calculation_type);
create index calculations_authority_idx on public.calculations(authority);
create index calculations_supplier_idx on public.calculations(supplier);
create index calculations_date_idx on public.calculations(calculation_date);

-- Enable RLS on calculations
alter table public.calculations enable row level security;

create policy "Users can read their own calculations"
  on public.calculations
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own calculations"
  on public.calculations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own calculations"
  on public.calculations
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own calculations"
  on public.calculations
  for delete
  using (auth.uid() = user_id);

-- Saved Calculations table (for templates/favorites)
create table public.saved_calculations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  calculation_type text not null,
  template_data jsonb not null,
  name text not null,
  description text,
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for saved_calculations
create index saved_calculations_user_id_idx on public.saved_calculations(user_id);
create index saved_calculations_is_favorite_idx on public.saved_calculations(is_favorite);

-- Enable RLS on saved_calculations
alter table public.saved_calculations enable row level security;

create policy "Users can read their own saved calculations"
  on public.saved_calculations
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own saved calculations"
  on public.saved_calculations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved calculations"
  on public.saved_calculations
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved calculations"
  on public.saved_calculations
  for delete
  using (auth.uid() = user_id);

-- User Preferences table
create table public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  preferences jsonb default '{
    "theme": "light",
    "currency": "PKR",
    "taxYear": "2025-2026",
    "language": "en",
    "emailNotifications": true
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on user_preferences
alter table public.user_preferences enable row level security;

create policy "Users can read their own preferences"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences
  for update
  using (auth.uid() = user_id);

-- Emails Sent table (audit log)
create table public.emails_sent (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  email_type text not null, -- 'tax_certificate', 'welcome', 'reminder', etc.
  status text default 'sent', -- 'sent', 'failed', 'bounced'
  error_message text,
  sent_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for emails_sent
create index emails_sent_user_id_idx on public.emails_sent(user_id);
create index emails_sent_recipient_email_idx on public.emails_sent(recipient_email);

-- Enable RLS on emails_sent
alter table public.emails_sent enable row level security;

create policy "Users can read their own email logs"
  on public.emails_sent
  for select
  using (auth.uid() = user_id);

create policy "Service role can insert emails"
  on public.emails_sent
  for insert
  with check (true);

-- Official FBR locality valuation rates. Populate from verified FBR notifications.
create table public.property_valuation_rates (
  id uuid default uuid_generate_v4() primary key,
  city text not null,
  locality text not null,
  residential_rate numeric not null default 0,
  commercial_rate numeric not null default 0,
  industrial_rate numeric not null default 0,
  classification text,
  notification_reference text,
  effective_date date,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique (city, locality)
);

create index property_valuation_rates_city_idx on public.property_valuation_rates(city);

alter table public.property_valuation_rates enable row level security;

create policy "Property valuation rates are publicly readable"
  on public.property_valuation_rates
  for select
  using (true);

-- Tax Rates Reference table (for future use - store tax rates by year and type)
create table public.tax_rates_reference (
  id uuid default uuid_generate_v4() primary key,
  tax_year text not null, -- '2025-2026', '2024-2025', etc.
  tax_type text not null, -- 'income', 'sales', 'zakat', etc.
  rates jsonb not null,
  effective_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for tax_rates_reference
create index tax_rates_reference_year_type_idx on public.tax_rates_reference(tax_year, tax_type);

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger property_valuation_rates_update_trigger before update on public.property_valuation_rates
  for each row execute function update_updated_at_column();

-- Apply trigger to all tables with updated_at
create trigger users_update_trigger before update on public.users
  for each row execute function update_updated_at_column();

create trigger calculations_update_trigger before update on public.calculations
  for each row execute function update_updated_at_column();

create trigger saved_calculations_update_trigger before update on public.saved_calculations
  for each row execute function update_updated_at_column();

create trigger user_preferences_update_trigger before update on public.user_preferences
  for each row execute function update_updated_at_column();

-- Create initial user record function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to create user record on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
