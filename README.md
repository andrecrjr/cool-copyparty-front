# Cool CopyParty Front

A clean Next.js frontend for interacting with a CopyParty file server. Log in using your server password, browse directories, upload and delete files, and quickly search — all proxied through a secure API route that never stores your password in the browser.

## Features
- Connect to any reachable CopyParty server via URL
- Directory listing with grid/list views and breadcrumb navigation
- File uploads with progress, and optional delete (respecting server permissions)
- Lightweight search/filter input for quick file discovery
- Session restore via cookie and local storage of the `serverUrl`

## Requirements
- Node.js 18+ and npm (or pnpm)
- A running CopyParty server (for example `http://127.0.0.1:3923`)
- Set a cookie encryption secret: add `COOKIE_SECRET=your-long-random-secret` to your environment

## Quick Start (dev)
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Open the URL shown in the terminal (default `http://localhost:3925`)

## Configuration
- `COOKIE_SECRET` (recommended) or `NEXT_PUBLIC_COOKIE_SECRET` encrypts the auth cookie using AES‑256‑GCM.
- No username is required; CopyParty APIs authenticate with the password only.
- The app persists only `serverUrl` in `localStorage`. The password is never stored in web storage.

## Self-Hosting
You can self-host in two ways: using a prebuilt ZIP from Releases (standalone build), or building locally.

### Option A: Download ZIP from GitHub Releases (standalone)
1. Download the latest `build-front.zip` from the project’s Releases page.
    - `wget https://github.com/andrecrjr/copyparty-front/releases/0.0.1/download/build-front.zip` or latest one check the Releases page.
    - Alternatively, build it yourself using the instructions below.
2. Unzip it: `unzip build-front.zip` (this creates `build-front/`).
3. Change into the standalone bundle: `cd build-front/.next/standalone`.
4. Set environment variables (at minimum a strong cookie secret, and your desired port):
   - macOS/Linux: `COOKIE_SECRET=your-long-random-secret PORT=3925 NODE_ENV=production node server.js`
   - Windows (PowerShell): `$env:COOKIE_SECRET="your-long-random-secret"; $env:PORT="3925"; $env:NODE_ENV="production"; node server.js`
5. Open `http://localhost:3925` and log in with your CopyParty server URL and password.

Notes:
- The ZIP includes `.next/standalone` with `server.js` and minimal node_modules, plus static assets under `.next/standalone/.next/static` and `public` so it runs without the full dev environment.
- Behind a reverse proxy, ensure `x-forwarded-proto` is set to `https` to enable secure cookies.

### Option B: Build it yourself
1. Clone the repo and install deps:
   - `git clone <your-repo-url>`
   - `cd copyparty-front && npm install`
2. Build production: `npm run build` (Next is configured with `output: 'standalone'`).
3. Prepare the standalone bundle (assets copied into the standalone directory):
   - `cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`
   - Or simply run: `make zip-deploy` (creates `build-front/` and `build-front.zip`).
     Note: the `zip-deploy` Makefile target currently uses `pnpm`. If you use `npm`, either replace that line with `npm run build` or run the copy commands above manually.
4. Start the standalone server:
   - `cd .next/standalone`
   - `COOKIE_SECRET=your-long-random-secret PORT=3925 NODE_ENV=production node server.js`
5. Visit `http://localhost:3925`.

Alternative start (non-standalone): `npm run serve` (uses `next start --port 3925`). Use this when running on a machine with the full Node environment available.

## Usage
- On the login screen, enter your CopyParty server URL and password, then Connect.
- Browse folders, switch between grid/list, and use breadcrumbs to navigate.
- Upload files: open the upload modal, select files, watch progress, and refresh to see results.
- Delete files (if permitted by the server) using the actions in the list.
- Log out to clear the session. A valid session is restored automatically if the cookie is still valid.

## Architecture
- UI: React 19 + Next.js App Router, shadcn/ui components, lucide-react icons.
- API proxy: `app/api/action/route.ts` forwards requests to the CopyParty server and appends `pw` as a query parameter after decrypting the cookie.
- Middleware: `middleware.ts` ensures `/api/action` routes carry the encrypted cookie via a header.
- Crypto: `lib/crypto.ts` derives a 32‑byte key from `COOKIE_SECRET` and encrypts the password in a `copyparty_auth` httpOnly cookie.
- Types: `types/copyparty.ts` describes the server’s listing response; see `docs/devnotes.md` for CopyParty HTTP API details.

## Security Notes
- Always set `COOKIE_SECRET` in production; the default dev fallback is insecure.
- In production, cookies are `httpOnly`, `sameSite=lax`, and `secure` when served over HTTPS (or when `x-forwarded-proto=https`).
- The browser never stores the password; it is encrypted server‑side and only forwarded to CopyParty during API requests.

## Build and Deploy
- Production build: `npm run build`
- Start (standalone): `COOKIE_SECRET=your-long-random-secret PORT=3925 node .next/standalone/server.js`
- Start (Next server): `npm run serve`
- Deploy to your platform of choice (e.g., a VM or container). Ensure `COOKIE_SECRET` is configured and your app is served over HTTPS.

## Acknowledgements
- Powered by [CopyParty](https://github.com/9001/copyparty) and Next.js and me.
