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

Same visual quality bar as [Tinybar](https://github.com/godssoldier790-afk/tinybar): dark surface, mono tabular stats, semantic color rail. Palette is iron / gold / frost instead of Tinybar blue.

## Run

```bash
npm install
npm run dev
```

Then open the printed local URL and paste a link, or use one of the sample chips.

## Tests

```bash
npm test
```

Locked fixtures live in `src/lib/fixtures.ts`. Cases include a safe site, a shortener, a PayPal lookalike, an IP-literal login host, a private-IP SSRF reject, a brand-as-subdomain bait, a punycode homograph, a `javascript:` block, and official-brand login paths that must **not** be flagged as typosquat.

## Logo

`public/wolf-mark.svg` ships a wolf + shield mark. Replace it with the Grok Imagine asset from `https://grok.com/imagine/post/a4f636d9-2f06-4e24-8a94-5a538edec556` when you have a downloadable PNG.

## Limits

Not a full sandbox, not a commercial threat-intel subscription, and not legal proof. A LOW score means *no strong indicators were found*, not *this URL is safe*.
