"use client"

import { useState, useEffect } from "react"
import { FileManager } from "@/components/file-manager"
import { LoginForm } from "@/components/login-form"
import { getServerUrl, saveServerUrl, clearServerUrl } from "@/lib/auth"
import type { CopyPartyResponse } from "@/types/copyparty"

export default function AppPage() {
  const [serverUrl, setServerUrl] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [demoData, setDemoData] = useState<CopyPartyResponse | null>(null)

  // Hydrate login state on initial load if cookie is still valid
  useEffect(() => {
    try {
      const savedUrl = getServerUrl()
      if (!savedUrl) return

      const params = new URLSearchParams({ op: "ls", serverUrl: savedUrl, path: "/" })
      fetch(`/api/action?${params.toString()}`, { cache: "no-store" })
        .then((res) => {
          if (res.ok) {
            setServerUrl(savedUrl)
            setIsLoggedIn(true)
          } else if (res.status === 401 || res.status === 403) {
            // Cookie invalid or expired
            clearServerUrl()
            setIsLoggedIn(false)
            setServerUrl("")
          }
        })
        .catch(() => {
          // network error; leave login form visible
        })
    } catch (_) {
      // ignore storage errors
    }
  }, [])

  const handleLogin = (url: string) => {
    try {
      saveServerUrl(url)
    } catch (_) {
      // ignore storage errors
    }
    setServerUrl(url)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await fetch("/api/action?op=logout", { method: "DELETE", cache: "no-store" })
    try {
      clearServerUrl()
    } catch (_) {
      // ignore storage errors
    }
    setIsLoggedIn(false)
    setServerUrl("")
    setDemoData(null)
  }

  const handleUseDemo = () => {
    // Minimal realistic mock to preview responsiveness without backend
    const now = Math.floor(Date.now() / 1000)
    const demo: CopyPartyResponse = {
      dirs: [
        { lead: "demo", href: "photos/", sz: 0, ext: "", ts: now - 86400, tags: { ".files": 12 } },
        { lead: "demo", href: "docs/", sz: 0, ext: "", ts: now - 432000, tags: { ".files": 8 } },
      ],
      files: [
        { lead: "demo", href: "cat-avengers.jpg", sz: 1245789, ext: "jpg", ts: now - 7200, tags: {} },
        { lead: "demo", href: "budget-2025.xlsx", sz: 7340032, ext: "xlsx", ts: now - 172800, tags: {} },
        { lead: "demo", href: "meeting-notes.md", sz: 18432, ext: "md", ts: now - 604800, tags: {} },
      ],
      taglist: [],
      srvinf: "demo",
      acct: "demo",
      perms: ["read"],
      cfg: {
        idx: true,
        itag: false,
        dnsort: true,
        dhsortn: 0,
        dsort: "name",
        dcrop: "",
        dth3x: "",
        u2ts: "",
        shr_who: "",
        frand: false,
        lifetime: 0,
        unlist: "",
        sb_lg: "",
      },
      logues: [],
      readmes: [],
    }
    setDemoData(demo)
    setIsLoggedIn(true)
    setServerUrl("demo://local")
  }

  return (
    <div>
      {isLoggedIn ? (
        <FileManager serverUrl={serverUrl} onLogout={handleLogout} initialData={demoData ?? undefined} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
      {/* Demo-only preview when not logged in */}
      {!isLoggedIn && (
        <div className="fixed bottom-3 left-0 right-0 flex justify-center">
          <button
            onClick={handleUseDemo}
            className="inline-flex items-center rounded-md bg-muted text-foreground px-3 py-2 text-xs sm:text-sm shadow border hover:bg-muted/80"
          >
            Preview demo data
          </button>
        </div>
      )}
    </div>
  )
}
