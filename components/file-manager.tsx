"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderIcon, UploadIcon, LogOutIcon, SearchIcon, GridIcon, ListIcon, RefreshCwIcon, FolderPlusIcon } from "lucide-react"
import { FileList } from "@/components/file-list"
import { FileUpload } from "@/components/file-upload"
import { Breadcrumbs } from "@/components/breadcrumbs"
import type { CopyPartyResponse, FileItem, DirItem } from "@/types/copyparty"

interface FileManagerProps {
  serverUrl: string
  onLogout: () => void
  initialData?: CopyPartyResponse
}

export function FileManager({ serverUrl, onLogout, initialData }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/")
  const [data, setData] = useState<CopyPartyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showUpload, setShowUpload] = useState(false)
  const [mkdirName, setMkdirName] = useState("")
  const imageExts = new Set<string>([
    "png","jpg","jpeg","gif","webp","bmp","svg","ico","avif","heic","heif","tif","tiff","jfif"
  ])

  const isDemo = serverUrl.startsWith("demo://")
  const hasWritePermission = !isDemo && (data?.perms.includes("write") || false)
  const hasDeletePermission = !isDemo && (data?.perms.includes("delete") || false)

  const fetchDirectory = async (path: string) => {
    setIsLoading(true)
    setError("")

    if (isDemo) {
      // Use provided initial data for demo mode; stay on root for simplicity
      const demo = initialData ?? {
        dirs: [],
        files: [],
        taglist: [],
        srvinf: "demo",
        acct: "demo",
        perms: ["read"],
        cfg: {
          idx: true,
          itag: false,
          dnsort: true,
          dhsortn: 0,
          dsort: "name",
          dcrop: "",
          dth3x: "",
          u2ts: "",
          shr_who: "",
          frand: false,
          lifetime: 0,
          unlist: "",
          sb_lg: "",
        },
        logues: [],
        readmes: [],
      }
      setData(demo)
      setIsLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({ op: "ls", serverUrl, path })
      // cache-busting
      params.set("_", Date.now().toString())
      const response = await fetch(`/api/action?${params.toString()}`, { cache: "no-store" })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Authentication failed")
        if (response.status === 403) throw new Error("Access denied")
        throw new Error("Failed to fetch directory")
      }

      const jsonData: CopyPartyResponse = await response.json()
      setData(jsonData)
    } catch (err: unknown) {
      const msg =
        (err as {message?: string})?.message === "Authentication failed"
          ? "Authentication failed. Please log in again."
          : (err as {message?: string})?.message === "Access denied"
            ? "Access denied. Your account lacks permissions."
            : "Failed to load directory. Please try again."
      setError(msg)
      if ((err as {message?: string})?.message === "Authentication failed") {
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
    if (isDemo) {
      alert("Demo mode: downloads are disabled.")
      return
    }
    const path = `${currentPath}${file.href}`
    if (imageExts.has(file.ext.toLowerCase())) {
      const params = new URLSearchParams({ op: "file", serverUrl, path, cache: "1" })
      const url = `/api/action?${params.toString()}`
      window.open(url, "_blank", "noopener")
      return
    }
  
    const params = new URLSearchParams({ op: "file", serverUrl, path, download: "1" })
    const url = `/api/action?${params.toString()}`
    const a = document.createElement("a")
    a.href = url
    // do not set a.download; rely on server Content-Disposition
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDelete = async (item: FileItem | DirItem) => {
    if (isDemo) {
      alert("Demo mode: delete is disabled.")
      return
    }
    if (!confirm(`Are you sure you want to delete ${item.href}?`)) {
      return
    }

    try {
      const params = new URLSearchParams({ serverUrl, path: `${currentPath}${item.href}` })
      params.set("_", Date.now().toString())
      const response = await fetch(`/api/action?${params.toString()}`, {
        method: "DELETE",
        cache: "no-store",
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

  const handleMkdir = async () => {
    if (isDemo) {
      alert("Demo mode: creating folders is disabled.")
      return
    }
    const name = mkdirName.trim()
    if (!name) return

    try {
      const params = new URLSearchParams({ op: "upload", serverUrl, path: currentPath })
      const form = new FormData()
      form.append("act", "mkdir")
      form.append("name", name)

      const response = await fetch(`/api/action?${params.toString()}`, {
        method: "POST",
        body: form,
        cache: "no-store",
      })

      if (!response.ok) {
        if (response.status === 401) throw new Error("Authentication failed")
        if (response.status === 403) throw new Error("Access denied")
        throw new Error("Failed to create directory")
      }

      setMkdirName("")
      handleRefresh()
    } catch (err: unknown) {
      const msg =
        (err as {message?: string})?.message === "Authentication failed"
          ? "Authentication failed. Please log in again."
          : (err as {message?: string})?.message === "Access denied"
            ? "Access denied. Your account lacks permissions."
            : "Failed to create directory. Please try again."
      setError(msg)
      if ((err as {message?: string})?.message === "Authentication failed") {
        onLogout()
      }
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur safe-pt z-30">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold">Cool CopyParty</h1>
            </div>
            <Button variant="default" onClick={() => setShowUpload(true)}
                  className="cursor-pointer rounded-full gap-2 w-12 h-12 sm:w-14 sm:h-14 fixed right-4 sm:right-10 bottom-4 sm:bottom-8 shadow-md">
                <UploadIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCwIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button variant="destructive" onClick={onLogout} className="gap-2">
                <LogOutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-px">
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

          {hasWritePermission && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="New folder name"
                  value={mkdirName}
                  onChange={(e) => setMkdirName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleMkdir} className="gap-2" disabled={!mkdirName.trim()}>
                  <FolderPlusIcon className="h-4 w-4" />
                  Create folder
                </Button>
              </div>
            </div>
          )}
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
              serverUrl={serverUrl}
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
