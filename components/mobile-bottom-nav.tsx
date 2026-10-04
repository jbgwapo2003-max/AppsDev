"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, PlusCircle, Search, UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NavProfile = {
  id: string;
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<NavProfile | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;

    async function loadProfile() {
      const { data } = await client.auth.getUser();
      setProfile(data.user ? { id: data.user.id } : null);
    }

    void loadProfile();
    const { data: listener } = client.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const profileHref = profile ? `/profiles/${profile.id}` : "/login";

  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-3 md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto grid max-w-sm grid-cols-5 items-center gap-1 rounded-lg border border-charcoal/10 bg-white/95 p-2 shadow-soft backdrop-blur-xl">
        <MobileNavItem href="/" icon={<Home size={17} />} label="Home" active={pathname === "/"} />
        <MobileNavItem href="/#discover" icon={<Search size={17} />} label="Search" active={pathname === "/"} />
        <Link href="/submit" className="mx-auto grid size-12 place-items-center rounded-full bg-leaf text-white shadow-pin transition hover:bg-leaf/90 focus:outline-none focus:ring-2 focus:ring-leaf focus:ring-offset-2" aria-label="Share a spot">
          <PlusCircle size={22} aria-hidden="true" />
        </Link>
        <MobileNavItem href="/bookmarks" icon={<Bookmark size={17} />} label="Saved" active={pathname === "/bookmarks"} />
        <MobileNavItem href={profileHref} icon={<UserRound size={17} />} label="Profile" active={pathname.startsWith("/profiles")} />
      </div>
    </nav>
  );
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={`grid min-h-11 place-items-center rounded-md px-1 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-leaf ${active ? "text-leaf" : "text-ink/70 hover:bg-smoke hover:text-charcoal"}`}>
      <span aria-hidden="true">{icon}</span>
      <span className="mt-0.5 leading-none">{label}</span>
    </Link>
  );
}
