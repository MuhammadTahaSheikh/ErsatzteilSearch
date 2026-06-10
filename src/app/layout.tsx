import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import Link from "next/link";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Spare Parts Search | Mini Product Search",
  description: "Search spare parts and accessories with real-time filtering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col text-slate-100"
        suppressHydrationWarning
      >
        <AnimatedBackground />
        <header className="sticky top-0 z-50 glass border-b border-white/5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-105">
                <span className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                ES
              </span>
              <span
                className="font-display text-xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                Ersatzteil
                <span className="text-gradient">Search</span>
              </span>
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-sm text-slate-400">
                Powered by{" "}
                <span className="font-medium text-slate-300">Muhammad Taha</span>
              </p>
            </div>
          </div>
        </header>
        <main className="relative flex-1">{children}</main>
        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-xs text-slate-500">
            Technical test task —{" "}
            <span className="text-slate-400">Mini Product Search</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
