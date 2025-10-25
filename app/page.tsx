"use client"

import { useState, useEffect } from "react"
import { FileManager } from "@/components/file-manager"
import { LoginForm } from "@/components/login-form"
import { getServerUrl, saveServerUrl, clearServerUrl } from "@/lib/auth"

export default function Page() {
  const [serverUrl, setServerUrl] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
  }

  return (
    <div>
      {isLoggedIn ? (
        <FileManager serverUrl={serverUrl} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}
