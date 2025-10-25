"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderIcon } from "lucide-react"
import { appendPwToUrl, saveSessionPassword } from "@/lib/auth"

interface LoginFormProps {
  onLogin: (serverUrl: string, username: string, password: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [serverUrl, setServerUrl] = useState("http://127.0.0.1:3923")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Normalize and enforce HTTPS for non-local servers
      let baseUrl = serverUrl.trim()
      // Test connection to the server using ls and pw
      const testUrl = appendPwToUrl(`${baseUrl}?ls`, password)
      const response = await fetch(testUrl)

      if (response.ok) {
        saveSessionPassword(password)
        onLogin(baseUrl, username, password)
      } else if (response.status === 401) {
        setError("Authentication failed. Please check your password.")
      } else if (response.status === 403) {
        setError("Access denied. Your account lacks permissions.")
      } else {
        setError(`Failed to connect (status ${response.status}).`)
      }
    } catch (err) {
      setError("Invalid server URL or network issue. Ensure HTTPS is available.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">CopyParty</CardTitle>
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
                placeholder="https://192.168.1.23:3923"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background"
              />
            </div>
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
                required
                className="bg-background"
              />
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
