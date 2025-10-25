"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderIcon } from "lucide-react"

interface LoginFormProps {
  onLogin: (serverUrl: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [serverUrl, setServerUrl] = useState("http://127.0.0.1:3923")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const resp = await fetch("/api/action?op=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl: serverUrl.trim(), password }),
      })

      if (resp.ok) {
        onLogin(serverUrl.trim())
      } else if (resp.status === 401) {
        setError("Authentication failed. Please check your password.")
      } else if (resp.status === 403) {
        setError("Access denied. Your account lacks permissions.")
      } else {
        const data = await resp.json().catch(() => null)
        setError(data?.error || `Failed to connect (status ${resp.status}).`)
      }
    } catch (err) {
      setError("Invalid server URL or network issue. Ensure HTTPS is available.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center safe-px safe-pt safe-pb p-3 sm:p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold">Cool CopyParty 🏆</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Connect to your file server to manage files and folders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverUrl" className="text-sm font-medium">
                Server URL
              </Label>
              <Input
                id="serverUrl"
                type="text"
                placeholder="https://127.0.0.1:3923"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2"></div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
              />
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
