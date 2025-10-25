export interface FileItem {
  lead: string
  href: string
  sz: number
  ext: string
  ts: number
  tags: {
    w?: string
    up_ip?: string
    ".up_at"?: number
    up_by?: string
  }
}

export interface DirItem {
  lead: string
  href: string
  sz: number
  ext: string
  ts: number
  tags: {
    ".files"?: number
    [key: string]: any
  }
}

export interface CopyPartyResponse {
  dirs: DirItem[]
  files: FileItem[]
  taglist: string[]
  srvinf: string
  acct: string
  perms: string[]
  cfg: {
    idx: boolean
    itag: boolean
    dnsort: boolean
    dhsortn: number
    dsort: string
    dcrop: string
    dth3x: string
    u2ts: string
    shr_who: string
    frand: boolean
    lifetime: number
    unlist: string
    sb_lg: string
  }
  logues: string[]
  readmes: string[]
}
