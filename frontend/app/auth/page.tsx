"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Script from "next/script";
import { ArrowLeft, KeyRound, Mail, Moon, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AUTH_TOKEN_KEY,
  storeAuthSession,
  type VeyloraUser,
} from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type AuthMode = "login" | "signup";
type AuthResponse = {
  access_token: string;
  user: VeyloraUser;
};
type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string>
          ) => void;
        };
      };
    };
  }
}

export default function AuthPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;

    let active = true;
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!active) return;
        if (response.ok) {
          router.replace("/");
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem("veylora_user");
        }
      })
      .catch((cause: unknown) => {
        console.error("[Veylora] Could not verify existing sign-in:", cause);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const acceptAuthResponse = useCallback((data: AuthResponse) => {
    if (!data?.access_token || !data?.user?.user_id) {
      throw new Error("The server returned an invalid sign-in response.");
    }
    storeAuthSession(data.access_token, data.user);
    router.replace("/");
  }, [router]);

  const signInWithGoogle = useCallback(async (credential: string) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || "Google sign-in failed.");
      }
      acceptAuthResponse(data as AuthResponse);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not connect to the sign-in service."
      );
    } finally {
      setSubmitting(false);
    }
  }, [acceptAuthResponse]);

  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return;
    const google = window.google;
    if (!google) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => void signInWithGoogle(response.credential),
    });
    google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: "320",
    });
  }, [googleReady, signInWithGoogle]);

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/auth/${mode === "signup" ? "signup" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            ...(mode === "signup" ? { name } : {}),
          }),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || "Could not sign in.");
      }
      acceptAuthResponse(data as AuthResponse);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not connect to the sign-in service."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101522] px-4 py-10 text-white">
      {GOOGLE_CLIENT_ID && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(109,83,53,0.22),transparent_50%),linear-gradient(145deg,#171d2b_0%,#101522_48%,#090d15_100%)]" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-amber-100/15 bg-[#111722]/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-9">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/55 transition hover:text-amber-100"
        >
          <ArrowLeft size={14} />
          Back to Veylora
        </Link>

        <div className="mt-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/[0.04] text-amber-100">
            <Moon size={22} strokeWidth={1.3} />
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.35em] text-amber-100/60">
            The study awaits
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#f4ead8]">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-300/65">
            {mode === "login"
              ? "Sign in to continue your mystery."
              : "Join Veylora and begin your escape."}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            aria-pressed={mode === "login"}
            className={`rounded-md px-3 py-2.5 text-sm transition ${
              mode === "login"
                ? "bg-amber-100 text-[#1a1a18]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            aria-pressed={mode === "signup"}
            className={`rounded-md px-3 py-2.5 text-sm transition ${
              mode === "signup"
                ? "bg-amber-100 text-[#1a1a18]"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submitCredentials} className="mt-5 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1.5 block text-xs text-white/65">
                Name
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3.5 focus-within:border-amber-100/45">
                <UserRound size={16} className="text-amber-100/55" />
                <input
                  required
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                />
              </span>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs text-white/65">
              Email
            </span>
            <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3.5 focus-within:border-amber-100/45">
              <Mail size={16} className="text-amber-100/55" />
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-white/65">
              Password
            </span>
            <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3.5 focus-within:border-amber-100/45">
              <KeyRound size={16} className="text-amber-100/55" />
              <input
                required
                type="password"
                minLength={8}
                maxLength={256}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
              />
            </span>
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-1.5 block text-xs text-white/65">
                Confirm password
              </span>
              <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3.5 focus-within:border-amber-100/45">
                <KeyRound size={16} className="text-amber-100/55" />
                <input
                  required
                  type="password"
                  minLength={8}
                  maxLength={256}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                />
              </span>
            </label>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-300/20 bg-red-950/35 px-3.5 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber-100 px-4 py-3 text-sm font-semibold text-[#1a1a18] transition hover:bg-amber-50 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
            or
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {GOOGLE_CLIENT_ID ? (
          <div className="flex min-h-10 justify-center">
            <div ref={googleButtonRef} />
            {!googleReady && (
              <p className="self-center text-xs text-white/45">
                Loading Google sign-in...
              </p>
            )}
          </div>
        ) : (
          <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-center text-xs leading-5 text-white/45">
            Google sign-in is unavailable until a Google OAuth client ID is configured.
          </p>
        )}

        <p className="mt-6 text-center text-[10px] leading-5 text-white/35">
          Your account saves your identity and keeps your game session private.
        </p>
      </section>
    </main>
  );
}
