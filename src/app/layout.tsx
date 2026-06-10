import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-slate-50 text-slate-900"
        suppressHydrationWarning
      >
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
                ES
              </span>
              <span className="text-lg font-bold text-slate-900">
                Ersatzteil<span className="text-orange-600">Search</span>
              </span>
            </Link>
            <p className="hidden text-sm text-slate-500 sm:block">
              Powered by Muhammad Taha
            </p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          Technical test task — Mini Product Search
        </footer>
      </body>
    </html>
  );
}
