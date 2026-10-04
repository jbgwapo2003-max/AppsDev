"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Add Supabase env vars to edit profiles.");
      setBusy(false);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user || authData.user.id !== profile.id) {
      setMessage("You can only edit your own profile.");
      setBusy(false);
      return;
    }

    let avatarUrl = profile.avatarUrl;
    const file = fileRef.current?.files?.[0];

    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const storagePath = `${profile.id}/${Date.now()}.${extension.replace(/[^a-z0-9]/g, "")}`;
      const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true
      });

      if (uploadError) {
        setMessage(uploadError.message);
        setBusy(false);
        return;
      }

      const { data } = supabase.storage.from("profile-avatars").getPublicUrl(storagePath);
      avatarUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || "Kanto Finds user",
        bio: bio.trim() || null,
        avatar_url: avatarUrl ?? null,
        updated_at: new Date().toISOString()
      })
      .eq("id", profile.id);

    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={saveProfile} className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
      <h2 className="font-display text-3xl font-semibold text-charcoal">Edit profile</h2>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-charcoal">Username</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} className="mt-2 min-h-12 w-full rounded-md border border-charcoal/15 bg-rice px-3 text-base outline-none" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-charcoal">Bio</span>
          <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={240} rows={4} className="mt-2 w-full rounded-md border border-charcoal/15 bg-rice px-3 py-3 text-sm leading-6 outline-none" placeholder="Tell people what food walks, stalls, or flavors you love." />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-charcoal">Profile picture</span>
          <span className="mt-2 flex min-h-12 items-center gap-3 rounded-md border border-dashed border-charcoal/20 bg-rice px-3">
            <Camera size={18} className="text-leaf" aria-hidden="true" />
            <input ref={fileRef} type="file" accept="image/*" className="block w-full text-sm text-ink/70 file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-charcoal file:px-4 file:text-sm file:font-bold file:text-white" />
          </span>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={18} aria-hidden="true" /> {busy ? "Saving..." : "Save profile"}
        </button>
        {message ? <p className="text-sm font-semibold text-ink/70">{message}</p> : null}
      </div>
    </form>
  );
}
