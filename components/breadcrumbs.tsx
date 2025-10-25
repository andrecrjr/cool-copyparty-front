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
    <nav className="flex items-center gap-1 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar py-1 -mx-3 px-3">
      <Button variant="ghost" size="sm" onClick={() => onNavigate("/")} className="gap-2 h-8 sm:h-9 shrink-0">
        <HomeIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Button>

      {segments.map((segment, index) => {
        const segmentPath = "/" + segments.slice(0, index + 1).join("/") + "/"
        const isLast = index === segments.length - 1

        return (
          <div key={segmentPath} className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={isLast ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onNavigate(segmentPath)}
              className="h-8 sm:h-9 max-w-[50vw] sm:max-w-none truncate"
              disabled={isLast}
              title={decodeURIComponent(segment)}
            >
              {decodeURIComponent(segment)}
            </Button>
          </div>
        )
      })}
    </nav>
  )
}
