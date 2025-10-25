"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UploadIcon, XIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"

interface FileUploadProps {
  serverUrl: string
  currentPath: string
  onUploadComplete: () => void
  onClose: () => void
}

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
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

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    const { file } = uploadFile

    setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const } : f)))

    try {
      const formData = new FormData()
      formData.append("f", file)

      const params = new URLSearchParams({ op: "upload", serverUrl, path: currentPath })

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress } : f)))
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, status: "success" as const, progress: 100 } : f)),
          )
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
      })

      xhr.open("POST", `/api/action?${params.toString()}`)
      xhr.send(formData)
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

    // Wait a bit then refresh
    setTimeout(() => {
      onUploadComplete()
    }, 500)
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
