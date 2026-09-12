"use client";

import type { Session } from "@supabase/supabase-js";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { meatheadApi, type OperationsProfile, type UserRole } from "@/lib/meathead-api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const STAFF_ACTIVITY_KEY = "meathead.staff.last-active-at";
const STAFF_INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;
const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;

function readLastActivity(): number | null {
  try {
    const value = Number(window.localStorage.getItem(STAFF_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function recordActivity(now = Date.now()): void {
  try {
    window.localStorage.setItem(STAFF_ACTIVITY_KEY, String(now));
  } catch {
    // Supabase still manages the session when storage is restricted.
  }
}

function clearActivity(): void {
  try {
    window.localStorage.removeItem(STAFF_ACTIVITY_KEY);
  } catch {
    // Nothing else to clean up.
  }
}

function isInactive(now = Date.now()): boolean {
  const lastActivity = readLastActivity();
  return lastActivity !== null && now - lastActivity >= STAFF_INACTIVITY_MS;
}

function preserveActiveSession(current: Session | null, next: Session | null): Session | null {
  // Supabase rotates access tokens frequently. The API client reads the latest
  // persisted token itself, so keeping the same React session object avoids
  // remounting/refetching every dashboard during routine token refreshes.
  return current?.user.id === next?.user.id ? current : next;
}

interface AuthGateProps {
  allowedRoles: UserRole[];
  workspace: "Admin" | "Chef" | "Rider";
  children: (auth: { session: Session; profile: OperationsProfile; signOut: () => Promise<void> }) => ReactNode;
}

export default function AuthGate({ allowedRoles, workspace, children }: AuthGateProps) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<OperationsProfile | null>(null);
  const [profileChecking, setProfileChecking] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    void (async () => {
      if (isInactive()) {
        clearActivity();
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
      } else {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        if (data.session) recordActivity();
      }
      setChecking(false);
    })();
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") clearActivity();
      setSession((current) => preserveActiveSession(current, nextSession));
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;

    let lastRecordedAt = 0;
    const noteActivity = () => {
      const now = Date.now();
      if (now - lastRecordedAt < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastRecordedAt = now;
      recordActivity(now);
    };
    const restoreAfterResume = () => {
      if (document.visibilityState === "hidden") return;
      if (isInactive()) {
        clearActivity();
        void supabase.auth.signOut({ scope: "local" });
        return;
      }
      // getSession refreshes an expired access token using the persisted
      // rotating refresh token before the resumed app makes API calls.
      void supabase.auth.getSession().then(({ data }) => {
        setSession((current) => preserveActiveSession(current, data.session));
        if (data.session) noteActivity();
      });
    };

    noteActivity();
    window.addEventListener("focus", restoreAfterResume);
    window.addEventListener("pageshow", restoreAfterResume);
    document.addEventListener("visibilitychange", restoreAfterResume);
    window.addEventListener("pointerdown", noteActivity, { passive: true });
    window.addEventListener("keydown", noteActivity);
    const sessionCheck = window.setInterval(restoreAfterResume, 15 * 60 * 1000);

    return () => {
      window.clearInterval(sessionCheck);
      window.removeEventListener("focus", restoreAfterResume);
      window.removeEventListener("pageshow", restoreAfterResume);
      document.removeEventListener("visibilitychange", restoreAfterResume);
      window.removeEventListener("pointerdown", noteActivity);
      window.removeEventListener("keydown", noteActivity);
    };
  }, [session, supabase]);

  useEffect(() => {
    let cancelled = false;
    if (!session) {
      setProfile(null);
      setProfileError("");
      setProfileChecking(false);
      return;
    }

    setProfileChecking(true);
    setProfileError("");
    void meatheadApi.me(session.access_token)
      .then((nextProfile) => {
        if (!cancelled) setProfile(nextProfile);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setProfile(null);
          setProfileError(requestError instanceof Error ? requestError.message : "Your staff profile could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setProfileChecking(false);
      });
    return () => { cancelled = true; };
  }, [session]);

  async function logIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    setSubmitting(false);
  }

  async function signOut() {
    clearActivity();
    if (supabase) await supabase.auth.signOut({ scope: "local" });
  }

  if (checking || (session && profileChecking && !profile)) {
    return <div className="min-h-dvh bg-meathead-black px-4 py-24" aria-busy="true">
      <div className="mx-auto max-w-md space-y-4 motion-safe:animate-pulse"><div className="h-10 w-52 bg-meathead-gray" /><div className="h-64 border border-white/10 bg-meathead-charcoal" /></div>
    </div>;
  }

  if (!supabase) {
    return <AuthMessage title="Operations access is not configured">
      Add the public Supabase URL and publishable key to the frontend environment, then redeploy.
    </AuthMessage>;
  }

  if (!session) {
    return <main className="operations-app min-h-dvh bg-meathead-black px-4 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-md">
        <Link href="/" className="font-data text-xs font-bold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-meathead-red">← Public site</Link>
        <div className="mt-8 rounded-xl border border-white/10 bg-meathead-charcoal p-6 shadow-xl shadow-black/25 sm:p-8">
          <div className="mb-7 flex size-11 items-center justify-center rounded-lg border border-meathead-red/50 bg-meathead-red/10 text-meathead-red"><LockKeyhole aria-hidden="true" size={21} /></div>
          <p className="font-data text-xs font-bold uppercase tracking-[0.22em] text-meathead-red">Private workspace</p>
          <h1 className="mt-2 text-balance font-heading text-4xl uppercase leading-none">MEATHEAD {workspace}</h1>

          <form className="mt-8 space-y-5" onSubmit={logIn}>
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="ops-email">Email</label>
              <input id="ops-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full border border-white/20 bg-meathead-black px-4 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30" placeholder="you@meathead.pk" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="ops-password">Password</label>
              <div className="relative"><input id="ops-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full border border-white/20 bg-meathead-black px-4 pr-12 text-base text-white outline-none transition-colors focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex min-w-12 items-center justify-center text-white/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-meathead-red">{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div>
            </div>
            {error && <p role="alert" className="border-l-2 border-meathead-red bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</p>}
            <button type="submit" disabled={submitting} className="min-h-12 w-full bg-meathead-red px-5 font-data text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </main>;
  }

  if (profileError || !profile) {
    return <main className="operations-app min-h-dvh bg-meathead-black px-4 py-24 text-white">
      <div className="mx-auto max-w-lg rounded-xl border border-meathead-red/40 bg-meathead-charcoal p-7 shadow-xl shadow-black/25">
        <LockKeyhole className="text-meathead-red" aria-hidden="true" />
        <h1 className="mt-5 font-heading text-3xl uppercase">Staff access is not ready</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-white/65">{profileError || "No active staff profile was found for this account."}</p>
        <button type="button" onClick={() => void signOut()} className="mt-6 min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red">Log out</button>
      </div>
    </main>;
  }

  if (!allowedRoles.includes(profile.role)) {
    const home = profile.role === "RIDER" ? "/rider" : profile.role === "CHEF" ? "/chef" : "/admin";
    return <main className="operations-app min-h-dvh bg-meathead-black px-4 py-24 text-white">
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-meathead-charcoal p-7 shadow-xl shadow-black/25">
        <LockKeyhole className="text-meathead-red" aria-hidden="true" />
        <h1 className="mt-5 font-heading text-3xl uppercase">Different workspace</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">{profile.displayName} is signed in as {profile.role.toLowerCase()}. This account cannot open the {workspace.toLowerCase()} workspace.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={home} className="inline-flex min-h-11 items-center bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Open my workspace</Link>
          <button type="button" onClick={() => void signOut()} className="min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red">Log out</button>
        </div>
      </div>
    </main>;
  }

  return children({
    session,
    profile,
    signOut,
  });
}

function AuthMessage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="operations-app min-h-dvh bg-meathead-black px-4 py-24 text-white"><div className="mx-auto max-w-lg rounded-xl border border-meathead-red/40 bg-meathead-charcoal p-7 shadow-xl shadow-black/25"><LockKeyhole className="text-meathead-red" aria-hidden="true" /><h1 className="mt-5 font-heading text-3xl uppercase">{title}</h1><p className="mt-3 text-sm leading-6 text-white/65">{children}</p></div></main>;
}
