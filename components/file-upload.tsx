"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { CheckCircleIcon, AlertCircleIcon, UploadIcon, XIcon, FileIcon } from "lucide-react"

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

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles: UploadFile[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }))

    setUploadFiles((prev) => [...prev, ...newFiles])
  }

  async function waitUntilListed(filename: string, timeoutMs = 20000): Promise<boolean> {
    const started = Date.now()
    while (Date.now() - started < timeoutMs) {
      try {
        const params = new URLSearchParams({ op: "ls", serverUrl, path: currentPath, _: `${Date.now()}` })
        const resp = await fetch(`/api/action?${params.toString()}`, { cache: "no-store" })
        if (!resp.ok) {
          await new Promise((r) => setTimeout(r, 800))
          continue
        }
        const data = await resp.json()
        const files: Array<{ href: string }> = data?.files || []
        if (Array.isArray(files) && files.some((f) => f.href?.endsWith(filename))) {
          return true
        }
      } catch {
        // transient network or listing errors; retry
      }
      await new Promise((r) => setTimeout(r, 800))
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
              prev.map((f, i) => (i === index ? { ...f, status: ok ? ("success" as const) : ("error" as const), progress: 100, error: ok ? undefined : "Uploaded but not listed yet" } : f)),
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" /> Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-primary" : "border-muted"}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFileSelect(e.dataTransfer.files)
            }}
          >
            <p className="text-sm text-muted-foreground">Drag and drop files here, or click to select</p>
            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
            <Button variant="secondary" className="mt-4" onClick={() => fileInputRef.current?.click()}>
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
                      <span className="text-sm">{uf.file.name}</span>
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
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button onClick={handleUploadAll} className="gap-2">
                  <UploadIcon className="h-4 w-4" /> Upload All
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
