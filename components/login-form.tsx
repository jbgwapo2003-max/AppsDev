"use client";

import { useState } from "react";
import { LogIn, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Add Supabase env vars to enable live sign in.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setMessage(error ? error.message : "Check your email for a magic sign-in link.");
    setBusy(false);
  }

  async function signInWithGoogle() {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Add Supabase env vars to enable Google sign in.");
      setBusy(false);
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  }

  return (
    <div className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-soft sm:p-7">
      <h1 className="font-display text-5xl font-semibold leading-none text-charcoal">Sign in</h1>
      <p className="mt-3 text-base leading-7 text-ink/75">Save favorite stalls, share new finds, and leave category-based reviews.</p>
      <form onSubmit={sendMagicLink} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-charcoal">Email address</span>
          <div className="mt-2 flex min-h-12 items-center gap-3 rounded-md border border-charcoal/15 bg-rice px-3">
            <Mail size={19} className="text-leaf" aria-hidden="true" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" autoComplete="email" className="h-12 w-full bg-transparent text-base outline-none" placeholder="you@example.com" />
          </div>
        </label>
        <button type="submit" disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60">
          <LogIn size={18} aria-hidden="true" /> {busy ? "Sending..." : "Send magic link"}
        </button>
      </form>
      <button type="button" onClick={signInWithGoogle} disabled={busy} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-charcoal/15 bg-white px-4 text-sm font-bold text-charcoal hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60">
        Continue with Google
      </button>
      {message ? <p className="mt-4 rounded-md bg-smoke px-3 py-2 text-sm font-semibold text-ink">{message}</p> : null}
    </div>
  );
}
