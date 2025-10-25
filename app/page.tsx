import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Copyparty – Self-hosted file sharing",
  description:
    "Cool Copyparty frontend: self-host your files, browse, upload, and share. Fast Next.js UI with secure cookie auth.",
  openGraph: {
    title: "Copyparty – Self-hosted file sharing",
    description:
      "Self-host your files with Copyparty and a modern Next.js frontend. Browse, upload, share.",
    url: "https://copyparty.example",
    siteName: "Cool Copyparty",
    images: [{ url: "/vercel.svg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copyparty – Self-hosted file sharing",
    description:
      "Self-host your files with Copyparty and a modern Next.js frontend. Browse, upload, share.",
    images: ["/vercel.svg"],
  },
  keywords: [
    "Copyparty",
    "self-hosted",
    "file server",
    "Next.js",
    "upload",
    "file sharing",
    "open source",
  ],
}

export default async function LandingPage() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("copyparty_auth")
  if (auth?.value) {
    redirect("/app")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <section className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-bold">Copyparty – Self-hosted file sharing</h1>
        <p className="text-lg text-muted-foreground">
          A clean, simple front-end for your Copyparty server. Secure cookie auth, smooth
          uploads, browsing, thumbnails, and easy sharing.
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside text-left mx-auto max-w-2xl">
          <li>SEO-friendly: descriptive metadata, keywords, and clean HTML.</li>
          <li>Secure: httpOnly encrypted cookie, middleware validation.</li>
          <li>Fast: minimal layout, optimized client components.</li>
        </ul>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/app"
            className="inline-flex items-center rounded-md bg-black text-white px-5 py-2 font-medium hover:opacity-90"
          >
            Open App
          </Link>
          <a
            href="hhttps://github.com/andrecrjr/cool-copyparty-front"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border px-5 py-2 font-medium hover:bg-muted"
          >
            Self Host
          </a>
        </div>

        <footer className="pt-6 text-xs text-muted-foreground">
          This is a front-end only, the <a className="underline" href="https://github.com/CopyParty/copyparty" target="_blank" rel="noreferrer">copyparty</a> server should be self-hosted.
        </footer>
      </section>
    </main>
  )
}