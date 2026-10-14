
"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type HintResponse = {
  answer: string;
  hint_level: number;
  sources?: string[];
};

export default function GameMaster() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [hintLevel, setHintLevel] = useState(1);
  const [hints, setHints] = useState<HintResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askGameMaster() {
    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const sessionId = localStorage.getItem("veylora_session_id");

      const response = await fetch(`${API_URL}/rag/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          hint_level: hintLevel,
          ...(sessionId ? { session_id: sessionId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The Game Master could not respond."
        );
      }

      setHints((previous) => [...previous, data as HintResponse]);
      setQuestion("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact the Game Master."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      {/* Floating Game Master button */}
      <div className="flex flex-col items-end gap-3">
        {isOpen && (
          <section
            role="dialog"
            aria-label="My Hints"
            className="pointer-events-auto flex max-h-[min(70vh,600px)] w-[min(360px,calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-amber-300/25 bg-slate-950/95 text-amber-50 shadow-[0_0_45px_rgba(245,158,11,0.15)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-amber-100/10 bg-amber-300/5 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-xl text-amber-200">
                  ✦
                </div>
                <div>
                  <h2 className="font-semibold tracking-wide">
                    My Hints
                  </h2>
                  <p className="text-xs text-slate-400">
                    Guidance from the Game Master
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close hints panel"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Hints history */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {hints.length === 0 && (
                <div className="py-5 text-center">
                  <div className="mb-3 text-4xl text-amber-200/80">
                    ✧
                  </div>
                  <p className="font-medium text-amber-100">
                    Need a little guidance?
                  </p>
                  <p className="mx-auto mt-2 max-w-[240px] text-sm leading-6 text-slate-400">
                    Ask about an object, a clue, or a puzzle in the room.
                    The mystery is yours to solve.
                  </p>
                </div>
              )}

              {hints.map((hint, index) => (
                <article
                  key={`${index}-${hint.hint_level}`}
                  className="rounded-xl border border-amber-200/15 bg-white/[0.035] p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Hint {index + 1}
                    </span>
                    <span className="rounded-full border border-amber-200/15 px-2 py-1 text-[10px] text-slate-300">
                      {["Subtle", "Guided", "Direct"][
                        hint.hint_level - 1
                      ] || `Level ${hint.hint_level}`}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                    {hint.answer}
                  </p>
                </article>
              ))}

              {loading && (
                <div className="flex items-center gap-3 rounded-xl bg-amber-200/5 p-3 text-sm text-amber-100">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-200" />
                  The Game Master is thinking...
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/20 bg-red-950/40 p-3 text-sm text-red-200"
                >
                  {error}
                </div>
              )}
            </div>

            {/* Question form */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void askGameMaster();
              }}
              className="space-y-3 border-t border-white/10 bg-black/20 p-4"
            >
              <div className="flex gap-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setHintLevel(level)}
                    aria-pressed={hintLevel === level}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs transition ${
                      hintLevel === level
                        ? "border-amber-300/50 bg-amber-300/10 text-amber-200"
                        : "border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {["Subtle", "Guided", "Direct"][level - 1]}
                  </button>
                ))}
              </div>

              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about a clue..."
                rows={2}
                maxLength={500}
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/90 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300/50"
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Seeking an answer..." : "✦ Reveal a Hint"}
              </button>
            </form>
          </section>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-label={isOpen ? "Close My Hints" : "Open My Hints"}
          aria-expanded={isOpen}
          className="pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-200/50 bg-slate-950/90 text-2xl text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.22)] backdrop-blur-xl transition duration-300 hover:scale-110 hover:border-amber-200 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] active:scale-95"
        >
          <span className="absolute inset-1 rounded-full border border-amber-200/10" />
          <span className="relative transition-transform duration-300 group-hover:rotate-12">
            {isOpen ? "×" : "✦"}
          </span>

          {!isOpen && (
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full border border-amber-200/20 bg-slate-950/95 px-4 py-2 text-sm font-medium text-amber-100 shadow-lg backdrop-blur-md">
              Want a hint?
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
