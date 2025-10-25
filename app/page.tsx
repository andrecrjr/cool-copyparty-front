"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { FileManager } from "@/components/file-manager"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [serverUrl, setServerUrl] = useState("")



  const handleLogin = (url: string) => {
    setServerUrl(url)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/action?op=logout", { method: "DELETE" })
    } finally {
      setIsAuthenticated(false)
      setServerUrl("")
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <FileManager serverUrl={serverUrl} onLogout={handleLogout} />
}
