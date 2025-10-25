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
} from "lucide-react"
import type { FileItem, DirItem } from "@/types/copyparty"

interface FileListProps {
  dirs: DirItem[]
  files: FileItem[]
  viewMode: "grid" | "list"
  onNavigate: (path: string) => void
  onDownload: (file: FileItem) => void
  onDelete?: (item: FileItem | DirItem) => void
  currentPath: string
}

export function FileList({ dirs, files, viewMode, onNavigate, onDownload, onDelete, currentPath }: FileListProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
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

  const getFileIcon = (ext: string) => {
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"]
    const videoExts = ["mp4", "webm", "mov", "avi", "mkv"]
    const audioExts = ["mp3", "wav", "ogg", "flac", "m4a"]
    const archiveExts = ["zip", "rar", "7z", "tar", "gz"]
    const textExts = ["txt", "md", "json", "xml", "csv"]

    if (imageExts.includes(ext.toLowerCase())) return <ImageIcon className="h-5 w-5" />
    if (videoExts.includes(ext.toLowerCase())) return <FileVideoIcon className="h-5 w-5" />
    if (audioExts.includes(ext.toLowerCase())) return <FileAudioIcon className="h-5 w-5" />
    if (archiveExts.includes(ext.toLowerCase())) return <FileArchiveIcon className="h-5 w-5" />
    if (textExts.includes(ext.toLowerCase())) return <FileTextIcon className="h-5 w-5" />
    return <FileIcon className="h-5 w-5" />
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dirs.map((dir) => (
          <button
            key={dir.href}
            onClick={() => onNavigate(currentPath + dir.href)}
            className="group relative flex flex-col items-center p-4 rounded-lg border border-border/50 bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors"
          >
            <FolderIcon className="h-12 w-12 text-primary mb-2" />
            <span className="text-sm text-center text-foreground line-clamp-2 break-all">
              {decodeURIComponent(dir.href.replace(/\/$/, ""))}
            </span>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(dir)
                }}
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
          </button>
        ))}
        {files.map((file) => (
          <div
            key={file.href}
            className="group relative flex flex-col items-center p-4 rounded-lg border border-border/50 bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors"
          >
            <div className="text-muted-foreground mb-2">{getFileIcon(file.ext)}</div>
            <span className="text-sm text-center text-foreground line-clamp-2 break-all mb-1">
              {decodeURIComponent(file.href)}
            </span>
            <span className="text-xs text-muted-foreground">{formatSize(file.sz)}</span>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownload(file)}>
                <DownloadIcon className="h-3 w-3" />
              </Button>
              {onDelete && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(file)}>
                  <TrashIcon className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                Size
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
                Modified
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {dirs.map((dir) => (
              <tr
                key={dir.href}
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onNavigate(currentPath + dir.href)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground break-all">
                      {decodeURIComponent(dir.href.replace(/\/$/, ""))}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">—</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{formatDate(dir.ts)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground flex-shrink-0">{getFileIcon(file.ext)}</div>
                    <span className="text-sm text-foreground break-all">{decodeURIComponent(file.href)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{formatSize(file.sz)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{formatDate(file.ts)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(file)}>
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
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
