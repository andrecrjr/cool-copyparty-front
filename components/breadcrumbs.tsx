"use client"

import { Button } from "@/components/ui/button"
import { HomeIcon, ChevronRightIcon } from "lucide-react"

interface BreadcrumbsProps {
  path: string
  onNavigate: (path: string) => void
}

export function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  const segments = path.split("/").filter(Boolean)

  return (
    <nav className="flex items-center gap-2 flex-wrap">
      <Button variant="ghost" size="sm" onClick={() => onNavigate("/")} className="gap-2 h-9">
        <HomeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Button>

      {segments.map((segment, index) => {
        const segmentPath = "/" + segments.slice(0, index + 1).join("/") + "/"
        const isLast = index === segments.length - 1

        return (
          <div key={segmentPath} className="flex items-center gap-2">
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={isLast ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onNavigate(segmentPath)}
              className="h-9"
              disabled={isLast}
            >
              {decodeURIComponent(segment)}
            </Button>
          </div>
        )
      })}
    </nav>
  )
}
