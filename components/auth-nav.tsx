"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type HeaderProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

export function AuthNav() {
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const client = supabase;

    async function loadProfile() {
      const { data } = await client.auth.getUser();
      if (!data.user) {
        setProfile(null);
        setLoaded(true);
        return;
      }

      const { data: profileData } = await client
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      setProfile(
        profileData ?? {
          id: data.user.id,
          display_name: data.user.email?.split("@")[0] ?? "Profile",
          avatar_url: null
        }
      );
      setLoaded(true);
    }

    void loadProfile();
    const { data: listener } = client.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loaded || !profile) {
    return (
      <Link className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-bold text-white shadow-sm backdrop-blur hover:bg-white/20 sm:min-h-11 sm:px-4 sm:text-sm" href="/login">
        Sign in
      </Link>
    );
  }

  const name = profile.display_name || "Profile";

  return (
    <Link href={`/profiles/${profile.id}`} className="inline-flex min-h-10 max-w-[10rem] shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-bold text-white shadow-sm backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:min-h-11 sm:max-w-[12rem] sm:gap-2 sm:px-2.5 sm:text-sm">
      <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white/20 sm:size-8">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={`${name} profile picture`} className="h-full w-full object-cover" />
        ) : (
          <UserRound size={17} aria-hidden="true" />
        )}
      </span>
      <span className="truncate">{name}</span>
    </Link>
  );
}
