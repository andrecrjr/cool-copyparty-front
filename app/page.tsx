"use client"

import { useState } from "react"
import { FileManager } from "@/components/file-manager"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  const [serverUrl, setServerUrl] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (url: string) => {
    setServerUrl(url)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await fetch("/api/action?op=logout", { method: "DELETE", cache: "no-store" })
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
