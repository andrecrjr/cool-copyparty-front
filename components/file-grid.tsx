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

interface FileGridProps {
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

const videoExts = ["mp4", "webm", "mov", "avi", "mkv"]
const audioExts = ["mp3", "wav", "ogg", "flac", "m4a"]
const archiveExts = ["zip", "rar", "7z", "tar", "gz"]
const textExts = ["txt", "md", "json", "xml", "csv"]

function getFileIcon(ext: string) {
  if (isImageExt(ext)) return <ImageIcon className="h-8 w-8" />
  if (videoExts.includes(ext.toLowerCase())) return <FileVideoIcon className="h-8 w-8" />
  if (audioExts.includes(ext.toLowerCase())) return <FileAudioIcon className="h-8 w-8" />
  if (archiveExts.includes(ext.toLowerCase())) return <FileArchiveIcon className="h-8 w-8" />
  if (textExts.includes(ext.toLowerCase())) return <FileTextIcon className="h-8 w-8" />
  return <FileIcon className="h-8 w-8" />
}

function renderThumbOrIcon(serverUrl: string, currentPath: string, file: FileItem) {
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
      <div className="text-muted-foreground">{getFileIcon(file.ext)}</div>
    </div>
  )
}

export function FileGrid({ dirs, files, onNavigate, onDownload, onDelete, onRename, currentPath, serverUrl }: FileGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {dirs.map((dir) => (
        // clickable card for navigating
        <div
          key={dir.href}
          role="button"
          tabIndex={0}
          onClick={() => onNavigate(currentPath + dir.href)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onNavigate(currentPath + dir.href)
            }
          }}
          className="group relative flex flex-col items-center p-3 sm:p-4 rounded-lg border border-border/50 bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer"
        >
          <FolderIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-2" />
          <span className="text-xs sm:text-sm text-center text-foreground line-clamp-2 break-all">
            {decodeURIComponent(dir.href.replace(/\/$/, ""))}
          </span>

          {(onDelete || onRename) && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {onRename && (
                <Button
                  aria-label="Rename folder"
                  title="Rename"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentName = decodeURIComponent(dir.href.replace(/\/$/, ""))
                    const newName = prompt("Rename folder", currentName)
                    if (newName && newName.trim()) {
                      onRename(dir, newName.trim())
                    }
                  }}
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  aria-label="Delete folder"
                  title="Delete"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(dir)
                  }}
                >
                  <TrashIcon className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {files.map((file) => (
        <div
          key={file.href}
          className="group relative flex flex-col items-center p-3 sm:p-4 rounded-lg border border-border/50 bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors"
        >
          <div className="mb-2">{renderThumbOrIcon(serverUrl, currentPath, file)}</div>
          <span className="text-xs sm:text-sm text-center text-foreground line-clamp-2 break-all mb-1">
            {decodeURIComponent(file.href)}
          </span>
          <span className="text-xs text-muted-foreground">{(file.sz / 1024 < 1 ? `${file.sz} B` : `${(file.sz / 1024).toFixed(1)} KB`)}</span>

          <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button aria-label="Download" title="Download" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownload(file)}>
              <DownloadIcon className="h-3 w-3" />
            </Button>
            {onRename && (
              <Button
                aria-label="Rename file"
                title="Rename"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const name = decodeURIComponent(file.href)
                  const baseName = name.replace(/\.[^/.]+$/, "")
                  const newName = prompt("Rename file", baseName)
                  if (newName && newName.trim()) {
                    onRename(file, newName.trim())
                  }
                }}
              >
                <PencilIcon className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button aria-label="Delete" title="Delete" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(file)}>
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}