"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderIcon, UploadIcon, LogOutIcon, SearchIcon, GridIcon, ListIcon, RefreshCwIcon } from "lucide-react"
import { FileList } from "@/components/file-list"
import { FileUpload } from "@/components/file-upload"
import { Breadcrumbs } from "@/components/breadcrumbs"
import type { CopyPartyResponse, FileItem, DirItem } from "@/types/copyparty"
import { appendPwToUrl, getSessionPassword, isSessionPasswordValid } from "@/lib/auth"

interface FileManagerProps {
  serverUrl: string
  credentials: { username: string; password: string }
  onLogout: () => void
}

export function FileManager({ serverUrl, credentials, onLogout }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/")
  const [data, setData] = useState<CopyPartyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showUpload, setShowUpload] = useState(false)

  const ensureSessionPw = () => {
    const pw = getSessionPassword()
    return pw ?? credentials.password
  }

  const fetchDirectory = async (path: string) => {
    setIsLoading(true)
    setError("")

    try {
      if (!isSessionPasswordValid(credentials.password)) {
        setError("Session password mismatch. Please log in again.")
        onLogout()
        return
      }

      // Fetch JSON listing directly from ?ls
      const lsUrl = appendPwToUrl(`${serverUrl}${path}?ls`, ensureSessionPw())
      const response = await fetch(lsUrl)

      if (!response.ok) {
        if (response.status === 401) throw new Error("Authentication failed")
        if (response.status === 403) throw new Error("Access denied")
        throw new Error("Failed to fetch directory")
      }

      const jsonData: CopyPartyResponse = await response.json()
      setData(jsonData)
    } catch (err: any) {
      const msg =
        err?.message === "Authentication failed"
          ? "Authentication failed. Please check your password."
          : err?.message === "Access denied"
            ? "Access denied. Your account lacks permissions."
            : "Failed to load directory. Please try again."
      setError(msg)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (file: FileItem) => {
    if (!isSessionPasswordValid(credentials.password)) {
      setError("Session password mismatch. Please log in again.")
      onLogout()
      return
    }

    try {
      const infoUrl = appendPwToUrl(`${serverUrl}${currentPath}${file.href}?ls`, ensureSessionPw())
      const resp = await fetch(infoUrl)
      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Authentication failed")
        if (resp.status === 403) throw new Error("Access denied")
        throw new Error("Failed to fetch file info")
      }
      const json = await resp.json()
      console.log("File info", json)
    } catch (err: any) {
      const msg =
        err?.message === "Authentication failed"
          ? "Authentication failed. Please check your password."
          : err?.message === "Access denied"
            ? "Access denied. Your account lacks permissions."
            : "Failed to fetch file info. Please try again."
      setError(msg)
      console.error(err)
    }
  }

  const handleDelete = async (item: FileItem | DirItem) => {
    if (!confirm(`Are you sure you want to delete ${item.href}?`)) {
      return
    }

    try {
      if (!isSessionPasswordValid(credentials.password)) {
        setError("Session password mismatch. Please log in again.")
        onLogout()
        return
      }
      const deleteUrl = appendPwToUrl(`${serverUrl}${currentPath}${item.href}`, ensureSessionPw())
      const response = await fetch(deleteUrl, {
        method: "DELETE",
      })

      if (response.ok) {
        handleRefresh()
      } else {
        alert("Failed to delete item")
      }
    } catch (err) {
      alert("Failed to delete item")
      console.error(err)
    }
  }

  useEffect(() => {
    fetchDirectory(currentPath)
  }, [currentPath])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setSearchQuery("")
  }

  const handleRefresh = () => {
    fetchDirectory(currentPath)
  }

  const filteredFiles = data?.files.filter((file) => file.href.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const filteredDirs = data?.dirs.filter((dir) => dir.href.toLowerCase().includes(searchQuery.toLowerCase())) || []

  const hasWritePermission = data?.perms.includes("write") || false
  const hasDeletePermission = data?.perms.includes("delete") || false

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">CopyParty</h1>
                {data?.acct && <p className="text-xs text-muted-foreground">Logged in as {data.acct}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOutIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumbs and Actions */}
        <div className="mb-6 space-y-4">
          <Breadcrumbs path={currentPath} onNavigate={handleNavigate} />

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <ListIcon className="h-4 w-4" /> : <GridIcon className="h-4 w-4" />}
              </Button>
              {hasWritePermission && (
                <Button onClick={() => setShowUpload(!showUpload)} className="gap-2">
                  <UploadIcon className="h-4 w-4" />
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && hasWritePermission && (
          <div className="mb-6">
            <FileUpload
              serverUrl={serverUrl}
              currentPath={currentPath}
              credentials={credentials}
              onUploadComplete={handleRefresh}
              onClose={() => setShowUpload(false)}
            />
          </div>
        )}

        {/* Server Info */}
        {data?.srvinf && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">{data.srvinf}</div>
        )}

        {/* Error Message */}
        {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

        {/* File List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <RefreshCwIcon className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <FileList
            dirs={filteredDirs}
            files={filteredFiles}
            viewMode={viewMode}
            onNavigate={handleNavigate}
            onDownload={handleDownload}
            onDelete={hasDeletePermission ? handleDelete : undefined}
            currentPath={currentPath}
          />
        )}

        {/* Empty State */}
        {!isLoading && filteredDirs.length === 0 && filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No results found" : "This folder is empty"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : hasWritePermission
                  ? "Upload files to get started"
                  : "No files or folders to display"}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
