# Skill Tracker

Mobile-first PWA for tracking autoregulated calisthenics skill training (Maltese, Planche, Front Lever, Muscle Up). See [CLAUDE.md](./CLAUDE.md) for the full product spec.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack), Tailwind CSS v4
- Supabase (Postgres + Auth via email magic link, Row Level Security for per-user data isolation)
- `@supabase/ssr` for cookie-based session handling, `src/proxy.ts` (Next 16's `middleware.ts` replacement) refreshes the session and gates routes
- Recharts for progress charts, `lucide-react` for icons

## One-time setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the migrations** — open the Supabase SQL editor and run, in order:
   - `supabase/migrations/0001_init.sql` (schema, RLS policies, seed exercise library)
   - `supabase/migrations/0002_functions.sql` (atomic session+sets creation RPC)
3. **Copy your API credentials** — Project Settings → API — into a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Enable email auth** — it's on by default in Supabase. For magic links to work outside of localhost, add your deployed URL to Authentication → URL Configuration → Redirect URLs (`https://yourapp.com/auth/callback`).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` — enter your email to get a magic sign-in link.

## Project structure

- `src/app/(app)/` — authenticated screens (Today, Check-in, Log, History, Progress, Weekly), sharing a bottom-nav layout
- `src/app/login`, `src/app/auth/callback` — public auth routes
- `src/proxy.ts` — session refresh + route protection (redirects signed-out users to `/login`)
- `src/lib/supabase/` — browser/server Supabase clients + `UserProvider` context
- `src/lib/data.ts` — typed data-access functions (all RLS-scoped to the signed-in user)
- `src/lib/intensity.ts` — the check-in → suggested intensity logic
- `supabase/migrations/` — SQL schema, RLS policies, and the `create_session` RPC

## Deploying

Deploy to Vercel (`vercel.com/new`), set the two `NEXT_PUBLIC_SUPABASE_*` env vars in the project settings, and add the deployed domain to Supabase's redirect URL allowlist.
