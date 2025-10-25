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
  credentials: { username: string; password: string }
  onUploadComplete: () => void
  onClose: () => void
}

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export function FileUpload({ serverUrl, currentPath, credentials, onUploadComplete, onClose }: FileUploadProps) {
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

      const uploadUrl = `${serverUrl}${currentPath}`

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

      xhr.open("POST", uploadUrl)
      xhr.setRequestHeader("Authorization", "Basic " + btoa(`${credentials.username}:${credentials.password}`))
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

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const allComplete = uploadFiles.length > 0 && uploadFiles.every((f) => f.status === "success")
  const hasPending = uploadFiles.some((f) => f.status === "pending")

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Upload Files</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"}
          `}
        >
          <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-foreground mb-1">Click to select files or drag and drop</p>
          <p className="text-xs text-muted-foreground">Upload multiple files at once</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-2">
            {uploadFiles.map((uploadFile, index) => (
              <div key={index} className="border border-border/50 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-muted-foreground mt-0.5">
                      {uploadFile.status === "success" ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : uploadFile.status === "error" ? (
                        <AlertCircleIcon className="h-5 w-5 text-destructive" />
                      ) : (
                        <FileIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(uploadFile.file.size)}</p>
                      {uploadFile.error && <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>}
                    </div>
                  </div>
                  {uploadFile.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="h-1" />}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {uploadFiles.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleUploadAll} disabled={!hasPending} className="flex-1">
              {allComplete ? "All Uploaded" : "Upload All"}
            </Button>
            {allComplete && (
              <Button
                variant="outline"
                onClick={() => {
                  setUploadFiles([])
                  onClose()
                }}
              >
                Done
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
