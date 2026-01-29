"use client"

import { FileManager } from "@/components/file-manager"
import type { CopyPartyResponse } from "@/types/copyparty"

export default function DemoPage() {
  const now = Math.floor(Date.now() / 1000)
  const demo: CopyPartyResponse = {
    dirs: [
      { lead: "demo", href: "photos/", sz: 0, ext: "", ts: now - 86400, tags: { ".files": 12 } },
      { lead: "demo", href: "docs/", sz: 0, ext: "", ts: now - 432000, tags: { ".files": 8 } },
    ],
    files: [
      { lead: "demo", href: "cat-avengers.jpg", sz: 1245789, ext: "jpg", ts: now - 7200, tags: {} },
      { lead: "demo", href: "budget-2025.xlsx", sz: 7340032, ext: "xlsx", ts: now - 172800, tags: {} },
      { lead: "demo", href: "meeting-notes.md", sz: 18432, ext: "md", ts: now - 604800, tags: {} },
    ],
    taglist: [],
    srvinf: "demo",
    acct: "demo",
    perms: ["read"], // Only read permissions in demo mode
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

  return <FileManager serverUrl="demo://local" onLogout={() => {}} initialData={demo} />
}