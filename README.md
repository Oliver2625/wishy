# Wishy

Invite-only wishlists for family: birthdays, Christmas and everything in between.
Make a list, add wishes (paste a shop link and Wishy fills in the name, price and photo), and share it.
Family reserve gifts so nobody buys the same one twice, and reservations can stay hidden from the list owner.

Live at <https://wishy.oliveruhcc.workers.dev>.

## Stack

- **Next.js 16** (App Router, server actions). This version differs from older Next.js; see `AGENTS.md`.
- **Cloudflare Workers** in production, built with [vinext](https://github.com/cloudflare/vinext) (Vite).
- **Neon Postgres** for app data, and **Neon Auth** for sign-in with an emailed code.
- Tailwind CSS 4, shadcn/ui on Base UI, [blobatar](https://blobatar.dev) avatars.

## Setup

Needs Node 22+.

```bash
npm install
```

Create `.env.local`:

```bash
DATABASE_URL=postgres://...            # Neon, pooled
DATABASE_URL_UNPOOLED=postgres://...   # Neon, direct (migrations only)
NEON_AUTH_BASE_URL=https://...neonauth.../auth
NEON_AUTH_COOKIE_SECRET=...            # long random string
WISHY_ADMIN_EMAIL=you@example.com      # the only account that can invite new people
```

Apply the schema (safe to re-run):

```bash
node --env-file=.env.local db/migrate.mjs
```

Wishy is invite-only. Let the first person in, including the admin, with:

```sql
insert into invites (email) values ('you@example.com');
```

After that, the admin invites people from the Profile page or by sharing a list with them.

> Local dev and production share the same Neon database, so testing locally touches live data.

## Develop

```bash
npm run dev          # Next.js dev server, http://localhost:3000
npm run dev:vinext   # the Workers build under Vite, http://localhost:3001
npm run lint
node --test lib/*.test.mjs
```

Sign-in only works on origins that Neon Auth trusts. Add a new one with `neon neon-auth domain add <origin>`.

## Deploy

```bash
npm run build:vinext
npx wrangler deploy
```

Secrets live in Cloudflare, not in `wrangler.jsonc`. Set them with `npx wrangler secret put NAME`, using the same names as in `.env.local`.

To watch production logs, run `npx wrangler tail wishy`.

## Gotchas

- **`after()` on Workers:** vinext runs `after()` callbacks outside the request. `cookies()`, `headers()` and Neon Auth SDK calls throw there, so read request data before calling `after()`. See `app/login/actions.ts`.
- **ViewTransition:** import it only from `lib/view-transition.ts`. vinext's shim breaks other React imports in the same file.
- **Fetching shop links:** `lib/fetch-page.ts` refuses private and internal addresses to block SSRF. Keep those checks if you change it.

## Layout

```
app/(app)/       signed-in pages: lists, wishes, family, reserved, share, profile
app/(app)/actions.ts   all server actions
app/login/       email-code sign-in
components/      UI, with shadcn primitives in components/ui
lib/             auth, db, list queries, shop-page fetching and parsing, currency
db/schema.sql    the whole schema, applied by db/migrate.mjs
```
