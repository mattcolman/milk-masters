# Supabase Setup

Follow these steps to connect the Milk Masters website to Supabase for live scoring.

## 1. Create A Supabase Project

Create a new project in Supabase and wait for the database to finish provisioning.

## 2. Run The Schema

Open the Supabase SQL Editor and run:

```sql
-- contents of supabase/schema.sql
```

Use the SQL in `supabase/schema.sql`. It creates:

- `players`
- `rounds`
- `holes`
- `score_entries`
- password validation RPCs
- row-level security policies

## 3. Change The Shared Password

The default seeded password is currently `milk`.

Before running `supabase/schema.sql`, replace this line:

```sql
values (true, crypt('milk', gen_salt('bf')))
```

with your real shared trip password.

## 4. Enable Realtime

In the Supabase dashboard, enable realtime for `public.score_entries`.

Go to:

```text
Database -> Replication / Realtime
```

Then enable realtime for the `score_entries` table.

## 5. Add Local Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Then add your Supabase values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Test Locally

Run the app:

```bash
npm run dev
```

Open the Rounds tab, enter the shared password, choose a player, and save scores.

## 7. Add GitHub Pages Secrets

In GitHub, go to:

```text
Repo Settings -> Secrets and variables -> Actions
```

Add these repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

After this, GitHub Pages builds should connect to Supabase automatically.
