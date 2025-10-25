"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { FileManager } from "@/components/file-manager"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [serverUrl, setServerUrl] = useState("")

  // restore session on first load if cookie still valid
  useEffect(() => {
    const savedUrl = (() => {
      try {
        return localStorage.getItem("copyparty_serverUrl") || ""
      } catch {
        return ""
      }
    })()
    if (!savedUrl) return

    const validate = async () => {
      try {
        const params = new URLSearchParams({ op: "ls", serverUrl: savedUrl, path: "/" })
        const resp = await fetch(`/api/action?${params.toString()}`)
        if (resp.ok) {
          setServerUrl(savedUrl)
          setIsAuthenticated(true)
        } else {
          try { localStorage.removeItem("copyparty_serverUrl") } catch {}
        }
      } catch {
        // network or other error, leave as logged out
      }
    }
    validate()
  }, [])

  const handleLogin = (url: string) => {
    setServerUrl(url)
    setIsAuthenticated(true)
    try {
      localStorage.setItem("copyparty_serverUrl", url)
    } catch {}
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/action?op=logout", { method: "DELETE" })
    } finally {
      setIsAuthenticated(false)
      setServerUrl("")
      try {
        localStorage.removeItem("copyparty_serverUrl")
      } catch {}
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <FileManager serverUrl={serverUrl} onLogout={handleLogout} />
}
