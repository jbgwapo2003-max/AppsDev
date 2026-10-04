create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists bio text;

create table if not exists public.streetfood_spots (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null,
  address text not null,
  city text not null,
  neighborhood text not null,
  lat double precision not null,
  lng double precision not null,
  price_range text not null,
  open_hours text,
  tags text[] not null default '{}',
  status text not null default 'visible' check (status in ('visible', 'hidden', 'flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spot_photos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.streetfood_spots(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.spot_prices (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.streetfood_spots(id) on delete cascade,
  item text not null,
  price_php numeric(10, 2) not null check (price_php >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.streetfood_spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.streetfood_spots(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null check (char_length(comment) between 12 and 1200),
  quantity_rating int not null check (quantity_rating between 1 and 5),
  quality_rating int not null check (quality_rating between 1 and 5),
  cleanliness_rating int not null check (cleanliness_rating between 1 and 5),
  value_rating int not null check (value_rating between 1 and 5),
  service_rating int not null check (service_rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (spot_id, user_id)
);

create table if not exists public.review_likes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid references public.streetfood_spots(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  reason text not null check (reason in ('incorrect', 'duplicate', 'closed', 'inappropriate', 'other')),
  notes text,
  created_at timestamptz not null default now(),
  check (spot_id is not null or review_id is not null)
);

create or replace view public.spot_rating_summaries as
select
  spot_id,
  count(*)::int as review_count,
  round(avg((quantity_rating + quality_rating + cleanliness_rating + value_rating + service_rating)::numeric / 5), 2) as average_rating,
  round(avg(quantity_rating), 2) as quantity_average,
  round(avg(quality_rating), 2) as quality_average,
  round(avg(cleanliness_rating), 2) as cleanliness_average,
  round(avg(value_rating), 2) as value_average,
  round(avg(service_rating), 2) as service_average
from public.reviews
group by spot_id;

alter table public.profiles enable row level security;
alter table public.streetfood_spots enable row level security;
alter table public.spot_photos enable row level security;
alter table public.spot_prices enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable" on public.profiles for select using (true);
drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

drop policy if exists "Visible spots are public" on public.streetfood_spots;
create policy "Visible spots are public" on public.streetfood_spots for select using (status = 'visible');
drop policy if exists "Authenticated users create spots" on public.streetfood_spots;
create policy "Authenticated users create spots" on public.streetfood_spots for insert with check (auth.uid() = submitter_id);
drop policy if exists "Submitters update own spots" on public.streetfood_spots;
create policy "Submitters update own spots" on public.streetfood_spots for update using (auth.uid() = submitter_id);

drop policy if exists "Photos are public for visible spots" on public.spot_photos;
create policy "Photos are public for visible spots" on public.spot_photos for select using (
  exists (select 1 from public.streetfood_spots s where s.id = spot_id and s.status = 'visible')
);
drop policy if exists "Users add own photos" on public.spot_photos;
create policy "Users add own photos" on public.spot_photos for insert with check (auth.uid() = user_id);

drop policy if exists "Prices are public for visible spots" on public.spot_prices;
create policy "Prices are public for visible spots" on public.spot_prices for select using (
  exists (select 1 from public.streetfood_spots s where s.id = spot_id and s.status = 'visible')
);
drop policy if exists "Authenticated users add prices" on public.spot_prices;
create policy "Authenticated users add prices" on public.spot_prices for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users read own bookmarks" on public.bookmarks;
create policy "Users read own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
drop policy if exists "Users create own bookmarks" on public.bookmarks;
create policy "Users create own bookmarks" on public.bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own bookmarks" on public.bookmarks;
create policy "Users delete own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews for select using (
  exists (select 1 from public.streetfood_spots s where s.id = spot_id and s.status = 'visible')
);
drop policy if exists "Users create own reviews" on public.reviews;
create policy "Users create own reviews" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own reviews" on public.reviews;
create policy "Users update own reviews" on public.reviews for update using (auth.uid() = user_id);
drop policy if exists "Users delete own reviews" on public.reviews;
create policy "Users delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

drop policy if exists "Review likes are public" on public.review_likes;
create policy "Review likes are public" on public.review_likes for select using (
  exists (
    select 1
    from public.reviews r
    join public.streetfood_spots s on s.id = r.spot_id
    where r.id = review_id and s.status = 'visible'
  )
);
drop policy if exists "Users create own review likes" on public.review_likes;
create policy "Users create own review likes" on public.review_likes for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own review likes" on public.review_likes;
create policy "Users delete own review likes" on public.review_likes for delete using (auth.uid() = user_id);

drop policy if exists "Users create own reports" on public.reports;
create policy "Users create own reports" on public.reports for insert with check (auth.uid() = reporter_id);

insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "Spot photos are publicly readable" on storage.objects;
create policy "Spot photos are publicly readable"
on storage.objects for select
using (bucket_id = 'spot-photos');

drop policy if exists "Authenticated users upload spot photos" on storage.objects;
create policy "Authenticated users upload spot photos"
on storage.objects for insert
with check (bucket_id = 'spot-photos' and auth.role() = 'authenticated');

drop policy if exists "Profile avatars are publicly readable" on storage.objects;
create policy "Profile avatars are publicly readable"
on storage.objects for select
using (bucket_id = 'profile-avatars');

drop policy if exists "Users upload own profile avatars" on storage.objects;
create policy "Users upload own profile avatars"
on storage.objects for insert
with check (bucket_id = 'profile-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users update own profile avatars" on storage.objects;
create policy "Users update own profile avatars"
on storage.objects for update
using (bucket_id = 'profile-avatars' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'profile-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
