# WPlace Auto-Image Bot (Railway)

Server-side bot that paints an image onto WPlace using Node.js + Puppeteer. Built for Railway deployment with a Dockerfile and a small health server.

## Quick Start (Local)

```bash
cp .env.example .env
# edit .env
npm install
npm start
```

## Deploy to Railway

1. Create a new project in Railway.
2. Choose "Deploy from Repo" and point to this project (or use the Railway CLI to upload).
3. Add your environment variables in Railway:
   - `IMAGE_URL` (required)
   - `TARGET_X`, `TARGET_Y`
   - `PALETTE` (comma-separated hex values)
   - Optionally `COOKIE_JSON` if login is required.
4. Deploy. Railway will build via the `Dockerfile` and run `node src/index.js`.

## Customize for WPlace
- Update selectors and logic in `src/site/wplace.js` to match the live site (palette selector, canvas element, cooldown detection).
- If WPlace uses Cloudflare or human verification, you may need to log in manually and export cookies (`COOKIE_JSON`).

## Env Vars
- `WPLACE_URL` – default `https://wplace.live/`
- `HEADLESS` – `true|false`
- `CHROME_NO_SANDBOX` – `true|false` (Railway often needs `true`)
- `IMAGE_URL` – URL of your PNG/JPG
- `TARGET_X`,`TARGET_Y` – top-left anchor on the board
- `PALETTE` – comma-separated hex colors, e.g. `#000000,#FFFFFF,#FF0000`
- `PLACE_INTERVAL_MS` – delay between placements
- `MAX_ERRORS_BEFORE_RELOAD` – fail-safe before aborting
- `COOKIE_JSON` – JSON array of cookie objects from your browser session (optional)

## Notes
- Anti-bot systems can change. Expect to tweak `wplace.js`.
- If the site requires exact canvas coordinate transforms (zoom/pan), you may need to compute the correct client position from board coordinates.
- Consider running headful (`HEADLESS=false`) while debugging and record screenshots with `page.screenshot`.
