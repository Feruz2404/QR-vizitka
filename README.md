# Premium Employee QR Business Card Platform (QR-vizitka)

A production-ready **React + Vite + TypeScript** web app for an organization where each employee has a unique public digital business card page at:

- `GET /v/:slug`

…and a secure admin panel for managing cards:

- `/admin/login`, `/admin`, `/admin/cards`, `/admin/cards/new`, `/admin/cards/:id/edit`

There is **no public homepage** (`/` redirects to `/admin/login`).

## Tech stack
- React 18 + TypeScript + Vite
- Redux Toolkit + RTK Query (`fakeBaseQuery`)
- Supabase (Postgres + Auth + Storage + RLS)
- Tailwind CSS
- Framer Motion
- Lucide React
- QR: `react-qr-code`
- vCard: custom `.vcf` generator

## Getting started

### 1) Install
```bash
npm install
```

### 2) Configure environment variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PUBLIC_BASE_URL=https://your-domain.uz
```

(See `.env.example`.)

### 3) Supabase setup

#### Database schema + RLS
Run the SQL in:
- `supabase/schema.sql`

This creates:
- `employee_cards` table
- `updated_at` trigger
- RLS policies:
	- Public can read only `is_active = true`
	- Authenticated users can manage all cards

#### Storage buckets
Create buckets:
- `employee-photos`
- `organization-logos`

Use **public** bucket access if you want images to be publicly accessible by URL (recommended for this project).

#### Admin accounts
Create an admin user via Supabase Auth (Email/Password). This app relies on:
- Supabase session in the browser
- RLS policies for authorization

### 4) Run locally
```bash
npm run dev
```

### 5) Build
```bash
npm run build
```

## App behavior

### Public cards
- Route: `/v/:slug`
- Loads employee data from Supabase by `slug`
- If the card is inactive, shows an unavailable state
- Includes:
	- Sticky premium employee header (photo/initials + name + position + optional logo)
	- Contact sections
	- QR code + download SVG
	- Download vCard (`.vcf`)
	- Share (Web Share API) with clipboard fallback

### Admin panel
- Protected routes require a Supabase authenticated session
- CRUD employee cards
- Publish/unpublish via `is_active`
- Copy public URL
- Delete confirmation modal

## Required environment variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_BASE_URL` (recommended for consistent QR URLs)

## Notes / manual steps
- You still need to create the Supabase project, run `supabase/schema.sql`, and create the storage buckets.
- If you deploy behind a different domain, update `VITE_PUBLIC_BASE_URL`.
