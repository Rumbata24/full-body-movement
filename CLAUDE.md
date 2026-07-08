# Project: Calisthenics Skill Tracker

Mobile-first web app for tracking a calisthenics skill-training system (Maltese, Planche, Front Lever, Muscle Up, etc.), built around autoregulated intensity days. This is intended to become a real product, not a throwaway prototype — build accordingly.

## Current status: MVP built and live

The full MVP below is implemented, running against a real Supabase project, and has been visually verified screen-by-screen in a live browser session (not just code review). See "Current architecture notes" near the bottom for how things are wired together and what's still deferred.

## Tech expectations
- Mobile-first, installable as a home-screen web app (PWA: manifest + service worker + icons).
- Real accounts and a real database (not browser-only storage) — data must persist across devices and support multiple users eventually.
- Clean, modern UI, dark-mode friendly. Should feel like a premium fitness app (Whoop/Oura/Strava tone), not a generic CRUD admin panel.
- Fast to log a workout on a phone mid-session — minimal taps, big touch targets.

## Core concept: Autoregulated Intensity Days
Every training day is tagged as one of:
- **High (80–100%)** — 1–2x per week. Near-max attempts on skills.
- **Moderate (60–70%)** — most days. Solid working volume, not maximal.
- **Active Recovery / Rest** — 1–2x per week. Light mobility/skill work or full rest.

Rule: the user picks the day's actual intensity based on how they feel — a planned High day can be downgraded to Moderate. The app supports and encourages this; it never forces a rigid schedule.

Example week (illustrative, not fixed): 1–2 high days, 1–2 recovery days, remaining days moderate.

## Feature: Daily Check-In (core feature) — ✅ built
Before logging a workout, a quick check-in (2–3 taps):
1. How do you feel today? (Fresh / Okay / Tired / Sore / Wiped)
2. App suggests an intensity level (High / Moderate / Recovery) based on the weekly plan and the check-in — recommending a downgrade if fatigue is signaled.
3. User confirms or overrides — final call is always theirs.

Log both the planned and the actually-chosen intensity so the user can later see patterns (e.g. "I downgrade Wednesdays a lot," "3 high days this week may be too many"). The suggestion logic lives in `src/lib/intensity.ts` (`suggestIntensity`).

## Feature: Skill & Exercise Library — ✅ built
Pre-seeded (`supabase/migrations/0001_init.sql`) with:
- **Maltese**
- **Planche** (tuck, advanced tuck, straddle, full)
- **Front Lever** (tuck, advanced tuck, single leg, straddle, full)
- **Muscle Up** (bar and rings)
- Plus common strength/mobility/stretch accessories (pull-up, dip, push-up variants, etc.)

Per exercise: name, category (skill / strength / mobility / stretch), progression stage, skill group, is-custom flag, owner (for custom ones).

**Custom exercises**: users can type any exercise name in the exercise picker (Log screen, Plan editor) — if it doesn't match an existing one, a "+ Add as custom exercise" flow appears with a one-tap category chooser (Skill/Strength/Mobility/Stretch). No fixed list limit; this is the intended answer to "calisthenics has too many variations to pre-seed them all." Deliberately did **not** integrate an external exercise API — free text + one tap is faster and generic fitness APIs don't have calisthenics-specific progressions anyway.

Per set logging: hold time (seconds) OR reps, optional RPE (1–10), free-text notes.

## Feature: Workout Logging — ✅ built
- A session = date + intensity level (from check-in) + list of exercises with sets.
- Fast add flow: pick exercise → enter time/reps → done. Reordering via up/down controls per exercise block.
- Duplicate a previous session as a starting template.

## Feature: Workout Plans — ✅ built (added post-MVP)
Reusable named templates you design ahead of training, separate from the historical record of actual sessions:
1. Build a plan ("Push Day": exercise 1 × N sets × target reps/seconds, exercise 2, ...) under **My Plans** (linked from the Log screen header).
2. On the Log screen, **"Start from a plan"** pre-fills the exercise blocks with the plan's targets as editable starting values.
3. Edit freely while training — change reps/seconds to what actually happened, swap exercises for variations, add/remove sets — then save as today's real session, same as any other logged session.

Plans and sessions are intentionally two separate concepts (`workout_plans`/`workout_plan_sets` tables vs `sessions`/`set_logs`) — a plan never mutates once loaded into the Log screen, it's just a starting point.

## Feature: Progress Tracking — ✅ built
- Per-skill progress chart: gradient-filled area chart (Recharts) + a glowing `ScoreRing` showing the latest value relative to personal best.
- Weekly view: planned (outline badges) vs actual (filled badges) intensity per day, plus a check-in streak counter. Tap a planned badge to cycle High → Moderate → Recovery.
- Visual and motivating (progress rings, soft glows) — not a wall of numbers.

## Data model (as implemented)
- **profiles**: extends `auth.users` — units, display name.
- **weekly_plans**: one row per user per day-of-week (0–6), default intensity — editable, not fixed.
- **check_ins**: date, feeling, planned/suggested/chosen intensity (unique per user+date, upserted).
- **exercises**: name, category, skill_group, progression_stage, is_custom, owner_id (null = global/seeded).
- **sessions**: date, intensity, linked check_in, notes.
- **set_logs**: session, exercise, reps OR duration_seconds, RPE, notes, order_index.
- **workout_plans**: user_id, name.
- **workout_plan_sets**: plan_id, exercise_id, reps OR duration_seconds, order_index (no RPE/notes — plans are targets, not logs).

All tables have RLS scoping rows to `auth.uid()` (directly, or via the parent session/plan for the `*_logs`/`*_sets` child tables). Session and plan creation/updates go through Postgres RPC functions (`create_session`, `create_workout_plan`, `update_workout_plan` in `supabase/migrations/`) so the parent row + child rows are written atomically.

## MVP scope — all built
1. ✅ Auth (Supabase email + password — see "Feature: Auth & Profile" below).
2. ✅ Daily check-in flow → intensity suggestion.
3. ✅ Exercise library seeded with the 4 named skills + progressions, plus unlimited custom exercise support.
4. ✅ Session logging: pick intensity, add exercises, log sets.
5. ✅ History view of past sessions.
6. ✅ Progress chart per exercise (ring + area chart).
7. ✅ Weekly view: planned vs actual intensity.
8. ✅ PWA setup (manifest, icons, service worker — production-only, see notes below).
9. ✅ Workout plan templates (post-MVP addition, see above).
10. ✅ Profile screen — display name, units, sign out (post-MVP addition, see below).

## Feature: Auth & Profile — ✅ built (switched from magic link post-MVP)
Originally shipped as passwordless email-magic-link only. Switched to email + password with distinct screens per user request:
- `src/app/login/page.tsx` — email + password sign-in (`supabase.auth.signInWithPassword`).
- `src/app/register/page.tsx` — name + email + password sign-up (`supabase.auth.signUp`, with `options.data.display_name` so the DB trigger seeds `profiles.display_name` immediately). Signs the user in and redirects to `/` right away — no email confirmation step. Supabase's "Confirm email" setting (Authentication → Sign In / Providers → User Signups) was turned **off** for this project (2026-07-08) at the user's request, since requiring a confirmation-link click before first sign-in felt unnecessarily friction-y for this app. This does mean signup doesn't verify email ownership — acceptable tradeoff for now given the target usage (personal/small-scale tracker), revisit if this becomes a multi-tenant product with account-recovery or spam concerns.
- `src/app/(app)/profile/page.tsx` — view/edit `display_name` and `units` (backed by `getProfile`/`updateProfile` in `src/lib/data.ts`), shows the account email (read-only, from the auth user), a change-password form, and a sign-out button. Linked from a small circular icon button in the Today screen header (top-right).
- `src/app/forgot-password/page.tsx` + `src/app/reset-password/page.tsx` — password recovery. Forgot-password sends the reset email via `resetPasswordForEmail(email, { redirectTo: origin + "/auth/callback?next=/reset-password" })`; the callback route exchanges the code (establishing a real, recently-created session) and lands on `/reset-password`, which calls `updateUser({ password })`. `/reset-password` is intentionally **not** in `proxy.ts`'s `PUBLIC_PATHS` — it relies on the normal auth-gate redirect to `/login` for anyone without a valid (recovery) session.
- Change-password (on the Profile screen) calls `updateUser({ password, current_password })` — the `current_password` field is required now that "Require current password when updating" is enabled (see Security hardening). Both this and reset-password use `minLength={10}` client-side to match the server-side policy.
- `src/app/auth/callback/route.ts` — handles the PKCE `code` exchange for both signup-confirmation-style links (currently unused, since "Confirm email" is off) and password-recovery links (`/forgot-password` → this route → `/reset-password`).
- `src/components/ui/AuthHeader.tsx` — shared ring-logo + title/subtitle header, used by all four auth screens (login, register, forgot-password, reset-password) instead of duplicating the SVG.
- `src/proxy.ts` — `/register` and `/forgot-password` added to `PUBLIC_PATHS`; signed-in users hitting `/login` or `/register` are redirected to `/`.
- `supabase/migrations/0004_profile_display_name.sql` — updates the `handle_new_user()` trigger to read `display_name` out of `new.raw_user_meta_data` (populated by `signUp`'s `options.data`) so the profile row is created with the right name from the start. **This migration must be run by hand in the Supabase SQL editor** — no automated migration runner is wired up (see "Stack decisions"). ✅ Already applied to the live project (2026-07-08).
- `src/lib/supabase/errors.ts` (`friendlyAuthError`) — used by both login and register instead of showing `error.message` raw. Needed because `@supabase/auth-js` treats any 5xx from the Auth API as "retryable" and skips parsing the response body, so `error.message` ends up as the *stringified Response object* — literally the text `"{}"` — instead of the server's actual message (e.g. "Error sending confirmation email"). Confirmed live: a Resend/SMTP outage during testing produced exactly this, and the raw `"{}"` was being rendered straight to the user before this fix. If you see a bare `{}` error anywhere else auth errors are surfaced, apply the same fix.

## Security hardening — ✅ done (2026-07-08)
Code-level (reversible via git):
- **Strict CSP via `src/proxy.ts`** — nonce + `'strict-dynamic'` on `script-src` (Next.js auto-attaches the nonce to every framework/page script it emits — verified live via response headers and page source), `frame-ancestors 'none'`, `object-src 'none'`, `connect-src` scoped to `'self'` + `*.supabase.co`. `style-src` uses `'unsafe-inline'` deliberately — CSP nonces can't cover inline `style="..."` attributes (only `<style>` tags), and this app relies on React inline `style={{...}}` props for dynamic colors (`ScoreRing`, `IntensitySelector`, glows). Also sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` on every response. Verified: no CSP violations in console, all pages render, real Supabase API calls succeed under the new `connect-src`.
- **Open-redirect fix in `src/app/auth/callback/route.ts`** — the `?next=` param is now validated (`safeRedirectPath`) to be a same-site relative path before use as a redirect target, rejecting absolute/protocol-relative URLs.
- **`supabase/migrations/0005_security_hardening.sql`** — `update_workout_plan` previously relied entirely on RLS to block cross-user writes (which worked, but surfaced a raw Postgres RLS-violation error instead of failing cleanly). Now explicitly checks plan ownership up front. ✅ Applied to the live project.

Live Supabase project settings (Authentication → Sign In / Providers → Email, and → Rate Limits), all applied 2026-07-08 per explicit user sign-off on exact values:
- **Password policy**: minimum length raised from 6 → **10**; character requirements set to **lowercase + uppercase + digits + symbols** (was: none).
- **"Secure password change" enabled** — password changes require a session created within the last 24h (blocks a stale/hijacked session token from silently taking over the account via password change).
- **"Require current password when updating" enabled** — password changes now require re-entering the current password.
- **Sign-in/sign-up rate limit tightened**: 30 → **10 requests/5min per IP** (360/hour → 120/hour).
- **"Prevent use of leaked passwords"** (HaveIBeenPwned check) is **Pro-plan-only** on Supabase — not available on this project's Free tier without a billing upgrade. Left off; revisit if/when upgrading.
- **CAPTCHA** (Cloudflare Turnstile) — deliberately **not** added; judged unnecessary friction for a single-user app with no public signup traffic yet. Revisit if bot/abuse traffic becomes a real problem — Attack Protection page has a ready-made toggle for it once a Turnstile site key exists.

## Explicitly out of scope for now (design so these bolt on later without a rebuild)
- Stretching/mobility and flexibility tracking modules.
- Explosive leg/plyometric training modules.
- Broader "everyday sustainable full-body" programming beyond the skill system.
- Payments/social features — just keep `category` fields and per-user data isolation generic enough to support this later.

## Design tone — implemented
Modern, minimal, athlete's-tool feel — closer to **Oura** than Whoop.

Specifically, as built:
- **Calm, quiet UI** — soft dark backgrounds via a layered radial-gradient body background (warm gold + cool blue + sage hints fading into deep charcoal/navy), not flat black.
- **One score/number takes center stage per screen** — `ScoreRing` component (soft glowing ring + big confident numeral) used on Today, Check-in confirmation, and Progress.
- **Soft gradients and circular/ring motifs** — `ScoreRing`'s glow uses a `radial-gradient` (not a blurred solid div — that caused a visible square artifact, see gotchas below) plus a slow 3s breathing pulse animation (`glow-pulse` keyframe in `globals.css`).
- **Rounded corners, soft shadows, subtle depth** — `Card` component uses an inset top highlight + layered shadow + subtle gradient fill, not a flat single color.
- **Muted, sophisticated color palette** — CSS custom properties in `globals.css` (`--color-accent` soft gold, `--color-high`/`--color-moderate`/`--color-recovery` for intensity).
- **Typography-led hierarchy** — Inter (body) + Sora (display/numerals) via `next/font`.
- **Gentle language, not alarms** — Recovery framed as restorative, not a warning.
- Dark mode only for now (`color-scheme: dark` forced); light mode not yet built.

## Working notes
- Ask clarifying questions about data model, auth provider, or hosting before starting a feature if genuinely ambiguous — otherwise make a reasonable choice and proceed.
- Keep this file updated as scope grows (stretching, mobility, explosive leg work are planned future additions — update this doc when that work starts).

## Stack decisions (locked in)
- **Framework**: Next.js 16 (App Router, TypeScript, Turbopack), Tailwind CSS v4.
- **Backend**: Supabase — Postgres database + Supabase Auth (email + password, with email confirmation links handled the same way magic links used to be) + Row Level Security for per-user data isolation.
- **Email**: Custom SMTP via **Resend** is configured in the Supabase project (Authentication → SMTP Settings) — Supabase's default shared email sender has a strict rate limit (a few emails/hour) that broke testing early on; Resend gives 30/hour+ and removes that ceiling. Sender is `onboarding@resend.dev` (Resend's no-setup-needed test address — fine for now, revisit if a custom domain is wanted later). Signup no longer sends an email at all ("Confirm email" is off); this SMTP config is currently unused but will matter again once a "forgot password" flow is added.
- **Data access**: `@supabase/supabase-js` + `@supabase/ssr` for server/client auth-aware queries. Schema managed via SQL migrations in `supabase/migrations/`, applied by hand via the Supabase SQL editor (no CLI/migration-runner wired up yet).
- **Hosting**: Vercel. ✅ Deployed 2026-07-09 — **https://calisthenics-skill-tracker.vercel.app**, project `rumens-projects-ad90a99f/calisthenics-skill-tracker`, GitHub repo `Rumbata24/full-body-movement` connected for auto-deploy-on-push to `main`. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` set for both Production and Preview environments via `vercel env add`. Supabase project hosts the DB/auth; its Site URL and Redirect URLs (Authentication → URL Configuration) were updated to include both the Vercel domain and `localhost:3000` so auth flows (password reset) work in both environments.

## Current architecture notes (read before continuing work)

**Key shared files:**
- `src/lib/useDraftBlocks.ts` — the exercise-block editing state (add/remove/reorder exercises and sets, flatten to a save payload). Shared by the Log screen and the Plan editor; also exports `setsToBlocks()` to hydrate blocks from a past session or a saved plan.
- `src/components/ExercisePicker.tsx` — shared exercise picker/search bottom sheet, used by Log, Plan editor, and Progress (single-select mode via `selectedId`). Handles custom-exercise creation with a category chooser.
- `src/components/ui/ScoreRing.tsx`, `IntensitySelector.tsx`, `IntensityBadge.tsx`, `Card.tsx`, `Button.tsx` — shared design-system primitives; reuse these rather than one-off styling.
- `src/proxy.ts` — Next 16's `middleware.ts` replacement; gates all routes except `/login`, `/register`, `/forgot-password`, `/auth`, `/offline`. Also sets the CSP + other security headers on every response (see the CSP gotcha below before touching this).

**Deferred, before going to production:**
- `src/proxy.ts` currently calls `supabase.auth.getUser()` on every navigation, which does a live network round-trip to Supabase's auth server on every click — this is the main source of felt lag in dev. The fix (swap to `getSession()`, which reads the session from the cookie locally with no network call) was scoped and explicitly deferred at the user's request until closer to production. RLS still protects all data regardless of which check is used. Note: `getUser()` is also the more *secure* of the two (it validates the JWT against Supabase rather than trusting an unverified local cookie), so this is a deliberate security/speed tradeoff to make consciously, not a pure cleanup.

**Known gotchas hit during development (avoid repeating):**
- **This project directory is on a slow/networked drive.** Next.js prints a "Slow filesystem detected" warning on every dev server start. Turbopack's dev cache has served visibly stale CSS/JS even across full server restarts here — if a change doesn't seem to take effect, stop the server, delete `.next`, and restart before assuming the code is wrong.
- **Don't concatenate an alpha-hex suffix onto a CSS `var()` reference** (e.g. `` `${color}66` `` where `color = "var(--color-accent)"`) — produces the invalid CSS token `var(--color-accent)66`, which browsers silently drop (no console error). Use `color-mix(in srgb, ${color} 40%, transparent)` instead. This bug silently killed the `ScoreRing` glow entirely for a while.
- **`filter: drop-shadow()` on a raw SVG element gets clipped** by the browser's default (small) SVG filter region, producing a visible square/rectangular cutoff around circular glows. Don't put glow effects directly on SVG elements — use a separate plain `<div>` with a `radial-gradient` background positioned behind the SVG instead.
- **`@supabase/auth-js` renders 5xx Auth API errors as the literal string `"{}"`** (see `src/lib/supabase/errors.ts` above) — never render `error.message` from a Supabase auth call directly to the user; always go through `friendlyAuthError()`.
- **Nonce-based CSP silently breaks static pages in production.** `src/proxy.ts` briefly used a per-request nonce + `'strict-dynamic'` on `script-src` (the "gold standard" CSP pattern). It worked perfectly in `next dev` but **completely broke all client-side interactivity on Vercel** — forms fell back to native HTML submission, no click handlers fired, zero console errors to hint why. Root cause: almost every route in this app (`next build` output confirms — only dynamic-segment routes like `/history/[id]` are server-rendered per request) is **statically pre-rendered at build time**, when no request/nonce exists yet, so the static HTML's `<script>` tags can never carry a nonce — but the proxy was still demanding a fresh one on every request. Fixed by dropping nonces in favor of `'self' 'unsafe-inline'` on `script-src` (Next's own documented fallback for apps using static generation); the rest of the CSP (connect-src scoping, frame-ancestors, object-src none) is untouched. **Always test CSP changes against a real `next build` + `next start` (or a deploy), never `next dev` alone** — dev mode renders everything per-request and hides this entire class of bug.
- **`next dev`'s hydration state can't be checked by reading input `.value`** — setting a DOM input's value via the native property setter + dispatching an `input` event (the standard way to drive a React-controlled input from outside React) succeeds regardless of whether React has hydrated yet, since it's just a raw DOM write. To actually confirm hydration completed, check `inputEl._valueTracker` (React attaches this only after hydrating a controlled input) rather than trusting that the value "stuck".
- The Supabase SQL editor (Monaco-based) corrupts pasted/typed multi-line SQL with auto-closing brackets when typed via automated keystroke simulation. If scripting SQL edits into it programmatically, set the Monaco model value directly via `window.monaco.editor.getModels()[0].setValue(sql)` rather than simulating keystrokes.
- The `react-hooks/set-state-in-effect` ESLint rule flags direct `setState` calls in a `useEffect` body (even for legitimate client-only-value patterns like reading `new Date()`). Wrap the call in `Promise.resolve().then(() => setState(...))` to satisfy it without changing behavior.
