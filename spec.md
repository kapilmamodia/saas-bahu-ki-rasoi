# 🍽️ Saas Bahu Ki Rasoi — Restaurant Web App
### Project Specification v1.5

---

## 1. Overview

**App Name:** Saas Bahu Ki Rasoi
**Tagline:** *Order Food For Any Mood*
**Purpose:** A lightweight, full-stack web app for a home-cooked Indian food restaurant. Covers the full customer journey — browsing the menu, placing an order, paying, and receiving an invoice — plus an admin panel for the owner to manage items and pricing.
**Services:** Individual orders · Kitty Party catering · Get Together catering
**Contact:**
- Rajeshwari Khandelwal — +91 99821 28866
- Veena Khandelwal — +91 98290 75457
**Target Stack:** Next.js 14 (App Router) · Tailwind CSS · Vercel (hosting + CI/CD)
**Scope:** MVP that a solo operator can run from day one.

> **Agent note:** This spec is written to be executed end-to-end by a Claude agent using CLI tools (`git`, `gh`, `vercel`, `curl`). Every step includes the exact command or API call to run. Do not skip verification steps — each phase ends with a check before proceeding.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, server actions, API routes — all in one |
| Styling | Tailwind CSS | Utility-first, fast iteration, zero config |
| Database | Supabase (Postgres) | Free tier, real-time, Auth built-in |
| Auth | Supabase Auth | Admin login, session management |
| Payments | Stripe (Checkout Sessions) | Hosted checkout, no PCI scope |
| Email | Resend + React Email | Simple API, great deliverability, composable templates |
| PDF/Invoice | `@react-pdf/renderer` | Generate invoice PDFs in-browser or server-side |
| Deployment | Vercel | Zero-config Next.js deploy, preview URLs per PR |
| CI/CD | GitHub Actions + Vercel | Lint → Test → Preview → Production pipeline |


---

## 2b. Brand Identity & Design System

> **Agent:** Use this section to drive all UI decisions — colors, fonts, component style, and copy tone. The app should feel like a warm Indian home kitchen, not a generic SaaS product.

### Visual Inspiration
The brand logo (see uploaded asset) features:
- A **rustic wooden chopping board** as the hero frame
- **Rajasthani folk-art birds** (hand-painted, terracotta + sage green)
- **Wooden spoons** as decorative elements
- **Hand-lettered / chalk-style typography** — informal, warm, personal
- Background: **aged parchment / cream** with faint botanical line-art engravings
- Accent props: **spices, fresh herbs, a brass ghee bowl**

---

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg-primary:    #F5EDD6;   /* aged parchment / cream */
  --color-bg-card:       #FDF6E3;   /* warm off-white for cards */
  --color-bg-dark:       #3B1F0C;   /* deep espresso brown (nav, footer) */

  /* Brand */
  --color-brand-wood:    #7B4A1E;   /* warm mid-brown — primary CTA buttons */
  --color-brand-rust:    #C0622A;   /* terracotta rust — hover states, badges */
  --color-brand-gold:    #D4A017;   /* turmeric gold — highlights, icons, prices */

  /* Folk Art Accents */
  --color-folk-sage:     #7A9E7E;   /* muted sage green — bird wing, tags */
  --color-folk-terra:    #E07B39;   /* warm terracotta — bird body accent */

  /* Text */
  --color-text-primary:  #2C1A0E;   /* dark brown — headings */
  --color-text-body:     #4A3728;   /* medium brown — body copy */
  --color-text-muted:    #8B6F5E;   /* muted — captions, placeholders */
  --color-text-on-dark:  #F5EDD6;   /* parchment on dark backgrounds */
}
```

---

### Typography

```
Display / Hero headings  →  "Yatra One" (Google Fonts) — captures the hand-lettered,
                             Devanagari-influenced warmth of the logo

Section headings         →  "Playfair Display" — editorial warmth, serif personality

Body / UI text           →  "Hind" (Google Fonts) — clean, highly legible,
                             designed for Indian language contexts

Accent / Badges          →  "Caveat" — casual handwritten feel for taglines,
                             "Today's Special" banners, and chef's notes
```

Import in `app/layout.tsx`:
```typescript
import { Yatra_One, Playfair_Display, Hind, Caveat } from "next/font/google";
```

---

### UI Tone & Component Style

| Element | Style direction |
|---|---|
| Buttons (primary) | Rounded wood-brown, terracotta on hover, slight drop shadow |
| Cards (menu items) | Cream background, warm brown border, subtle parchment texture via CSS |
| Badges ("Today's Special", "Veg") | Hand-stamp look — `Caveat` font, rust or sage fill |
| Nav / Footer | Deep espresso brown (`--color-bg-dark`), parchment text |
| Dividers | Thin spice-line style — a dot-dash pattern in gold |
| Icons | Use Lucide React; tint with `--color-brand-gold` |
| Imagery | Food photos on slightly warm-tinted overlay to match palette |
| Loading states | Shimmer in parchment tones, not grey |

---

### Copy & Tone

- **Warm and personal** — written as if by the owners themselves
- Use Hindi words naturally where they add flavour: *rasoi* (kitchen), *ghar ka khana* (home food), *aaj ka special* (today's special)
- Tagline appears in hero and page titles: **"Order Food For Any Mood"**
- Catering CTA copy: **"Planning a Kitty Party or Get Together? We've got you covered."**
- Footer copy: **"Made with ❤️ in our rasoi — Rajeshwari & Veena Khandelwal"**

---

### Logo Usage

- Store the uploaded logo image at `public/logo-saas-bahu-ki-rasoi.png`
- Use in: navbar (left), hero section, email header, PDF invoice header
- Minimum display size: 120px wide; never stretch or recolour
- On dark backgrounds (nav/footer): add a subtle parchment-coloured glow or use a white-outlined variant

---

## 3. Core Features

### 3.1 Customer-Facing

#### Menu Page (`/menu`)
- Display all available items grouped by category (e.g., Starters, Mains, Desserts, Drinks)
- Each card shows: photo, name, description, price, dietary tags (veg / vegan / GF)
- Add to cart button; cart state persisted via `localStorage` + React context
- Items marked `out_of_stock = true` shown as greyed-out / unavailable

#### Today's Specials (`/` — Home Page)
- Hero section highlighting 1–3 daily specials set by admin
- Each special shows a badge ("Today Only"), photo, name, short story, and price
- CTA button: "Order Now" → scrolls to menu or adds directly to cart

#### Cart (`/cart`)
- Item list with quantity +/- controls and remove button
- Order subtotal, tax (configurable rate), and total
- "Proceed to Payment" → Stripe Checkout

#### Payment (Stripe Hosted Checkout)
- Stripe Checkout Session created via Next.js API route `/api/checkout`
- On success: redirect to `/order/confirmation?session_id=...`
- On cancel: redirect back to `/cart`

#### Order Confirmation & Invoice (`/order/confirmation`)
- Fetch order details from Stripe session and save to DB
- Display order summary (items, totals, order ID)
- Generate PDF invoice (customer name, order ID, itemized list, date, total)
- "Download Invoice" button
- Trigger confirmation email with invoice attached (via Resend)

#### Email — Order Confirmation
- Sent automatically after successful payment
- Template: order summary, itemized list, total paid, download link or PDF attachment
- Built with React Email for maintainability

---

### 3.2 Admin Panel (`/admin`)

**Access:** Protected route — Supabase Auth session required (email/password login)

#### Admin Login (`/admin/login`)
- Simple email + password form
- On success → redirect to `/admin/dashboard`

#### Dashboard (`/admin/dashboard`)
- Summary cards: total orders today, revenue today, most ordered item
- Recent orders table (last 20): order ID, customer email, total, status, timestamp

#### Menu Management (`/admin/menu`)
- Table of all menu items with inline or modal editing
- **Add item:** name, description, category, price, photo upload (stored in Supabase Storage), dietary tags, in-stock toggle
- **Edit item:** update any field, change price, toggle availability
- **Delete item:** soft delete (hidden from menu, preserved in order history)
- **Today's Specials:** toggle any item as a special; set a "special note" (short story / origin of dish)

#### Pricing (`/admin/menu`)
- Price field editable inline or via modal
- Changes reflected immediately on the customer menu

---

## 4. Data Model (Supabase / Postgres)

```sql
-- Categories
categories(id, name, sort_order)

-- Menu Items
menu_items(
  id, category_id, name, description,
  price_cents, photo_url,
  is_veg, is_vegan, is_gf,
  is_available, is_special, special_note,
  created_at, updated_at, deleted_at
)

-- Orders
orders(
  id, stripe_session_id, customer_email, customer_name,
  status,           -- pending | paid | refunded
  subtotal_cents, tax_cents, total_cents,
  invoice_url,      -- Supabase Storage URL for generated PDF
  created_at
)

-- Order Line Items
order_items(
  id, order_id, menu_item_id,
  item_name,        -- snapshot at time of order
  item_price_cents, -- snapshot at time of order
  quantity
)
```

---

## 5. Page / Route Map

```
/                          → Home (Today's Specials + hero)
/menu                      → Full menu
/cart                      → Cart review
/api/checkout              → POST: create Stripe session
/api/webhook               → POST: Stripe webhook (mark order paid)
/order/confirmation        → Post-payment confirmation + invoice
/admin/login               → Admin auth
/admin/dashboard           → Orders overview
/admin/menu                → Menu CRUD + specials + pricing
/admin/menu/new            → Add new item
/admin/menu/[id]/edit      → Edit existing item
```

---

## 6. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=
EMAIL_FROM=orders@yourdomain.com

# App
NEXT_PUBLIC_BASE_URL=https://saas-bahu-ki-rasoi.vercel.app
TAX_RATE=0.08   # 8% — change to your rate
```

---

## 7. Project Structure

```
/
├── app/
│   ├── page.tsx                  # Home / Specials
│   ├── menu/page.tsx
│   ├── cart/page.tsx
│   ├── order/confirmation/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── menu/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   └── api/
│       ├── checkout/route.ts
│       └── webhook/route.ts
├── components/
│   ├── menu/MenuGrid.tsx
│   ├── menu/MenuCard.tsx
│   ├── cart/CartDrawer.tsx
│   ├── invoice/InvoiceTemplate.tsx
│   ├── email/OrderConfirmation.tsx
│   └── admin/ItemForm.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── stripe.ts
│   ├── resend.ts
│   └── invoice.ts
├── hooks/
│   └── useCart.ts
├── types/
│   └── index.ts
├── .github/
│   └── workflows/ci.yml
└── .env.local
```

---

## 8. Non-Functional Requirements

| Concern | Decision |
|---|---|
| Auth security | Admin routes protected via Supabase middleware; service role key never exposed client-side |
| Payment security | All Stripe secret ops server-side only; webhook verified with `STRIPE_WEBHOOK_SECRET` |
| Image storage | Supabase Storage (public bucket for menu photos, private for invoices) |
| Performance | Static menu page with ISR (revalidate every 60s) |
| Mobile | Tailwind responsive design; cart works on phone |
| Accessibility | Semantic HTML, ARIA labels on interactive elements, contrast-checked colors |

---

## 9. Out of Scope (MVP)

- Online table reservations
- Loyalty / rewards program
- Multi-location support
- SMS notifications
- Inventory / stock count tracking
- Customer accounts / order history portal
- Discount codes / coupons

---

## 10. CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --passWithNoTests
      - run: npm run build
```

### Vercel Behaviour

| Event | Behaviour |
|---|---|
| Push to feature branch | Vercel Preview Deploy — unique URL per commit |
| PR opened / updated | Preview URL posted as PR comment |
| Merge to `main` | Auto-deploy to Production |
| Failed CI | Deploy blocked by branch protection on `main` |

---

## 11. Implementation Phases

| Phase | What to build |
|---|---|
| **0 — Repo & Infra Bootstrap** | GitHub repo, Vercel project, linked together, skeleton app deployed ✅ |
| **1 — Foundation** | Next.js + Tailwind + Supabase init, DB schema, env config |
| **2 — Menu + Home** | Seed DB, menu page, home/specials page, cart context |
| **3 — Checkout** | Stripe integration, `/api/checkout`, `/api/webhook`, confirmation page |
| **4 — Invoice + Email** | PDF generation, Resend email with attachment |
| **5 — Admin Panel** | Auth, dashboard, full menu CRUD, specials toggle, pricing |
| **6 — CI/CD** | GitHub Actions workflow, Vercel branch protection, preview deploys |
| **7 — Polish** | Responsive QA, empty states, loading skeletons, error boundaries |

---

## 12. Phase 0 — GitHub Repo + Vercel Setup (Agent-Executable)

> **Agent:** Execute every numbered step in order. After each ✅ VERIFY block, confirm the check passes before continuing. If a check fails, fix it before moving to the next step. Never skip a verification.

### Prerequisites (confirm before starting)

```
- [ ] Node.js 20+ installed  →  node --version
- [ ] Git installed           →  git --version
- [ ] GitHub CLI installed    →  gh --version        (install: https://cli.github.com)
- [ ] Vercel CLI installed    →  vercel --version    (install: npm i -g vercel)
- [ ] Logged into GitHub CLI  →  gh auth status
- [ ] Logged into Vercel CLI  →  vercel whoami
```

If any are missing, install/authenticate them first.

---

### Step 1 — Scaffold the Next.js app locally

```bash
# Create project with Next.js 14, TypeScript, Tailwind, App Router, no src/ dir
npx create-next-app@14 saas-bahu-ki-rasoi \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd saas-bahu-ki-rasoi
```

✅ **VERIFY:** `ls` shows `app/`, `package.json`, `tailwind.config.ts` in the project root.

---

### Step 2 — Add a health-check route (used for deployment verification later)

Create file `app/api/health/route.ts`:

```typescript
// Simple health endpoint — returns 200 + timestamp so the agent can
// confirm the deployed app is alive without needing real credentials.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", ts: new Date().toISOString() });
}
```

✅ **VERIFY locally:**
```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/api/health
# Expected: {"status":"ok","ts":"..."}
kill %1
```

---

### Step 3 — Initialise Git and make the first commit

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 app with health check"
```

✅ **VERIFY:** `git log --oneline` shows exactly one commit.

---

### Step 4 — Create the GitHub repository

```bash
# Creates a PUBLIC repo named homemade under the authenticated GitHub account.
# Change --public to --private if preferred.
gh repo create saas-bahu-ki-rasoi \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "Saas Bahu Ki Rasoi — home-cooked Indian restaurant web app"
```

✅ **VERIFY:**
```bash
gh repo view saas-bahu-ki-rasoi --json nameWithOwner,url
# Expected: JSON with "nameWithOwner" and a github.com URL
git remote -v
# Expected: origin pointing to the new GitHub repo
```

---

### Step 5 — Link the repo to a new Vercel project

```bash
# --yes accepts all defaults (framework auto-detected as Next.js)
# This creates the Vercel project and writes .vercel/project.json
vercel link --yes
```

✅ **VERIFY:**
```bash
cat .vercel/project.json
# Expected: JSON containing "projectId" and "orgId"
```

---

### Step 6 — Set environment variables in Vercel

Run this block once per variable. Replace placeholder values with real ones before executing.

```bash
# ── Supabase ──────────────────────────────────────────────
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://YOUR_PROJECT.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "YOUR_ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "YOUR_SERVICE_ROLE_KEY"

# ── Stripe ────────────────────────────────────────────────
vercel env add STRIPE_SECRET_KEY production <<< "sk_live_..."
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "pk_live_..."
vercel env add STRIPE_WEBHOOK_SECRET production <<< "whsec_..."

# ── Resend ────────────────────────────────────────────────
vercel env add RESEND_API_KEY production <<< "re_..."
vercel env add EMAIL_FROM production <<< "orders@yourdomain.com"

# ── App config ────────────────────────────────────────────
vercel env add NEXT_PUBLIC_BASE_URL production <<< "https://saas-bahu-ki-rasoi.vercel.app"
vercel env add TAX_RATE production <<< "0.08"
```

> **Note for agent:** `NEXT_PUBLIC_BASE_URL` cannot be set to the final URL until after Step 7 reveals the production domain. Set it to a placeholder now; update it in Step 8.

✅ **VERIFY:**
```bash
vercel env ls production
# Expected: all 10 variables listed
```

---

### Step 7 — Deploy to production

```bash
# --prod deploys to the production URL (not a preview)
vercel --prod --yes
```

✅ **VERIFY (deployment succeeded):**
```bash
# Capture the production URL from Vercel
PROD_URL=$(vercel inspect --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('alias',[''])[0] or d['url'])" 2>/dev/null || vercel ls --json 2>/dev/null | python3 -c "import sys,json; projects=json.load(sys.stdin); print(projects[0]['url'])" 2>/dev/null)

# Fallback: read URL from the vercel deploy output directly — it prints "Production: https://..."
# If automation fails, set manually:
# PROD_URL="homemade.vercel.app"

echo "Production URL: $PROD_URL"
```

---

### Step 8 — Verify the live app responds

```bash
# Health check against the production deployment
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://${PROD_URL}/api/health")
BODY=$(curl -s "https://${PROD_URL}/api/health")

echo "HTTP status : $HTTP_STATUS"
echo "Response    : $BODY"

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Production app is LIVE and healthy"
else
  echo "❌ Health check failed — investigate Vercel deployment logs"
  vercel logs --prod
  exit 1
fi
```

✅ **VERIFY:** Output shows `HTTP status : 200` and `{"status":"ok","ts":"..."}`.

---

### Step 9 — Update NEXT_PUBLIC_BASE_URL with the real domain

```bash
# Remove the placeholder and set the real URL
vercel env rm NEXT_PUBLIC_BASE_URL production --yes
vercel env add NEXT_PUBLIC_BASE_URL production <<< "https://${PROD_URL}"

# Redeploy so the env var takes effect in the build
vercel --prod --yes
```

✅ **VERIFY:**
```bash
curl -s "https://${PROD_URL}/api/health"
# Expected: {"status":"ok","ts":"..."} — confirms redeploy succeeded
```

---

### Step 10 — Connect GitHub → Vercel for automatic deploys

```bash
# Retrieve Vercel project and org IDs
PROJECT_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['projectId'])")
ORG_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['orgId'])")

echo "Project ID : $PROJECT_ID"
echo "Org ID     : $ORG_ID"
```

Add the following secrets to the GitHub repo so GitHub Actions can trigger Vercel deploys:

```bash
# Retrieve your Vercel token — must be set as an env var beforehand:
# export VERCEL_TOKEN="your_vercel_personal_access_token"

gh secret set VERCEL_TOKEN    --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID   --body "$ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$PROJECT_ID"
```

✅ **VERIFY:**
```bash
gh secret list
# Expected: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID all listed
```

---

### Step 11 — Add GitHub Actions CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --passWithNoTests

      - name: Build
        run: npm run build

  deploy-preview:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref != 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Preview to Vercel
        run: |
          npm i -g vercel
          vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Production to Vercel
        run: |
          npm i -g vercel
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

Commit and push:

```bash
git add .github/workflows/ci.yml app/api/health/route.ts
git commit -m "ci: add GitHub Actions CI/CD workflow and health check"
git push origin main
```

✅ **VERIFY:**
```bash
# Wait ~60 seconds then check the workflow ran
gh run list --limit 5
# Expected: most recent run shows "completed" with conclusion "success"

gh run view --log --exit-status $(gh run list --json databaseId --limit 1 -q '.[0].databaseId')
# Expected: all steps green, no errors
```

---

### Step 12 — Enable branch protection on `main`

```bash
# Requires the repo owner to have admin rights.
# This blocks any direct push to main unless CI passes.
gh api repos/{owner}/saas-bahu-ki-rasoi/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null
```

✅ **VERIFY:**
```bash
gh api repos/{owner}/saas-bahu-ki-rasoi/branches/main/protection \
  --jq '.required_status_checks.contexts'
# Expected: ["ci"]
```

---

### Step 13 — End-to-end smoke test (final gate)

```bash
echo "=== Final Deployment Smoke Test ==="

# 1. Home page returns 200
HOME_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://${PROD_URL}/")
echo "Home page     : $HOME_STATUS"

# 2. Menu page returns 200
MENU_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://${PROD_URL}/menu")
echo "Menu page     : $MENU_STATUS"

# 3. Health endpoint returns 200 with correct JSON
HEALTH_BODY=$(curl -s "https://${PROD_URL}/api/health")
HEALTH_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://${PROD_URL}/api/health")
echo "Health check  : $HEALTH_STATUS — $HEALTH_BODY"

# 4. Admin login page returns 200
ADMIN_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://${PROD_URL}/admin/login")
echo "Admin login   : $ADMIN_STATUS"

# Evaluate
if [ "$HOME_STATUS" = "200" ] && [ "$HEALTH_STATUS" = "200" ]; then
  echo ""
  echo "✅ ALL CHECKS PASSED — App is live at https://${PROD_URL}"
  echo "✅ GitHub repo  : $(gh repo view --json url -q .url)"
  echo "✅ CI/CD        : GitHub Actions → Vercel connected"
  echo "✅ Branch guard : main protected, CI required to merge"
  echo ""
  echo "Phase 0 complete. Proceed to Phase 1 — Foundation."
else
  echo "❌ One or more checks failed. Review Vercel logs before continuing."
  vercel logs --prod
  exit 1
fi
```

---

### Phase 0 Completion Checklist

```
[ ] GitHub repo created and code pushed
[ ] Vercel project created and linked to GitHub repo
[ ] All environment variables set in Vercel (production)
[ ] First production deploy succeeded
[ ] /api/health returns 200 on production URL
[ ] GitHub Actions CI workflow runs and passes on main
[ ] Automatic Vercel deploys triggered by GitHub pushes
[ ] Branch protection on main — CI required before merge
[ ] Smoke test: home, menu, health, admin pages all return 200
```

Only proceed to Phase 1 when every box above is checked.


---

## 13. `.github/copilot-instructions.md` — Persistent Agent Context

> **Agent:** Create this file at `.github/copilot-instructions.md` in the repo root during Phase 0 Step 3 (before the first commit). Copilot Agent Mode reads this file automatically at the start of every session — it means you never lose project context between conversations.

Create the file with exactly this content:

```markdown
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

### Stripe
- All Stripe secret operations server-side only
- Always verify webhook signature with `STRIPE_WEBHOOK_SECRET`
- Store price snapshots on `order_items` at time of purchase

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

## Prompting tips for this project
- "Implement Phase N from spec.md" → full phase implementation
- "Create the [component name] component" → single component with full comments
- "Fix the failing verification in Phase N" → targeted debug
- "Show me the current state of Phase N checklist" → progress report

## What NOT to do
- Do not use Pages Router (`pages/` directory)
- Do not use CSS Modules or styled-components
- Do not use `getServerSideProps` or `getStaticProps` (App Router only)
- Do not hardcode prices — always read from DB
- Do not store money as floats — always cents
- Do not use `<img>` — always `next/image`
- Do not skip the ✅ VERIFY steps at the end of each phase
- Do not expose secret keys in client components
- Do not proceed to the next phase if the current phase's checks fail
```

> **After creating this file**, add it to the first commit in Step 3:
> ```bash
> git add .github/copilot-instructions.md
> git commit -m "chore: scaffold Next.js app, health check, and Copilot agent instructions"
> ```

---

*Generated: May 2026 · v1.5 — includes agent-executable GitHub + Vercel bootstrap with full verification*

---

## Phase 1 — Foundation

> **Agent:** Run every step in order. Do not start Phase 2 until the checklist at the bottom is fully checked.

### Step 1 — Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @supabase/auth-helpers-nextjs
npm install -D supabase
```

✅ **VERIFY:** `cat package.json | grep supabase` shows the packages.

---

### Step 2 — Create Supabase client helpers

Create `lib/supabase/client.ts`:
```typescript
// Browser-side Supabase client — used in Client Components only.
// Never import this in Server Components or API routes.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `lib/supabase/server.ts`:
```typescript
// Server-side Supabase client — used in Server Components, Server Actions, API routes.
// Reads cookies for session — never call this in a Client Component.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

✅ **VERIFY:** Both files exist, TypeScript compiles — `npx tsc --noEmit`

---

### Step 3 — Create shared TypeScript types

Create `types/index.ts` with all interfaces:
```typescript
// ─── Category ────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

// ─── Menu Item ───────────────────────────────────────────────
export interface MenuItem {
  id: string;
  category_id: string;
  category?: Category;
  name: string;
  description: string;
  price_cents: number;       // always cents — never floats for money
  photo_url: string | null;
  is_veg: boolean;
  is_vegan: boolean;
  is_gf: boolean;
  is_available: boolean;
  is_special: boolean;
  special_note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // soft delete — null means active
}

// ─── Order ───────────────────────────────────────────────────
export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name: string;
  status: "pending" | "paid" | "refunded";
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  invoice_url: string | null;
  created_at: string;
}

// ─── Order Line Item ─────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;         // snapshot at purchase time
  item_price_cents: number;  // snapshot at purchase time
  quantity: number;
}

// ─── Cart ────────────────────────────────────────────────────
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalCents: number;
  itemCount: number;
}
```

✅ **VERIFY:** `npx tsc --noEmit` — no type errors.

---

### Step 4 — Run Supabase schema migration

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Categories ──────────────────────────────────────────────
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  sort_order integer not null default 0
);

-- ─── Menu Items ──────────────────────────────────────────────
create table menu_items (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid references categories(id) on delete set null,
  name         text not null,
  description  text not null default '',
  price_cents  integer not null check (price_cents >= 0),
  photo_url    text,
  is_veg       boolean not null default false,
  is_vegan     boolean not null default false,
  is_gf        boolean not null default false,
  is_available boolean not null default true,
  is_special   boolean not null default false,
  special_note text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz                          -- null = active (soft delete)
);

-- ─── Orders ──────────────────────────────────────────────────
create table orders (
  id                uuid primary key default uuid_generate_v4(),
  stripe_session_id text unique not null,
  customer_email    text not null,
  customer_name     text not null default '',
  status            text not null default 'pending'
                      check (status in ('pending','paid','refunded')),
  subtotal_cents    integer not null,
  tax_cents         integer not null,
  total_cents       integer not null,
  invoice_url       text,
  created_at        timestamptz not null default now()
);

-- ─── Order Items ─────────────────────────────────────────────
create table order_items (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid references orders(id) on delete cascade,
  menu_item_id     uuid references menu_items(id) on delete set null,
  item_name        text not null,    -- price snapshot
  item_price_cents integer not null, -- price snapshot
  quantity         integer not null check (quantity > 0)
);

-- ─── Seed: default categories ────────────────────────────────
insert into categories (name, sort_order) values
  ('Starters',  1),
  ('Mains',     2),
  ('Breads',    3),
  ('Rice',      4),
  ('Desserts',  5),
  ('Drinks',    6);

-- ─── Seed: sample menu items ─────────────────────────────────
insert into menu_items (category_id, name, description, price_cents, is_veg, is_special, special_note)
select id, 'Dal Makhani',
  'Slow-cooked black lentils in a rich tomato-butter gravy. Nani ki recipe.',
  32000, true, true, 'Simmered overnight — just like home'
from categories where name = 'Mains';

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Aloo Tikki', 'Crispy spiced potato patties with mint chutney.', 15000, true
from categories where name = 'Starters';

insert into menu_items (category_id, name, description, price_cents, is_veg)
select id, 'Gulab Jamun', 'Soft milk-solid dumplings in rose-scented sugar syrup.', 12000, true
from categories where name = 'Desserts';
```

Apply the migration:
```bash
npx supabase db push
```

✅ **VERIFY:** Log into Supabase dashboard → Table Editor → confirm `categories`, `menu_items`, `orders`, `order_items` tables exist with seed data.

---

### Step 5 — Add Supabase middleware for admin route protection

Create `middleware.ts` at project root:
```typescript
// Runs on every request — refreshes Supabase auth session and
// redirects unauthenticated users away from /admin routes.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access /admin (except login page)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !user
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

✅ **VERIFY:** `npx tsc --noEmit` — no errors.

---

### Phase 1 Checklist
```
[ ] Supabase client helpers created (client.ts + server.ts)
[ ] All TypeScript types defined in types/index.ts
[ ] DB schema applied — all 4 tables visible in Supabase dashboard
[ ] Seed data present — categories and sample menu items
[ ] Middleware protecting /admin routes
[ ] npx tsc --noEmit passes
[ ] npm run build passes
```

---

## Phase 2 — Menu + Home Page

> **Agent:** Build the customer-facing pages. No auth needed here — all public routes.

### Step 1 — Cart context (global state)

Create `hooks/useCart.ts`:
```typescript
"use client";
// Global cart state using React Context + localStorage persistence.
// Wrap the app in <CartProvider> in app/layout.tsx.
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, CartState, MenuItem } from "@/types";

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Rehydrate cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sbkr_cart");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem("sbkr_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.menuItem.id !== id));

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((i) => (i.menuItem.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalCents = items.reduce(
    (sum, i) => sum + i.menuItem.price_cents * i.quantity, 0
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCents, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
```

---

### Step 2 — Root layout with fonts, brand colors, cart provider

Update `app/layout.tsx` with Google Fonts import, brand CSS variables, and CartProvider wrapper.

---

### Step 3 — Home page (Today's Specials)

Create `app/page.tsx`:
- Fetches `menu_items` where `is_special = true` and `deleted_at IS NULL` from Supabase server client
- Renders a hero section with the restaurant logo, name, and tagline *"Order Food For Any Mood"*
- Below hero: grid of special item cards each showing photo, name, special_note, price, and "Add to Cart" button
- If no specials set, show a warm placeholder message: *"Check back soon for today's specials!"*

---

### Step 4 — Menu page

Create `app/menu/page.tsx`:
- Fetches all available `menu_items` (`is_available = true`, `deleted_at IS NULL`) joined with `categories`, ordered by `category.sort_order`
- Groups items by category
- Renders sticky category nav tabs at the top
- Each item rendered via `components/menu/MenuCard.tsx`

Create `components/menu/MenuCard.tsx`:
- Shows photo (next/image), name, description, dietary badges (Veg 🟢 / Vegan 🌿 / GF), price in ₹
- "Add to Cart" button — calls `useCart().addItem()`
- Greyed out with "Unavailable" overlay when `is_available = false`

---

### Step 5 — Cart page

Create `app/cart/page.tsx`:
- Lists cart items with quantity +/- controls and remove (×) button
- Shows subtotal, tax (TAX_RATE env var), and total — all in ₹
- "Proceed to Payment" button → POST to `/api/checkout`
- Empty cart state: warm illustration + "Your cart is empty — browse the menu"

✅ **VERIFY:**
```bash
npm run dev &
sleep 5
# Home page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# Menu page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/menu
# Cart page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/cart
kill %1
```
All three return `200`.

### Phase 2 Checklist
```
[ ] CartProvider wraps app in layout.tsx
[ ] Cart persists in localStorage across page refreshes
[ ] Home page shows today's specials fetched from Supabase
[ ] Menu page shows all available items grouped by category
[ ] Dietary badges render correctly (Veg / Vegan / GF)
[ ] Add to Cart works — cart icon shows item count
[ ] Cart page shows items, quantities, subtotal, tax, total
[ ] All pages mobile responsive
[ ] npm run build passes
```

---

## Phase 3 — Checkout + Payment

> **STATUS (May 2026):** Phase 3 is implemented with a **mock payment flow** for end-to-end testing.
> Real Stripe integration is deferred — see **"Phase 3b — Stripe Integration"** below for the exact
> upgrade steps when you are ready to go live.

---

### Phase 3 (Current) — Mock Payment Flow ✅ DONE

All files are implemented and `npm run build` passes. The mock flow works end-to-end:

```
Cart → fill Name + Email → "Proceed to Payment"
  → POST /api/checkout  (saves pending order to Supabase)
  → /order/confirmation?session_id=mock_xxx
  → "Confirm & Pay (Mock)" button
  → POST /api/mock-confirm  (marks order as paid)
  → Page refreshes → "Payment Confirmed! 🎉"
```

**Files currently in place:**

| File | Role |
|---|---|
| `app/api/checkout/route.ts` | Saves pending order, returns confirmation URL |
| `app/api/mock-confirm/route.ts` | Marks order as paid (mock webhook replacement) |
| `app/api/webhook/route.ts` | Stub — returns 200 (real Stripe impl goes here) |
| `app/order/confirmation/page.tsx` | Server Component — fetches & displays order |
| `app/order/confirmation/MockPayButton.tsx` | Client Component — "Confirm & Pay" button |
| `app/order/confirmation/loading.tsx` | Parchment shimmer skeleton |
| `app/order/confirmation/error.tsx` | Friendly error with contact numbers |

### Phase 3 Mock Checklist ✅
```
[x] /api/checkout saves pending order to Supabase and returns confirmation URL
[x] /api/mock-confirm marks order as "paid" in DB
[x] /api/webhook stub returns 200
[x] Order confirmation page displays correct order details
[x] "Confirm & Pay (Mock)" button works end-to-end
[x] npm run build passes
```

---

## Phase 3b — Real Stripe Integration (TODO — do this before going live)

> **Agent:** Run every step in order. Do not start Phase 4 production deploy until all checks pass.
> All Stripe secret operations must be server-side only — never expose STRIPE_SECRET_KEY in a client component.

### Step 1 — Install Stripe SDK
```bash
npm install stripe @stripe/stripe-js
```

✅ **VERIFY:** `cat package.json | grep stripe` shows both packages.

---

### Step 2 — Create the Stripe helper

Create `lib/stripe.ts`:
```typescript
// Server-side Stripe instance — import only in API routes and Server Actions.
// NEVER import this in Client Components.
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});
```

✅ **VERIFY:** `npx tsc --noEmit` — no errors.

---

### Step 3 — Replace the mock checkout route

Replace `app/api/checkout/route.ts` with real Stripe Checkout Session creation.

Key changes from the mock version:
- Import `stripe` from `lib/stripe.ts`
- Replace the `mockSessionId` block with a real `stripe.checkout.sessions.create()` call
- Map `items` to Stripe `line_items` (price in smallest currency unit — paise)
- Set `success_url` → `${NEXT_PUBLIC_BASE_URL}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`
- Set `cancel_url` → `${NEXT_PUBLIC_BASE_URL}/cart`
- Save the real `session.id` to Supabase as `stripe_session_id`
- Return `{ url: session.url }` — the Stripe-hosted checkout page URL

```typescript
// Replace the mock session block in app/api/checkout/route.ts with:
import { stripe } from "@/lib/stripe";

const session = await stripe.checkout.sessions.create({
  mode: "payment",
  customer_email: customerEmail,
  line_items: items.map((i) => ({
    price_data: {
      currency: "inr",
      unit_amount: i.menuItem.price_cents, // already in paise
      product_data: {
        name: i.menuItem.name,
        description: i.menuItem.description ?? undefined,
        images: i.menuItem.photo_url ? [i.menuItem.photo_url] : [],
      },
    },
    quantity: i.quantity,
  })),
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
  metadata: { customerName: customerName || "Guest" },
});

// Use session.id as the stripe_session_id when inserting to Supabase
// Return: { url: session.url }
```

✅ **VERIFY (Stripe test mode):**
```bash
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItem":{"id":"test","name":"Dal Makhani","price_cents":32000,"description":"","photo_url":null,"is_veg":true,"is_vegan":false,"is_gf":false,"is_available":true,"is_special":false,"special_note":null,"category_id":"","created_at":"","updated_at":"","deleted_at":null},"quantity":1}],"customerEmail":"test@test.com","customerName":"Test User"}' \
  | grep -i "url\|error"
# Expected: {"url":"https://checkout.stripe.com/..."}
```

---

### Step 4 — Implement the real webhook

Replace the stub in `app/api/webhook/route.ts` with full Stripe signature verification:

```typescript
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text(); // must be raw text for signature verification
  const sig = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const supabase = createAdminClient();

    // Mark order as paid
    const { error } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("stripe_session_id", session.id);

    if (error) {
      console.error("[webhook] Failed to update order:", error);
      // Still return 200 so Stripe doesn't retry — investigate manually
    }

    // TODO (Phase 4): trigger invoice PDF generation + email here
    // generateAndSendInvoice(session.id)  ← async, fire-and-forget
  }

  return NextResponse.json({ received: true }); // always 200
}
```

The `export const config` for raw body parsing (required for Stripe):
```typescript
export const config = {
  api: { bodyParser: false }, // Next.js App Router reads raw body via request.text()
};
```

✅ **VERIFY (Stripe CLI):**
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/webhook
# In another terminal, trigger a test event:
stripe trigger checkout.session.completed
# Expected: webhook logs show "200 OK" and order status updates to "paid" in Supabase
```

---

### Step 5 — Remove mock files

Once real Stripe is verified end-to-end:
```bash
# Delete the mock-only files
rm app/api/mock-confirm/route.ts
rm app/order/confirmation/MockPayButton.tsx
```

Update `app/order/confirmation/page.tsx`:
- Remove the `<MockPayButton>` component import and usage
- The page now shows purely read-only order data (Stripe already handled payment)
- Enable the "Download Invoice" button (wired in Phase 4)

---

### Step 6 — Set up Stripe webhook in production

```bash
# Register the production webhook in the Stripe dashboard:
# Dashboard → Developers → Webhooks → Add endpoint
# URL: https://saas-bahu-ki-rasoi.vercel.app/api/webhook
# Events to listen: checkout.session.completed, checkout.session.expired

# Update the Vercel env var with the real webhook secret:
vercel env rm STRIPE_WEBHOOK_SECRET production --yes
vercel env add STRIPE_WEBHOOK_SECRET production <<< "whsec_..."
```

✅ **VERIFY end-to-end with Stripe test card:**
- Use card number `4242 4242 4242 4242` · any future expiry · any CVC
- Place a test order — confirm Stripe redirects to `/order/confirmation`
- Check Supabase `orders` table — `status = paid`
- Check Vercel logs — webhook received and processed

---

### Phase 3b Checklist (Real Stripe)
```
[ ] stripe + @stripe/stripe-js installed
[ ] lib/stripe.ts created
[ ] /api/checkout creates real Stripe session and returns session.url
[ ] /api/webhook verifies Stripe signature
[ ] checkout.session.completed marks order as "paid" in Supabase
[ ] app/api/mock-confirm/route.ts deleted
[ ] app/order/confirmation/MockPayButton.tsx deleted
[ ] Stripe webhook registered in production dashboard
[ ] STRIPE_WEBHOOK_SECRET set in Vercel production env
[ ] End-to-end test with card 4242 4242 4242 4242 passes
[ ] npm run build passes
```

---

## Phase 4 — Invoice + Email

> **Agent:** PDF is generated server-side and stored in Supabase Storage. Email is sent via Resend immediately after a successful webhook event.

### Step 1 — Install packages
```bash
npm install @react-pdf/renderer resend react-email
```

### Step 2 — Invoice PDF template

Create `components/invoice/InvoiceTemplate.tsx`:
- React PDF document component
- Header: restaurant logo + name "Saas Bahu Ki Rasoi" + tagline
- Customer name, order ID, date
- Itemized table: item name | qty | unit price | line total
- Subtotal, tax, total
- Footer: "Rajeshwari & Veena Khandelwal — Made with ❤️"
- Brand colors: espresso brown headings, parchment background, gold accents

### Step 3 — Invoice generation helper

Create `lib/invoice.ts`:
- `generateInvoicePdf(order, orderItems)` → returns a `Buffer` of the PDF
- Upload the buffer to Supabase Storage bucket `invoices` (private)
- Return the signed URL (valid 1 year)
- Update the `orders` row with `invoice_url`

### Step 4 — Email template

Create `components/email/OrderConfirmation.tsx`:
- React Email component
- Brand-colored header with restaurant name
- Order summary: items, quantities, total
- "Download Invoice" button linking to the signed invoice URL
- Contact info: Rajeshwari +91 99821 28866 · Veena +91 98290 75457

### Step 5 — Wire into webhook

Update `app/api/webhook/route.ts`:
- After marking order as `paid`, call `generateInvoicePdf()` then send email via Resend
- Do this asynchronously — don't block the webhook 200 response

### Step 6 — Wire Download Invoice button

Update `app/order/confirmation/page.tsx`:
- Enable the "Download Invoice" button using the `invoice_url` from the order

✅ **VERIFY:**
- Place a test order using Stripe test card `4242 4242 4242 4242`
- Check Supabase `orders` table — status = `paid`, `invoice_url` populated
- Check the email inbox — confirmation email received with PDF attached

### Phase 4 Checklist
```
[ ] PDF invoice generates with correct order details
[ ] Invoice uploaded to Supabase Storage
[ ] invoice_url saved to orders table
[ ] Confirmation email sent via Resend after payment
[ ] Email contains itemized order + download link
[ ] Download Invoice button works on confirmation page
[ ] npm run build passes
```

---

## Phase 5 — Admin Panel

> **Agent:** All admin routes are protected by the middleware from Phase 1. Use Supabase Auth for login.

### Step 1 — Admin login page

Create `app/admin/login/page.tsx`:
- Email + password form (no `<form>` tag — use `onClick` handler)
- Calls `supabase.auth.signInWithPassword()`
- On success → redirect to `/admin/dashboard`
- On error → show "Invalid email or password" in terracotta red
- Brand-styled: espresso brown card, parchment background

### Step 2 — Create admin user in Supabase

```
Agent instruction: Tell the user to manually create the admin account:
  1. Go to Supabase dashboard → Authentication → Users
  2. Click "Add user"
  3. Enter email and a strong password
  4. This is the only admin account needed for MVP
```

### Step 3 — Admin dashboard

Create `app/admin/dashboard/page.tsx`:
- Server Component — fetches stats from Supabase using service role client
- Summary cards: orders today, revenue today (in ₹), most popular item
- Recent orders table (last 20): order ID, customer name, email, total, status, date
- Logout button → calls `supabase.auth.signOut()` → redirect to `/admin/login`

### Step 4 — Menu management page

Create `app/admin/menu/page.tsx`:
- Table of all menu items (including unavailable, excluding soft-deleted)
- Columns: photo thumbnail, name, category, price, Veg/Vegan/GF, Available toggle, Special toggle, Edit, Delete
- "Add New Item" button → `/admin/menu/new`

### Step 5 — Add / Edit item form

Create `components/admin/ItemForm.tsx`:
- Fields: name, description, category (dropdown), price (in ₹ — convert to cents on save), photo upload, Veg/Vegan/GF toggles, Available toggle, Special toggle, special note textarea
- Photo upload → Supabase Storage `menu-photos` bucket → save public URL
- Validation: name required, price must be > 0
- Submit → Server Action → upsert to `menu_items`

Create `app/admin/menu/new/page.tsx` → renders `<ItemForm />`
Create `app/admin/menu/[id]/edit/page.tsx` → fetches item, renders `<ItemForm defaultValues={item} />`

### Step 6 — Delete (soft delete)

On delete button click → Server Action sets `deleted_at = now()` on the item.
Item disappears from the customer menu but order history is preserved.

✅ **VERIFY:**
- Log in at `/admin/login` with the Supabase user created in Step 2
- Add a new menu item — confirm it appears on `/menu`
- Toggle it as Today's Special — confirm it appears on home page
- Change the price — confirm new price shows on menu
- Toggle unavailable — confirm it shows as greyed out on menu
- Delete it — confirm it disappears from menu but still exists in DB

### Phase 5 Checklist
```
[ ] /admin/login authenticates correctly
[ ] Unauthenticated users redirected from /admin/* to /admin/login
[ ] Dashboard shows correct order count and revenue
[ ] Menu list shows all items with correct data
[ ] Add item works — new item appears on customer menu
[ ] Edit item works — changes reflect immediately
[ ] Price change works — new price shown on menu
[ ] Available toggle works — greyed out when unavailable
[ ] Today's Special toggle works — appears on home page
[ ] Soft delete works — item hidden from menu, preserved in DB
[ ] npm run build passes
```

---

## Phase 6 — CI/CD

> **Agent:** This phase wires GitHub Actions to Vercel so every push is automatically tested and deployed.

### Step 1 — Confirm GitHub secrets exist
```bash
gh secret list
# Must show: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
# These were set in Phase 0 Step 10 — if missing, re-run those commands
```

### Step 2 — Add typecheck script to package.json
```bash
npm pkg set scripts.typecheck="tsc --noEmit"
```

### Step 3 — Confirm CI workflow exists
```bash
cat .github/workflows/ci.yml
# Must show the full workflow from Phase 0 Step 11
# If missing, re-create it now
```

### Step 4 — Push and verify CI runs
```bash
git add .
git commit -m "ci: verify full CI/CD pipeline"
git push origin main
sleep 90
gh run list --limit 3
```

✅ **VERIFY:**
```bash
# Latest run must show "completed" + "success"
gh run view $(gh run list --json databaseId --limit 1 -q '.[0].databaseId') --exit-status
echo "CI exit code: $?"
# Expected: 0
```

### Step 5 — Test preview deploy on a branch
```bash
git checkout -b test/preview-deploy
echo "# preview test" >> README.md
git add . && git commit -m "test: trigger preview deploy"
git push origin test/preview-deploy
sleep 90
gh run list --limit 3
```
✅ **VERIFY:** Vercel posts a preview URL comment on the push. Check at:
`https://github.com/{owner}/saas-bahu-ki-rasoi/actions`

```bash
# Clean up test branch
git checkout main
git branch -d test/preview-deploy
git push origin --delete test/preview-deploy
```

### Phase 6 Checklist
```
[ ] GitHub secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID present
[ ] typecheck script in package.json
[ ] CI workflow runs on push to main
[ ] All CI steps pass: lint, typecheck, test, build
[ ] Production deploy triggered automatically on merge to main
[ ] Preview deploy triggered on feature branch push
[ ] Branch protection on main blocks merge if CI fails
```

---

## Phase 7 — Polish

> **Agent:** No new features — quality and UX pass only.

### Step 1 — Loading states
- Add `app/menu/loading.tsx` — skeleton cards in parchment shimmer
- Add `app/cart/loading.tsx` — skeleton rows
- Add `app/admin/dashboard/loading.tsx` — skeleton stats cards
- Add `app/admin/menu/loading.tsx` — skeleton table rows

### Step 2 — Error boundaries
- Add `app/menu/error.tsx` — friendly "Couldn't load menu, please refresh" in brand style
- Add `app/cart/error.tsx`
- Add `app/order/confirmation/error.tsx` — "Order not found — contact us at +91 99821 28866"
- Add `app/admin/error.tsx`

### Step 3 — Empty states
- Cart empty: warm illustration + "Your cart is empty — explore the menu 🍛"
- No specials: "Check back soon for today's specials!"
- Admin no orders: "No orders yet today — they're coming!"
- Admin no items: "No items yet — add your first dish"

### Step 4 — Responsive QA
Check every page at these breakpoints: `375px` (iPhone SE) · `768px` (iPad) · `1280px` (desktop)
- Menu grid: 1 col mobile → 2 col tablet → 3 col desktop
- Cart: full-width mobile, max-w-2xl centered desktop
- Admin table: horizontal scroll on mobile

### Step 5 — Accessibility pass
- All images have descriptive `alt` text
- All buttons have `aria-label` where icon-only
- All form inputs have associated `<label>`
- Confirm color contrast passes WCAG AA (brand colors already chosen for this)

### Step 6 — Final production deploy + full smoke test
```bash
git add .
git commit -m "feat: polish — loading states, error boundaries, empty states, responsive QA"
git push origin main
sleep 120

PROD_URL=$(vercel ls --json | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['url'])")

for path in "/" "/menu" "/cart" "/api/health" "/admin/login"; do
  STATUS=$(curl -o /dev/null -s -w "%{http_code}" "https://${PROD_URL}${path}")
  echo "$path → $STATUS"
done
```
✅ **VERIFY:** All paths return `200`.

### Phase 7 Checklist
```
[ ] Loading skeletons on menu, cart, admin pages
[ ] Error boundaries on all major routes
[ ] Empty states on cart, specials, admin
[ ] Menu responsive: 1/2/3 col at mobile/tablet/desktop
[ ] Admin table scrolls horizontally on mobile
[ ] All images have alt text
[ ] All form inputs have labels
[ ] Final smoke test: all 5 routes return 200
[ ] App is live and fully functional at production URL
```

---

## 🎉 Project Complete

```
✅ GitHub repo       : https://github.com/{owner}/saas-bahu-ki-rasoi
✅ Production URL    : https://saas-bahu-ki-rasoi.vercel.app
✅ Admin panel       : https://saas-bahu-ki-rasoi.vercel.app/admin
✅ CI/CD             : Every push to main auto-deploys
✅ Branch protection : CI must pass before merge
```

**Saas Bahu Ki Rasoi is open for business. Order Food For Any Mood! 🍛**

