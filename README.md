# Cool CopyParty Front

A clean Next.js frontend for interacting with a CopyParty file server. Log in using your server password, browse directories, upload and delete files, and quickly search — all proxied through a secure API route that never stores your password in the browser.

## Features
- Connect to any reachable CopyParty server via URL
- Directory listing with grid/list views and breadcrumb navigation
- File uploads with progress, and optional delete (respecting server permissions)
- Lightweight search/filter input for quick file discovery
- Session restore via cookie and local storage of the `serverUrl`

## Requirements
- Node.js 18+ and npm
- A running CopyParty server (for example `http://127.0.0.1:3923`)
- Set a cookie encryption secret: add `COOKIE_SECRET=your-long-random-secret` to `.env`


## Quick Start
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Open the URL shown in the terminal (commonly `http://localhost:3000`)

## Configuration
- `COOKIE_SECRET` (recommended) or `NEXT_PUBLIC_COOKIE_SECRET` encrypts the auth cookie using AES‑256‑GCM.
- No username is required; CopyParty APIs authenticate with the password only.
- The app persists only `serverUrl` in `localStorage`. The password is never stored in web storage.

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
- In production, cookies are `httpOnly`, `sameSite=lax`, and `secure` when served over HTTPS.
- The browser never stores the password; it is encrypted server‑side and only forwarded to CopyParty during API requests.

## Build and Deploy
- Production build: `npm run build`
- Start: `npm start`
- Deploy to your platform of choice (e.g., Vercel). Ensure `COOKIE_SECRET` is configured and your app is served over HTTPS.

## Acknowledgements
- Powered by [CopyParty](https://github.com/9001/copyparty) and Next.js and me.
