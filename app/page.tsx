"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { FileManager } from "@/components/file-manager"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [serverUrl, setServerUrl] = useState("")
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)

  const handleLogin = (url: string, username: string, password: string) => {
    setServerUrl(url)
    setCredentials({ username, password })
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setServerUrl("")
    setCredentials(null)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <FileManager serverUrl={serverUrl} credentials={credentials!} onLogout={handleLogout} />
}
