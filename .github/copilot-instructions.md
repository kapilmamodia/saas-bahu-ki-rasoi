# Saas Bahu Ki Rasoi — Copilot Agent Instructions

## Project Identity
- **App:** Saas Bahu Ki Rasoi — home-cooked Indian restaurant web app
- **Tagline:** "Order Food For Any Mood"
- **Owners:** Rajeshwari Khandelwal (+91 99821 28866) · Veena Khandelwal (+91 98290 75457)
- **Services:** Individual orders · Kitty Party catering · Get Together catering
- **Spec file:** `spec.md` in the project root — single source of truth for all decisions

## Stack (never deviate without asking)
- Framework : Next.js 14 App Router (no Pages Router)
- Language  : TypeScript — strict mode, no `any`
- Styling   : Tailwind CSS only — no CSS Modules, no styled-components
- Database  : Supabase (Postgres + Auth + Storage)
- Payments  : Stripe Checkout Sessions
- Email     : Resend + React Email
- PDF       : @react-pdf/renderer
- Hosting   : Vercel
- CI/CD     : GitHub Actions → Vercel

## Brand — always apply to every UI component
### Colors (use these CSS variable names throughout)
- Background  : `#F5EDD6` (parchment cream)
- Card bg     : `#FDF6E3` (warm off-white)
- Nav/Footer  : `#3B1F0C` (espresso brown)
- Primary CTA : `#7B4A1E` (wood brown)  
- Hover/Badge : `#C0622A` (terracotta rust)
- Highlight   : `#D4A017` (turmeric gold)
- Sage accent : `#7A9E7E` (folk-art green)
- Text        : `#2C1A0E` headings · `#4A3728` body · `#8B6F5E` muted

### Fonts (Google Fonts — imported in app/layout.tsx)
- Hero headings  : Yatra One
- Section heads  : Playfair Display
- Body / UI text : Hind
- Badges/accents : Caveat

### UI feel
- Warm Indian home kitchen — NOT generic SaaS
- Buttons: rounded, wood-brown, terracotta on hover, subtle shadow
- Cards: cream bg, warm brown border
- Badges ("Today's Special", "Veg"): Caveat font, hand-stamp style
- Dividers: dot-dash pattern in gold
- Icons: Lucide React, tinted gold
- Loading shimmer: parchment tones, never grey

## Code Standards — apply to every file generated

### Comments
- Every file must have a top-of-file comment explaining its purpose
- Every function/component must have a JSDoc comment
- Every non-obvious line must have an inline comment
- Every Tailwind className block longer than 3 classes must have a comment above it

### TypeScript
- All props must have explicit interfaces defined in `types/index.ts`
- No implicit `any` — use `unknown` and narrow if needed
- Server Components by default; add `"use client"` only when hooks/events are needed

### Next.js patterns
- Data fetching in Server Components via Supabase server client
- Mutations via Server Actions (not API routes, unless Stripe/webhook)
- API routes only for: `/api/checkout`, `/api/webhook`, `/api/health`
- Use `loading.tsx` and `error.tsx` for every route segment
- Images via `next/image` always — never raw `<img>`

### Tailwind
- Never use arbitrary values `[...]` unless absolutely unavoidable
- Extract repeated class combos into a component — do not repeat 4+ classes inline
- Mobile-first: `sm:` `md:` `lg:` — every component must be responsive

### Supabase
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components
- Use `lib/supabase/server.ts` for server-side, `lib/supabase/client.ts` for client-side
- Price always stored and handled in **cents** (integers) — never floats for money

### Error handling
- Every async function must have a try/catch
- User-facing errors must show a friendly message (never expose raw error strings)
- Log errors server-side with `console.error("[context]", error)`

## Phase Workflow — how to work through the project

When the user says "implement Phase N":
1. Read the Phase N section in `spec.md` carefully before writing any code
2. List the files you will create/modify and ask for confirmation if Phase touches >5 files
3. Implement all files for that phase
4. Run the verification commands listed at the end of the phase
5. Report pass/fail clearly — do not silently continue if a check fails
6. Only mark the phase done when all verification checks pass

## File Structure — always respect this layout
```
app/              → Next.js App Router pages and API routes
components/       → Reusable UI components (menu/, cart/, admin/, invoice/, email/)
lib/              → Supabase, Stripe, Resend, invoice helpers
hooks/            → Custom React hooks (useCart, etc.)
types/            → index.ts — all shared TypeScript interfaces
public/           → Static assets (logo at logo-saas-bahu-ki-rasoi.png)
.github/
  workflows/      → ci.yml
  copilot-instructions.md   ← this file
```

