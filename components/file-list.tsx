"use client"

import { Button } from "@/components/ui/button"
import {
  FolderIcon,
  FileIcon,
  DownloadIcon,
  TrashIcon,
  ImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileArchiveIcon,
  PencilIcon,
} from "lucide-react"
import type { FileItem, DirItem } from "@/types/copyparty"

interface FileListProps {
  dirs: DirItem[]
  files: FileItem[]
  onNavigate: (path: string) => void
  onDownload: (file: FileItem) => void
  onDelete?: (item: FileItem | DirItem) => void
  onRename?: (item: FileItem | DirItem, newBaseName: string) => void
  currentPath: string
  serverUrl: string
}

const imageExts = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "avif",
    "heic",
    "heif",
    "tif",
    "tiff",
    "jfif",
  ]

function isImageExt(ext: string) {
  return imageExts.includes(ext.toLowerCase())
}

function getThumbUrl(serverUrl: string, currentPath: string, file: FileItem) {
  const pathWithTh = `${currentPath}${file.href}?th`
  const params = new URLSearchParams({ op: "file", serverUrl, path: pathWithTh, cache: "1" })
  return `/api/action?${params.toString()}`
}

export function FileList({ dirs, files, onNavigate, onDownload, onDelete, onRename, currentPath, serverUrl }: FileListProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const units = ["KB", "MB", "GB", "TB"]
    let size = bytes / 1024
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderThumbOrIcon = (file: FileItem) => {
    if (isImageExt(file.ext)) {
      const url = getThumbUrl(serverUrl, currentPath, file)
      return (
        <img
          src={url}
          alt={`${decodeURIComponent(file.href)} thumbnail`}
          width={64}
          height={64}
          loading="lazy"
          className="h-16 w-16 object-contain rounded-md border border-border/50 bg-muted/20"
        />
      )
    }
    return (
      <div className="h-16 w-16 flex items-center justify-center rounded-md border border-border/50 bg-muted/20">
        <div className="text-muted-foreground"><FileIcon className="h-8 w-8" /></div>
      </div>
    )
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Size
              </th>
              <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">
                Modified
              </th>
              <th className="text-right px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {dirs.map((dir) => (
              <tr
                key={dir.href}
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onNavigate(currentPath + dir.href)}
              >
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FolderIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground break-all">
                      {decodeURIComponent(dir.href.replace(/\/$/, ""))}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatSize(dir.sz)}</td>
                <td className="px-3 sm:px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(dir.ts * 1000).toLocaleString()}</td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {onRename && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          const currentName = decodeURIComponent(dir.href.replace(/\/$/, ""))
                          const newName = prompt("Rename folder", currentName)
                          if (newName && newName.trim()) onRename(dir, newName.trim())
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(dir)
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {files.map((file) => (
              <tr key={file.href} className="hover:bg-accent/50 transition-colors">
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0">{renderThumbOrIcon(file)}</div>
                    <span className="text-sm text-foreground break-all">{decodeURIComponent(file.href)}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatSize(file.sz)}</td>
                <td className="px-3 sm:px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(file.ts * 1000).toLocaleString()}</td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(file)}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    {onRename && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const name = decodeURIComponent(file.href)
                          const baseName = name.replace(/\.[^/.]+$/, "")
                          const newName = prompt("Rename file", baseName)
                          if (newName && newName.trim()) onRename(file, newName.trim())
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(file)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
