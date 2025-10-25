"use client"

import { useState, useEffect } from "react"
import { FileManager } from "@/components/file-manager"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  const [serverUrl, setServerUrl] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Hydrate login state on initial load if cookie is still valid
  useEffect(() => {
    try {
      const savedUrl = localStorage.getItem("copyparty_server_url")
      if (!savedUrl) return

      const params = new URLSearchParams({ op: "ls", serverUrl: savedUrl, path: "/" })
      fetch(`/api/action?${params.toString()}`, { cache: "no-store" })
        .then((res) => {
          if (res.ok) {
            setServerUrl(savedUrl)
            setIsLoggedIn(true)
          } else if (res.status === 401 || res.status === 403) {
            // Cookie invalid or expired
            localStorage.removeItem("copyparty_server_url")
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
      localStorage.setItem("copyparty_server_url", url)
    } catch (_) {
      // ignore storage errors
    }
    setServerUrl(url)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await fetch("/api/action?op=logout", { method: "DELETE", cache: "no-store" })
    try {
      localStorage.removeItem("copyparty_server_url")
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
