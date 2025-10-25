import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "copyparty_auth"

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  if (!pathname.startsWith("/api/action")) {
    return NextResponse.next()
  }

  const op = searchParams.get("op")
  if (op === "login" || op === "logout") {
    // Allow login/logout and landing page access to proceed without cookie validation
    return NextResponse.next()
  }

  const enc = req.cookies.get(COOKIE_NAME)?.value
  if (!enc) {
    return NextResponse.json({ error: "Unauthorized: missing auth cookie" }, { status: 401 })
  }

  // Attach encrypted cookie for server-side decryption in route handlers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-auth-cookie", enc)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/api/action/:path*"],
}