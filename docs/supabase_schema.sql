-- Roc Candy Supabase schema (flat columns; no JSON settings).
-- Order of statements is important. Paste into Supabase SQL editor.

-- Tables
create table if not exists categories (
  id text primary key,
  name text not null
);

create table if not exists user_roles (
  user_id uuid primary key,
  role text not null check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

create table if not exists weight_tiers (
  id uuid primary key default gen_random_uuid(),
  category_id text references categories(id) on delete cascade,
  min_kg numeric(6,2) not null,
  max_kg numeric(6,2) not null,
  price numeric(12,2) not null,
  per_kg boolean not null default false,
  notes text
);

create table if not exists packaging_options (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  size text not null,
  candy_weight_g numeric(10,2) not null,
  allowed_categories text[] not null,
  unit_price numeric(12,2) not null,
  max_packages integer not null
);

create table if not exists label_ranges (
  id uuid primary key default gen_random_uuid(),
  upper_bound integer not null,
  range_cost numeric(12,2) not null
);

-- Flat settings (one row, id = 1)
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  lead_time_days int not null default 14,
  urgency_fee numeric(12,2) not null default 10,
  transaction_fee_percent numeric(6,3) not null default 2.2,
  jacket_rainbow numeric(12,2) not null default 30,
  jacket_two_colour numeric(12,2) not null default 30,
  jacket_pinstripe numeric(12,2) not null default 30,
  max_total_kg numeric(8,2) not null default 8,
  labels_supplier_shipping numeric(12,2) not null default 0,
  labels_markup_multiplier numeric(6,3) not null default 1.0,
  labels_max_bulk int not null default 1000
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  category_id text references categories(id),
  packaging_option_id uuid references packaging_options(id),
  quantity numeric,
  labels_count numeric,
  jacket text,
  due_date date,
  total_weight_kg numeric not null check (total_weight_kg > 0),
  total_price numeric,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists production_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  capacity_kg numeric not null check (capacity_kg > 0),
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists production_slots_slot_date_idx on public.production_slots (slot_date);

create table if not exists order_slots (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  slot_id uuid not null references public.production_slots (id) on delete cascade,
  kg_assigned numeric not null check (kg_assigned > 0),
  created_at timestamptz not null default now(),
  unique (order_id, slot_id)
);
create index if not exists order_slots_slot_idx on public.order_slots (slot_id);
create index if not exists order_slots_order_idx on public.order_slots (order_id);

-- Helper
create or replace function is_admin(uid uuid) returns boolean as $$
  select exists (select 1 from user_roles where user_id = uid and role = 'admin');
$$ language sql stable;

-- RLS
alter table categories enable row level security;
alter table weight_tiers enable row level security;
alter table packaging_options enable row level security;
alter table label_ranges enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table production_slots enable row level security;
alter table order_slots enable row level security;
alter table user_roles enable row level security;

-- Policies
create policy "categories_select_public" on categories for select using (true);
create policy "weight_tiers_select_public" on weight_tiers for select using (true);
create policy "packaging_select_public" on packaging_options for select using (true);
create policy "label_ranges_select_public" on label_ranges for select using (true);
create policy "settings_select_public" on settings for select using (true);

create policy "categories_admin_write" on categories for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "weight_tiers_admin_write" on weight_tiers for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "packaging_admin_write" on packaging_options for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "label_ranges_admin_write" on label_ranges for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "settings_admin_write" on settings for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "orders_admin_access" on orders for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "slots_admin_access" on production_slots for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "order_slots_admin_access" on order_slots for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "roles_admin_access" on user_roles for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- Seed
insert into categories (id, name) values
  ('weddings-initials','Weddings (initials)'),
  ('weddings-both-names','Weddings (both names)'),
  ('custom-1-6','Custom text (1-6)'),
  ('custom-7-14','Custom text (7-14)'),
  ('branded','Branded')
on conflict do nothing;

insert into weight_tiers (category_id, min_kg, max_kg, price, per_kg, notes) values
  ('weddings-initials', 1, 3, 295, false, 'Base 1-3 kg'),
  ('weddings-initials', 4, 6, 50, true, 'Per kg 4-6 kg'),
  ('weddings-initials', 7, 8, 465, false, 'Matches weddings-both-names'),
  ('weddings-both-names', 0, 8, 465, false, 'Flat'),
  ('custom-1-6', 1, 3, 295, false, 'Base 1-3 kg'),
  ('custom-1-6', 4, 6, 50, true, 'Per kg 4-6 kg'),
  ('custom-1-6', 7, 8, 465, false, 'Matches custom-7-14'),
  ('custom-7-14', 0, 8, 465, false, 'Flat'),
  ('branded', 0, 8, 615, false, 'Flat')
on conflict do nothing;

insert into packaging_options (type, size, candy_weight_g, allowed_categories, unit_price, max_packages) values
  ('Clear Bag','3-5pc',10,'{custom-1-6,custom-7-14,branded}',0.37,800),
  ('Clear Bag','5-7pc',15,'{custom-1-6,custom-7-14,branded}',0.55,500),
  ('Clear Bag','8-10pc',23,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.60,320),
  ('Clear Bag','12-15pc',34,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.60,230),
  ('Clear Bag','25-30pc',66,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.65,120),
  ('Bulk','1kg',1000,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.00,8),
  ('Zip Bag','8-10pc',23,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.70,320),
  ('Zip Bag','12-15pc',34,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.70,230),
  ('Zip Bag','25-30pc',66,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',0.70,120),
  ('Jar','Mini 23g',23,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',1.70,350),
  ('Jar','Small 75g',75,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',1.70,110),
  ('Jar','Medium 125g',125,'{weddings-initials,weddings-both-names,custom-1-6,custom-7-14,branded}',2.75,65),
  ('Cone','12-15pc',34,'{weddings-initials,weddings-both-names}',0.70,230),
  ('Cone','25-30pc',60,'{weddings-initials,weddings-both-names}',0.70,120)
on conflict do nothing;

insert into label_ranges (upper_bound, range_cost) values
  (25,0.70),(50,0.44),(75,0.44),(100,0.44),(125,0.43),(150,0.41),(175,0.39),(200,0.36),
  (225,0.35),(250,0.35),(275,0.34),(300,0.34),(325,0.33),(350,0.33),(375,0.32),(400,0.32),
  (425,0.31),(450,0.31),(475,0.30),(500,0.30),(525,0.29),(550,0.29),(575,0.28),(600,0.28),
  (625,0.27),(650,0.27),(675,0.26),(700,0.26),(725,0.26),(750,0.25),(775,0.25),(800,0.25)
on conflict do nothing;

insert into settings (id, lead_time_days, urgency_fee, transaction_fee_percent, jacket_rainbow, jacket_two_colour, jacket_pinstripe, max_total_kg, labels_supplier_shipping, labels_markup_multiplier)
values (1, 14, 10, 2.2, 30, 30, 30, 8, 0, 1.0)
on conflict (id) do update set
  lead_time_days = excluded.lead_time_days,
  urgency_fee = excluded.urgency_fee,
  transaction_fee_percent = excluded.transaction_fee_percent,
  jacket_rainbow = excluded.jacket_rainbow,
  jacket_two_colour = excluded.jacket_two_colour,
  jacket_pinstripe = excluded.jacket_pinstripe,
  max_total_kg = excluded.max_total_kg,
  labels_supplier_shipping = excluded.labels_supplier_shipping,
  labels_markup_multiplier = excluded.labels_markup_multiplier,
  labels_max_bulk = coalesce(settings.labels_max_bulk, excluded.labels_max_bulk);
