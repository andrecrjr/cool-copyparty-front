"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderIcon, UploadIcon, LogOutIcon, SearchIcon, GridIcon, ListIcon, RefreshCwIcon } from "lucide-react"
import { FileList } from "@/components/file-list"
import { FileUpload } from "@/components/file-upload"
import { Breadcrumbs } from "@/components/breadcrumbs"
import type { CopyPartyResponse, FileItem, DirItem } from "@/types/copyparty"

interface FileManagerProps {
  serverUrl: string
  onLogout: () => void
}

export function FileManager({ serverUrl, onLogout }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/")
  const [data, setData] = useState<CopyPartyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showUpload, setShowUpload] = useState(false)

  const hasWritePermission = data?.perms.includes("write") || false
  const hasDeletePermission = data?.perms.includes("delete") || false

  const fetchDirectory = async (path: string) => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({ op: "ls", serverUrl, path })
      const response = await fetch(`/api/action?${params.toString()}`)

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
          ? "Authentication failed. Please log in again."
          : err?.message === "Access denied"
            ? "Access denied. Your account lacks permissions."
            : "Failed to load directory. Please try again."
      setError(msg)
      if (err?.message === "Authentication failed") {
        onLogout()
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDirectory(currentPath)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl])

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    fetchDirectory(path)
  }

  const handleRefresh = () => {
    fetchDirectory(currentPath)
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const params = new URLSearchParams({ op: "ls", serverUrl, path: `${currentPath}${file.href}` })
      const resp = await fetch(`/api/action?${params.toString()}`)
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
          ? "Authentication failed. Please log in again."
          : err?.message === "Access denied"
            ? "Access denied. Your account lacks permissions."
            : "Failed to fetch file info. Please try again."
      setError(msg)
      if (err?.message === "Authentication failed") {
        onLogout()
      }
      console.error(err)
    }
  }

  const handleDelete = async (item: FileItem | DirItem) => {
    if (!confirm(`Are you sure you want to delete ${item.href}?`)) {
      return
    }

    try {
      const params = new URLSearchParams({ serverUrl, path: `${currentPath}${item.href}` })
      const response = await fetch(`/api/action?${params.toString()}`, {
        method: "DELETE",
      })

      if (response.ok) {
        handleRefresh()
      } else if (response.status === 401) {
        setError("Authentication failed. Please log in again.")
        onLogout()
      } else {
        alert("Failed to delete item")
      }
    } catch (err) {
      alert("Failed to delete item")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-xl font-semibold">CopyParty</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setShowUpload(true)} className="gap-2">
                <UploadIcon className="h-4 w-4" />
                Upload
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCwIcon className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="destructive" onClick={onLogout} className="gap-2">
                <LogOutIcon className="h-4 w-4" />
                Logout
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
                placeholder="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <GridIcon className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <ListIcon className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="space-y-4">
          {isLoading && <div className="text-sm text-muted-foreground">Loading directory...</div>}
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          {data && (
            <FileList
              dirs={data.dirs.filter((d) => d.href.toLowerCase().includes(searchQuery.toLowerCase()))}
              files={data.files.filter((f) => f.href.toLowerCase().includes(searchQuery.toLowerCase()))}
              viewMode={viewMode}
              onNavigate={(href) => handleNavigate(href)}
              onDownload={handleDownload}
              onDelete={hasDeletePermission ? handleDelete : undefined}
              currentPath={currentPath}
            />
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <FileUpload
            serverUrl={serverUrl}
            currentPath={currentPath}
            onUploadComplete={() => {
              setShowUpload(false)
              handleRefresh()
            }}
            onClose={() => setShowUpload(false)}
          />
        )}
      </main>
    </div>
  )
}
