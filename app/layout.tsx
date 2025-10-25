import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SWRegister from "../components/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Ensure metadataBase is set for proper OG/Twitter image resolving
export const metadata: Metadata = {
  title: "Cool Copy Party",
  description: "Cool front end for Copyparty",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CopyParty",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3925"),
  // Remove any `viewport` or `themeColor` fields previously added here; these are now provided via the `viewport` export above.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <div className="min-h-screen">
          {children}
        </div>
        <SWRegister />
      </body>
    </html>
  );
}
