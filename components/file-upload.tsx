"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "./ui/card"
import { Progress } from "./ui/progress"
import { CheckCircleIcon, AlertCircleIcon, UploadIcon, XIcon, FileIcon, InfoIcon } from "lucide-react"

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

interface FileUploadProps {
  serverUrl: string
  currentPath: string
  onUploadComplete: () => void
  onClose: () => void
}

export function FileUpload({ serverUrl, currentPath, onUploadComplete, onClose }: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDemo = serverUrl.startsWith("demo://")

  // Detect active work: uploading or waiting for listing to update
  const hasUploading = uploadFiles.some((f) => f.status === "uploading")
  const hasFinalizing = uploadFiles.some((f) => f.status === "success" && !!f.error)
  const hasActive = hasUploading || hasFinalizing

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    if (isDemo) {
      alert("Demo mode: uploads are disabled.")
      return
    }

    const newFiles: UploadFile[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }))

    setUploadFiles((prev) => [...prev, ...newFiles])
  }

  const waitUntilListed = async (filename: string): Promise<boolean> => {
    // Poll the listing for a short time to confirm the uploaded file appears
    const end = Date.now() + 8000
    while (Date.now() < end) {
      try {
        const params = new URLSearchParams({ op: "ls", serverUrl, path: currentPath })
        params.set("_", Date.now().toString())
        const resp = await fetch(`/api/action?${params.toString()}`, { cache: "no-store" })
        if (resp.ok) {
          const data = await resp.json()
          const files: Array<{ href: string }> = data?.files || []
          if (files.some((f) => decodeURIComponent(f.href).replace(/^\//, "") === filename)) {
            return true
          }
        }
      } catch (e) {
        // ignore and keep trying
      }
      await new Promise((r) => setTimeout(r, 400))
    }
    return false
  }

  const uploadFile = async (uploadFile: UploadFile, index: number): Promise<void> => {
    const { file } = uploadFile

    setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const } : f)))

    try {
      const formData = new FormData()
      formData.append("f", file)

      const params = new URLSearchParams({ op: "upload", serverUrl, path: currentPath })

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress } : f)))
          }
        })

        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Upload finished network-wise; wait until file appears in listing
            const ok = await waitUntilListed(file.name)
            setUploadFiles((prev) =>
              prev.map((f, i) => (i === index ? { ...f, status: ok ? ("success" as const) : ("success" as const), progress: 100, error: ok ? undefined : "Uploaded; listing may take a moment to update" } : f)),
            )
            resolve()
          } else {
            setUploadFiles((prev) =>
              prev.map((f, i) =>
                i === index
                  ? {
                      ...f,
                      status: "error" as const,
                      error: `Upload failed: ${xhr.statusText}`,
                    }
                  : f,
              ),
            )
            reject(new Error(xhr.statusText || "Upload failed"))
          }
        })

        xhr.addEventListener("error", () => {
          setUploadFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? {
                    ...f,
                    status: "error" as const,
                    error: "Network error occurred",
                  }
                : f,
            ),
          )
          reject(new Error("Network error"))
        })

        xhr.open("POST", `/api/action?${params.toString()}`)
        xhr.send(formData)
      })
    } catch (error) {
      setUploadFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error" as const,
                error: "Upload failed",
              }
            : f,
        ),
      )
    }
  }

  const handleUploadAll = async () => {
    if (isDemo) {
      alert("Demo mode: uploads are disabled.")
      return
    }
    const pendingFiles = uploadFiles
      .map((f, i) => ({ file: f, index: i }))
      .filter(({ file }) => file.status === "pending")

    for (const { file, index } of pendingFiles) {
      await uploadFile(file, index)
    }

    // refresh after completing uploads and listing confirms
    onUploadComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center safe-px safe-pt safe-pb p-3 sm:p-4">
      <Card className="w-full sm:max-w-2xl rounded-none sm:rounded-xl h-[85vh] sm:h-auto overflow-y-auto py-4 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" /> Upload Files
          </CardTitle>
          <CardAction>
            <Button variant="ghost" size="icon" aria-label="Close upload" onClick={onClose} disabled={hasActive}>
              <XIcon className="h-4 w-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isDemo && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-yellow-100 text-yellow-900 px-3 py-2 text-xs sm:text-sm border border-yellow-200">
              <InfoIcon className="h-4 w-4" />
              Demo mode: uploads are disabled.
            </div>
          )}
          {!isDemo && hasActive && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-yellow-100 text-yellow-900 px-3 py-2 text-xs sm:text-sm border border-yellow-200">
              <InfoIcon className="h-4 w-4" />
              Uploads are still processing. Please don’t close this window until they finish.
            </div>
          )}
          <div
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center ${isDragging ? "border-primary" : "border-muted"} ${isDemo ? "opacity-60 pointer-events-none" : ""}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (isDemo) {
                alert("Demo mode: uploads are disabled.")
                return
              }
              handleFileSelect(e.dataTransfer.files)
            }}
          >
            <p className="text-sm text-muted-foreground">Drag and drop files here, or click to select</p>
            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e.target.files)} disabled={isDemo} />
            <Button variant="secondary" className="mt-4" onClick={() => fileInputRef.current?.click()} disabled={isDemo}>
              Choose Files
            </Button>
          </div>

          {uploadFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              {uploadFiles.map((uf, i) => (
                <div key={i} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[60vw] sm:max-w-none">{uf.file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {uf.status === "success" && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                      {uf.status === "error" && <AlertCircleIcon className="h-5 w-5 text-red-600" />}
                      <Button variant="ghost" size="icon" onClick={() => setUploadFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={uf.progress} />
                    {uf.status === "success" && uf.error && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <InfoIcon className="h-3 w-3" />
                        <span>{uf.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button onClick={handleUploadAll} className="gap-2" disabled={isDemo}>
                  <UploadIcon className="h-4 w-4" /> Upload All
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={hasActive}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
