# WOLF DEFENDER

Defensive malicious-link tracker. Paste a URL. Wolf Defender resolves the redirect chain without executing JavaScript, inspects the destination, and scores risk.

This is a protection tool. It does **not** generate phishing pages, tracking pixels, malware droppers, or covert victim telemetry.

## What it shows

- Original URL and final destination
- Redirect hop timeline
- Suspicious indicators (typosquat, homograph, login bait, multi-domain hops, shorteners, IP-literal hosts)
- Threat-intel matches from bundled lists
- Risk `0–100` with band `LOW` / `GUARDED` / `MEDIUM` / `HIGH` / `CRITICAL`
- Confidence `0–100` and a plain-language recommendation

## Risk bands

| Score | Band | Recommendation |
| --- | --- | --- |
| 0–19 | LOW | No strong indicators found. Insufficient evidence to determine whether this URL is safe. |
| 20–39 | GUARDED | Review indicators before continuing. |
| 40–59 | MEDIUM | Proceed with caution. Verify the final domain yourself. |
| 60–79 | HIGH | Do not enter credentials or personal information. |
| 80–100 | CRITICAL | Do not visit. |

## Safe resolution rules

- Hop cap: 8
- HEAD, then GET fallback. Headers plus a small body peek for form keywords
- No JavaScript execution and no headless browser
- SSRF guard: loopback, RFC1918, link-local, ULA, cloud metadata (`169.254.169.254`)
- Rejected schemes: `javascript:`, `data:`, `file:`, `blob:`
- Timeouts and response-size limits

## Stack

Vite, React 19, TypeScript, Tailwind v4.

Same visual quality bar as [Tinybar](https://github.com/godssoldier790-afk/tinybar): dark surface, mono tabular stats, semantic color rail. Palette is iron / signal crimson / frost.

## Run locally

```bash
npm install
npm test
npm run dev
```

Vite on `:5173`, Express analyzer on `:8787`. Paste a link or use one of the sample chips.

## Deploy on Vercel

Repo-side settings are in `vercel.json` (Vite build → `dist`, SPA rewrite, `/api/*` serverless).

1. Open https://vercel.com/new
2. Import **godssoldier790-afk/wolf-defender**
3. Framework Preset: **Vite**
4. Build Command: `npx vite build`
5. Output Directory: `dist`
6. Install Command: `npm install`
7. Deploy

`POST /api/analyze` and `GET /api/health` are serverless wrappers around the same hop follower. If the API is down, the UI falls back to static heuristics.

## Tests

```bash
npm test
```

Locked fixtures live in `src/lib/fixtures.ts`.

## Logo

Header and Scanner try `/logo.jpg` and fall back to `public/wolf-mark.svg`.

## Limits

Not a full sandbox, not a commercial threat-intel subscription, and not legal proof. A LOW score means *no strong indicators were found*, not *this URL is safe*.
