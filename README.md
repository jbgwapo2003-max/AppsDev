# Kanto Finds

A Philippines-first streetfood discovery app with Google Maps, Supabase auth/data/storage, structured category reviews, bookmarks, and Vercel-ready configuration.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

3. Run the Supabase SQL in `supabase/schema.sql`.

4. Start the app:

```bash
npm run dev
```

Without env vars, the app uses polished demo data and a fallback map panel so the UI remains browsable.

## Production

Deploy to Vercel and set the same environment variables in the Vercel project. Enable Email OTP and Google OAuth in Supabase Auth, then allow the deployed Vercel URL as an auth redirect.
