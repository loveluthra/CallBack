# Callback

AI-powered appointment reminder SaaS for Indian salons. Auto-calls clients 24h before their appointment. SMS fallback if no answer.

**Live:** [call-back-phi.vercel.app](https://call-back-phi.vercel.app)

---

## Stack

- **Frontend:** Single-file HTML (Instrument Serif + Syne, Supabase JS CDN)
- **Database:** Supabase (PostgreSQL)
- **Calls & SMS:** Twilio
- **Hosting:** Vercel (serverless functions + cron)

---

## Repo Structure

```
/
├── index.html          # Full frontend app
├── vercel.json         # Cron job config (fires every hour)
├── schema.sql          # Supabase database schema
├── .gitignore
└── api/
    ├── cron.js         # Hourly cron — checks appointments, fires calls
    ├── remind.js       # Manual reminder trigger
    ├── auth.js         # Auth helper
    └── appointments.js # Appointments API
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste contents of `schema.sql` → Run
3. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Twilio

1. Create account at [twilio.com](https://twilio.com)
2. Get a phone number
3. Copy **Account SID**, **Auth Token**, and your **phone number**

### 3. Vercel Environment Variables

In your Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon key |
| `TWILIO_SID` | Your Twilio Account SID |
| `TWILIO_TOKEN` | Your Twilio Auth Token |
| `TWILIO_FROM` | Your Twilio phone number (+1...) |
| `CRON_SECRET` | Any random secret string |
| `APP_URL` | Your Vercel deployment URL |

### 4. Deploy

```bash
# Push to GitHub
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/callback.git
git push -u origin main
```

Then connect your GitHub repo to Vercel — it will auto-deploy.

### 5. Update index.html credentials

In `index.html`, find and update:

```js
const SB_URL = 'YOUR_SUPABASE_URL';
const SB_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

The Supabase anon key is safe to commit — it's a public key by design.

---

## How the cron works

Every hour, `/api/cron` runs and:
1. Fetches all appointments 23–25 hours from now with `reminder_sent = false`
2. Places a Twilio voice call to each client
3. If call fails or no answer, sends SMS fallback
4. Marks `reminder_sent = true` in Supabase

---

## Admin

Access the admin panel at `yourdomain.com#admin`  
Default: `admin@callback.app` / `callback2025` (change this before going live)

---

Built by Love Luthra · Atlas Skilltech University, Mumbai
