"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            ES
          </span>
          <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            Ersatzteil
            <span className="gradient-text">Search</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-[var(--muted)] sm:block">
            Powered by Muhammad Taha
          </p>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
