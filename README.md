# 1095-C HR Toolkit

ACA 1095-C compliance toolkit for ABC Janitorial Services LLC (Tax Year 2025).

## Features

1. **Audit Checklist** (`/checklist`) — 34-item pre-filing checklist with per-user persistent state
2. **Code Lookup Wizard** (`/wizard`) — Step-by-step guided wizard for Lines 14, 15, 16 with exact business logic
3. **Employee Tracker** (`/tracker`) — Full CRUD employee table with compliance issue surfacing and dependent management
4. **WinTeam Setup Guide** (`/guide`) — Printable static reference guide for WinTeam ACA setup
5. **Admin Settings** (`/settings`) — Admin-only company ACA settings (MEC premium, safe harbor method, etc.)

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **Supabase** (Postgres + Row Level Security + Auth)
- **Vercel** (hosting)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/joerickson/1095c-hr-toolkit.git
cd 1095c-hr-toolkit
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the entire contents of `supabase/schema.sql`
3. Copy your project URL and anon key

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create the first admin user

1. Go to your Supabase project → Authentication → Users → Add user
2. Enter the HR admin's email and password
3. In the SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourcompany.com';
   ```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Business Rules (ABC Janitorial Services LLC)

| Rule | Detail |
|------|--------|
| Line 14 | Always **1E** — all 3 plans offered to every eligible employee |
| Line 15 | Always **$145.00/month** (Plan 1 MEC employee-only premium) |
| Line 16 (enrolled) | **2C** |
| Line 16 (declined) | **2H** (Rate of Pay safe harbor — configurable) |
| Part III | Required for Plan 1 (MEC) and Plan 2 (Self-Insured Full) only |
| 1F code | **Never** — full coverage plans are always offered alongside MEC |

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — auto-deploys on every push to `main`
