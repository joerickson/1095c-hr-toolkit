# 1095-C HR Toolkit — ABC Janitorial Services

A Next.js 14 web application for ACA 1095-C compliance management, built for ABC Janitorial Services HR team.

## Features

| Feature | Description |
|---|---|
| **Audit Checklist** | ACA compliance checklist with persistent per-user checkbox state saved to Supabase |
| **Code Lookup Wizard** | Interactive step-by-step wizard to determine correct Line 14, 15, and 16 codes + full reference |
| **Employee Tracker** | CRUD interface for employee ACA data (eligibility, offer codes, contributions) synced to Supabase |
| **WinTeam Setup Guide** | Step-by-step reference for configuring WinTeam for 1095-C reporting |

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth + Database:** Supabase (Row Level Security enabled)
- **Language:** TypeScript

## Getting Started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema: copy the contents of `supabase/schema.sql` and execute it in the Supabase SQL Editor
3. In Supabase → Authentication → URL Configuration, add your app URL to Allowed Redirect URLs

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both values are found in Supabase → Settings → API.

### 3. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── auth/login/          # Login/sign-up page
├── auth/callback/       # Supabase OAuth callback
├── dashboard/           # Main dashboard with feature cards
├── audit-checklist/     # Audit checklist (server + client)
├── code-lookup/         # Code lookup wizard (server + client)
├── employee-tracker/    # Employee CRUD (server + client)
└── winteam-guide/       # WinTeam reference guide (server + client)

components/
└── Nav.tsx              # Top navigation bar

lib/
├── supabase/            # Supabase client (browser, server, middleware)
├── data/                # Static data: Line 14/16 codes, checklist items
└── types.ts             # Shared TypeScript interfaces

supabase/
└── schema.sql           # Database schema + RLS policies
```

## Supabase Tables

| Table | Purpose |
|---|---|
| `user_checklist_states` | Per-user audit checklist checkbox state |
| `employees` | Employee ACA tracking records |

Both tables use Row Level Security — users can only access their own data.

## Deployment

Deploy to Vercel (recommended):

```bash
npx vercel --prod
```

Add the environment variables in the Vercel project settings.
