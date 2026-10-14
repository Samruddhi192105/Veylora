"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock3, DoorClosed, Moon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AUTH_TOKEN_KEY,
  authHeaders,
  clearAuthSession,
  type VeyloraUser,
} from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<VeyloraUser | null>(null);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;

    fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
      .then(async (response) => {
        if (response.status === 401) {
          clearAuthSession();
          return null;
        }
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.detail || "Could not verify your account.");
        }
        return data?.user as VeyloraUser | undefined;
      })
      .then((currentUser) => {
        if (active && currentUser) setUser(currentUser);
      })
      .catch((cause: unknown) => {
        console.error("[Veylora] Account verification failed:", cause);
      });

    return () => {
      active = false;
    };
  }, []);

  const startGame = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (starting) return;

    setStarting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/game/start`,
        { method: "POST", headers: authHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Unable to begin your game (HTTP ${response.status}).`);
      }

      const data = await response.json();

      if (typeof data?.game?.session_id !== "string") {
        throw new Error("The game server returned an invalid session.");
      }

      localStorage.setItem(
        "veylora_session_id",
        data.game.session_id
      );

      router.push("/game");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Could not connect to the game server. Please try again."
      );
    } finally {
      setStarting(false);
    }
  };

  const signOut = () => {
    clearAuthSession();
    setUser(null);
    setError("");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101522] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(109,83,53,0.24),transparent_48%),linear-gradient(145deg,#171d2b_0%,#101522_48%,#090d15_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <header className="absolute right-4 top-4 z-20 flex items-center gap-3 sm:right-8 sm:top-7">
        {user ? (
          <>
            <span className="hidden text-xs text-white/55 sm:inline">
              {user.name}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-white/15 bg-black/25 px-3.5 py-2 text-xs text-white/75 transition hover:border-amber-100/35 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="text-xs text-white/65 transition hover:text-amber-100"
            >
              Sign in
            </Link>
            <Link
              href="/auth"
              className="rounded-lg border border-amber-100/25 bg-amber-100 px-3.5 py-2 text-xs font-semibold text-[#1a1a18] transition hover:bg-amber-50"
            >
              Create account
            </Link>
          </>
        )}
      </header>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-amber-200/[0.08] blur-3xl sm:h-80 sm:w-80"
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="absolute -inset-3 rounded-[2rem] border border-white/[0.035] sm:-inset-5" />
        <div className="relative overflow-hidden rounded-[1.7rem] border border-amber-100/15 bg-[#111722]/80 px-6 py-12 text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:px-14 sm:py-16">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/50 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-amber-100/[0.06]" />
          <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border border-amber-100/[0.06]" />

          <div className="relative mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/[0.04] text-amber-100 shadow-[0_0_50px_rgba(222,184,112,0.12)]">
            <motion.div
              animate={{ rotate: [0, -7, 7, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Moon size={30} strokeWidth={1.2} />
            </motion.div>
            <span className="absolute -right-1 top-1 text-amber-200/80">
              <Sparkles size={14} />
            </span>
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-amber-100/60 sm:text-xs">
            An interactive mystery
          </p>

          <h1 className="mt-5 font-serif text-6xl font-light tracking-[0.04em] text-[#f4ead8] sm:text-8xl">
            Veylora
          </h1>
          <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-100/35" />
            <span className="text-[10px] uppercase tracking-[0.38em] text-amber-100/70">
              The Last Hour
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-100/35" />
          </div>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-7 text-slate-300/75 sm:text-base">
            You wake in a forgotten study as the clock strikes its final hour.
            The door is locked. The room remembers more than it reveals.
          </p>

          <div className="mx-auto mt-9 flex max-w-sm items-center justify-center divide-x divide-white/10 rounded-xl border border-white/10 bg-black/20 py-4">
            <div className="flex flex-1 items-center justify-center gap-2.5 px-3 text-amber-100/80">
              <Clock3 size={16} strokeWidth={1.5} />
              <span className="text-xs tracking-wide text-slate-200/75">
                30 minutes
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center gap-2.5 px-3 text-amber-100/80">
              <DoorClosed size={16} strokeWidth={1.5} />
              <span className="text-xs tracking-wide text-slate-200/75">
                One way out
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={startGame}
            disabled={starting}
            className="group mx-auto mt-9 flex min-h-12 items-center justify-center gap-3 rounded-lg border border-amber-100/25 bg-amber-100 px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a1a18] shadow-[0_8px_30px_rgba(214,177,105,0.12)] transition hover:border-amber-50 hover:bg-amber-50 hover:shadow-[0_10px_38px_rgba(214,177,105,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101522] disabled:cursor-wait disabled:opacity-70 sm:px-9"
          >
            {starting
              ? "Opening the study"
              : user
                ? "Enter the study"
                : "Sign in to begin"}
            {!starting && (
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            )}
          </motion.button>

          {!user && (
            <p className="mt-3 text-xs text-white/40">
              Sign in or create an account to start your game.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mx-auto mt-4 max-w-md rounded-lg border border-red-300/20 bg-red-950/35 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-white/30">
            Explore carefully · Trust what you find
          </p>
        </div>
      </motion.section>
    </main>
  );
}