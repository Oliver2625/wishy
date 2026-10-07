-- Users and sessions live in neon_auth (Neon Auth). This is only the app data.
-- Apply: node --env-file=.env.local db/migrate.mjs (safe to re-run)

-- Invite-only gate. Neon Auth's email-code sign-in creates accounts for any
-- inbox, so the app only lets in verified emails listed here.
-- Invite someone: insert into invites (email) values ('friend@example.com')
create table if not exists invites (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references neon_auth."user"(id) on delete cascade,
  title text not null,
  event_date date,
  created_at timestamptz not null default now()
);

create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  title text not null,
  url text,
  note text,
  reserved_by uuid references neon_auth."user"(id) on delete set null, -- so two people don't buy the same gift
  created_at timestamptz not null default now()
);

create index if not exists wishlists_owner_id_idx on wishlists (owner_id);
create index if not exists wishes_wishlist_id_idx on wishes (wishlist_id);

-- Card fields (v2). alter ... if not exists keeps this file re-runnable.
alter table wishes add column if not exists store text;
alter table wishes add column if not exists price numeric(10, 2) check (price >= 0);
-- 1 nice to have, 2 would love, 3 most wanted
alter table wishes add column if not exists priority smallint not null default 2 check (priority between 1 and 3);
alter table wishes add column if not exists image_url text;
alter table wishes drop column if exists most_wanted;

-- Sharing (v3). Each list is visible only to its owner and the emails it's shared with.
alter table wishlists add column if not exists share_code text unique default replace(gen_random_uuid()::text, '-', '');
alter table wishlists add column if not exists hide_reservations boolean not null default true; -- owner can't see what's taken
alter table wishlists add column if not exists show_reserver boolean not null default true;     -- family sees who took it

-- Keyed by email so you can share before someone has signed in. Removing their invite removes their access.
create table if not exists list_shares (
  list_id uuid not null references wishlists(id) on delete cascade,
  email text not null references invites(email) on delete cascade,
  role text not null default 'reserve' check (role in ('view', 'reserve')),
  primary key (list_id, email)
);
create index if not exists list_shares_email_idx on list_shares (email);

-- List details (v4)
alter table wishlists add column if not exists occasion text not null default 'other'
  check (occasion in ('birthday', 'christmas', 'wedding', 'baby', 'other'));
alter table wishlists add column if not exists message text;

-- Sign-in code sends, for rate limiting (v5). Only invited emails ever get rows, and old rows are pruned on send.
create table if not exists otp_sends (
  email text not null,
  sent_at timestamptz not null default now()
);
create index if not exists otp_sends_email_sent_at_idx on otp_sends (email, sent_at);

-- Profile (v6): what gift givers should know. Shown to family on lists you share.
create table if not exists profiles (
  user_id uuid primary key references neon_auth."user"(id) on delete cascade,
  birthday date,
  clothing_size text,
  shoe_size text,
  likes text,
  avoid text
);

-- Currency (v7). Profile: what fetched prices get converted to. Wish: what its price is in,
-- so changing the profile later never relabels old prices.
alter table profiles add column if not exists currency text not null default 'DKK' check (currency ~ '^[A-Z]{3}$');
alter table wishes add column if not exists currency text not null default 'DKK' check (currency ~ '^[A-Z]{3}$');
