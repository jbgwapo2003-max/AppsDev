import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, MapPin, PlusCircle, Search } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kanto Finds",
  description: "A Philippines-first streetfood map for prices, photos, reviews, and saved finds.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/20 bg-charcoal/60 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg pr-2 focus:outline-none focus:ring-2 focus:ring-white">
              <span className="grid size-10 place-items-center rounded-lg border border-white/20 bg-white/10 text-white shadow-pin backdrop-blur">
                <MapPin size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-2xl font-semibold leading-none text-white">Kanto Finds</span>
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Streetfood guide</span>
              </span>
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white" href="/">
                <Search size={18} aria-hidden="true" /> Explore
              </Link>
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white" href="/bookmarks">
                <Bookmark size={18} aria-hidden="true" /> Bookmarks
              </Link>
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90" href="/submit">
                <PlusCircle size={18} aria-hidden="true" /> Share a spot
              </Link>
            </div>
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-bold text-white shadow-sm backdrop-blur hover:bg-white/20" href="/login">
              Sign in
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
