import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import Link from "next/link";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("ersatzteil-theme");
    var theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <AnimatedBackground />
          <header className="app-header surface sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="group flex items-center gap-3 transition-opacity hover:opacity-90"
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-105">
                  ES
                </span>
                <span
                  className="text-heading text-xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-outfit), sans-serif" }}
                >
                  Ersatzteil<span className="text-gradient">Search</span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <p className="text-muted hidden text-sm sm:block">
                  Powered by{" "}
                  <span className="text-body font-medium">Muhammad Taha</span>
                </p>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="relative flex-1">{children}</main>
          <footer className="app-footer py-8 text-center">
            <p className="text-subtle text-xs">
              Technical test task —{" "}
              <span className="text-muted">Mini Product Search</span>
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
