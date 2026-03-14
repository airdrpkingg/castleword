# 🏰 CastleWord — Deployment Guide

## Project structure

```
castleword/
├── index.html                  ← The full game (Apple UI + Farcaster SDK)
├── vercel.json                 ← Vercel config (headers, functions, rewrites)
├── .well-known/
│   └── farcaster.json          ← Miniapp manifest (fill accountAssociation after signing)
├── api/
│   ├── score.js                ← POST /api/score — save player score to KV
│   ├── leaderboard.js          ← GET  /api/leaderboard — fetch global rankings
│   └── webhook.js              ← POST /api/webhook — handle Farcaster events
└── public/
    ├── icon.png                ← App icon (512×512 px)
    ├── splash.png              ← Splash screen (200×200 px)
    └── og.png                  ← OG share image (1200×630 px, 3:2 ratio)
```

---

## Step 1 — Add images 

Create 3 images and put them in /public:
- **icon.png** — 512×512, white background, 🏰 castle emoji or custom logo
- **splash.png** — 200×200, same as icon, used during miniapp launch
- **og.png** — 1200×630, used in feed share cards. Suggest: purple background, "CastleWord" title, 🏰 icon, tagline "Daily crypto word game"

---

## Step 2 — Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → Import project → select your repo
3. No build command needed (static HTML + Vercel functions)
4. Hit Deploy → note your URL (e.g. `castleword.vercel.app`)
5. (Optional but recommended) Add a custom domain: castleword.xyz

---

## Step 3 — Set up Vercel KV (for the global leaderboard)

1. In your Vercel project → Storage → Create KV Database → link to project
2. Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` as env vars
3. Install the KV package: `npm install @vercel/kv` (needed for the api/ functions)
   - Actually since these are serverless functions, add to package.json or use the Vercel KV HTTP client directly

> **Quick alternative (no npm)**: Replace `import { kv } from '@vercel/kv'` in the API files
> with direct HTTP calls to the KV REST API. See: https://vercel.com/docs/storage/vercel-kv/rest-api

---

## Step 4 — Sign the manifest with your Farcaster account

1. Open https://farcaster.xyz/~/developers in desktop Chrome
2. Click **Manifest Tool** in the left sidebar
3. Enter your domain (e.g. `castleword.xyz` — no https://, no trailing slash)
4. Scroll to **Claim Ownership** — a QR code appears
5. Scan it with your phone → opens Warpcast → sign with your Farcaster account
6. Copy the 3 values: `header`, `payload`, `signature`
7. Paste them into `.well-known/farcaster.json` replacing the PASTE_* placeholders
8. Commit and redeploy

---

## Step 5 — Verify the manifest

```bash
curl https://castleword.xyz/.well-known/farcaster.json | jq .
```

Should return valid JSON with accountAssociation and miniapp fields.

---

## Step 6 — Test in Warpcast preview tool

1. Go to https://farcaster.xyz/~/developers → **Embed Tool**
2. Paste your URL: `https://castleword.xyz`
3. All checks should be green ✓
4. Open the preview — test gameplay on mobile

---

## Step 7 — Launch cast 🚀

Cast something like:
```
🏰 CastleWord is live — the daily crypto Wordle for Farcaster

Guess the 5-letter web3 word of the day.
Compete on the global leaderboard.
Share your score as a cast.

→ castleword.xyz

Day #1 starts now 👇
```

Embed the URL in your cast so the fc:miniapp card renders with the Play button.

---

## Optional: Daily push notifications

To send daily notifications at 9am UTC, add to vercel.json:

```json
"crons": [
  { "path": "/api/notify", "schedule": "0 9 * * *" }
]
```

Create `api/notify.js` that calls `sendDailyNotifications()` from `api/webhook.js`.

---

## Update the domain in index.html

Search and replace `castleword.xyz` in `index.html` with your actual domain before deploying.
Also update the `fc:miniapp` and `fc:frame` meta tags in the `<head>`.
