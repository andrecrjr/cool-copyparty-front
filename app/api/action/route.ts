import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { encrypt, generateCookieExpiration, decrypt } from "@/lib/crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const COOKIE_NAME = "copyparty_auth"

function isSecure(req: NextRequest): boolean {
  const proto = req.headers.get("x-forwarded-proto")
  if (proto) return proto === "https"
  return process.env.NODE_ENV === "production"
}

function appendPwToUrl(url: string, pw: string): string {
  const hasQuery = url.includes("?")
  const sep = hasQuery ? "&" : "?"
  return `${url}${sep}pw=${encodeURIComponent(pw)}`
}

async function proxyJson(url: string): Promise<Response> {
  const resp = await fetch(url, { method: "GET" })
  const contentType = resp.headers.get("content-type") || ""
  if (!resp.ok) {
    return NextResponse.json({ error: resp.statusText }, { status: resp.status, headers: { "Cache-Control": "no-store, max-age=0" } })
  }
  if (contentType.includes("application/json")) {
    const data = await resp.json()
    return NextResponse.json(data, { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } })
  } else {
    const text = await resp.text()
    return NextResponse.json({ data: text }, { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } })
  }
}

function getDecryptedPw(req: NextRequest): string | null {
  const enc = req.headers.get("x-auth-cookie") || req.cookies.get(COOKIE_NAME)?.value || null
  if (!enc) return null
  return decrypt(enc)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const op = searchParams.get("op") || "ls"
  const serverUrl = searchParams.get("serverUrl")
  const path = searchParams.get("path") || "/"
  const pw = getDecryptedPw(req)

  if (!serverUrl) return NextResponse.json({ error: "Missing serverUrl" }, { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } })
  if (!pw) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } })

  if (op === "ls") {
    const url = appendPwToUrl(`${serverUrl}${path}?ls`, pw)
    return proxyJson(url)
  }

  // Fallback: just proxy GET to a path
  const url = appendPwToUrl(`${serverUrl}${path}`, pw)
  const upstream = await fetch(url, { method: "GET", cache: "no-store" })
  const res = new NextResponse(upstream.body, { status: upstream.status, headers: upstream.headers })
  res.headers.set("Cache-Control", "no-store, max-age=0")
  return res
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const op = searchParams.get("op") || "upload"

  if (op === "login") {
    const body = await req.json()
    const serverUrl: string | undefined = body?.serverUrl
    const username: string | undefined = body?.username
    const password: string | undefined = body?.password

    if (!serverUrl || !password) {
      return NextResponse.json({ error: "Missing serverUrl or password" }, { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } })
    }

    const testUrl = appendPwToUrl(`${serverUrl}?ls`, password)
    const resp = await fetch(testUrl)
    if (!resp.ok) {
      const status = resp.status
      const msg = status === 401 ? "Authentication failed" : status === 403 ? "Access denied" : "Connection failed"
      return NextResponse.json({ error: msg }, { status, headers: { "Cache-Control": "no-store, max-age=0" } })
    }

    const enc = encrypt(password)
    const res = NextResponse.json({ ok: true, username }, { status: 200 })
    res.cookies.set({
      name: COOKIE_NAME,
      value: enc,
      httpOnly: true,
      secure: isSecure(req),
      sameSite: "lax",
      expires: generateCookieExpiration(8), // 8 hours session
      path: "/",
    })
    res.headers.set("Cache-Control", "no-store, max-age=0")
    return res
  }

  if (op === "upload") {
    const serverUrl = searchParams.get("serverUrl")
    const path = searchParams.get("path") || "/"
    const pw = getDecryptedPw(req)

    if (!serverUrl) return NextResponse.json({ error: "Missing serverUrl" }, { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } })
    if (!pw) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } })

    const formData = await req.formData()

    const uploadUrl = appendPwToUrl(`${serverUrl}${path}`, pw)
    const upstreamResp = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    })

    if (!upstreamResp.ok) {
      return NextResponse.json({ error: upstreamResp.statusText }, { status: upstreamResp.status, headers: { "Cache-Control": "no-store, max-age=0" } })
    }

    const text = await upstreamResp.text()
    return NextResponse.json({ ok: true, response: text }, { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } })
  }

  return NextResponse.json({ error: "Unsupported POST operation" }, { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const op = searchParams.get("op") || "delete"

  if (op === "logout") {
    const res = NextResponse.json({ ok: true }, { status: 200 })
    res.cookies.set({
      name: COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: isSecure(req),
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })
    res.headers.set("Cache-Control", "no-store, max-age=0")
    return res
  }

  const serverUrl = searchParams.get("serverUrl")
  const path = searchParams.get("path") || "/"
  const pw = getDecryptedPw(req)

  if (!serverUrl) return NextResponse.json({ error: "Missing serverUrl" }, { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } })
  if (!pw) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } })

  const deleteUrl = appendPwToUrl(`${serverUrl}${path}`, pw)
  const upstreamResp = await fetch(deleteUrl, { method: "DELETE" })

  if (!upstreamResp.ok) {
    return NextResponse.json({ error: upstreamResp.statusText }, { status: upstreamResp.status, headers: { "Cache-Control": "no-store, max-age=0" } })
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } })
}