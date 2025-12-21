# Roc Candy

Next.js 14 (App Router, TypeScript, Tailwind) scaffold for the Roc Candy storefront + admin workspace.

## Quick start
1. Copy `.env.local.example` to `.env.local` and add Supabase values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
2. Install dependencies: `npm install` (already done if you just ran create-next-app).
3. Start dev server: `npm run dev` then open http://localhost:3000.

## Supabase prep
- Create tables: `products`, `pricing_rules`, `orders`, `production_slots`, `user_roles`.
- Enable Row Level Security; allow public read on `products`/`pricing_rules`, restrict writes to admins.
- Use the service role key only on the server (never expose to the browser).

## Routes scaffolded
- Public: `/` (landing), `/docs/setup` (setup checklist).
- Admin: `/admin` placeholder (wire auth + Supabase, then build pricing/schedule views).

## Deploy
- Deploy on Vercel, add the env vars above in Project Settings, and connect your domain.
