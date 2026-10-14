"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoomScene from "@/components/game/RoomScene";
import type { RoomObjectId } from "@/components/game/RoomObjects";
import { authHeaders, AUTH_TOKEN_KEY } from "@/lib/auth";
import GameMaster from "@/components/game/GameMaster";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const OBJECT_CLUES: Record<
  string,
  { id: string; title: string; text: string }
> = {
  grandfather_clock: {
    id: "clock_time_1145",
    title: "The Stopped Clock",
    text: "The clock stopped at 11:45.",
  },
  diary: {
    id: "diary_message",
    title: "A Note in the Diary",
    text: "The diary confirms that the clock's frozen time.",
  },
  bookshelf: {
    id: "bookshelf_sequence",
    title: "The Marked Books",
    text: "A sequence marked behind the books reads 7-3-9-2.",
  },
};

type GameObject = {
  id: RoomObjectId;
  name?: string;
  description?: string;
};

type GameData = {
  session_id?: string;
  status?: string;
  game_completed?: boolean;
  time_remaining?: number;
  discovered_objects?: string[];
  discovered_clues?: string[];
  solved_puzzles?: string[];
  current_room?: string;
  room?: { objects?: GameObject[] };
  room_state?: { objects?: GameObject[] };
  [key: string]: unknown;
};

type RoomData = { objects?: GameObject[] };

async function fetchGameState(sessionId: string) {
  const response = await fetch(
    `${API_URL}/game/${encodeURIComponent(sessionId)}`,
    { cache: "no-store", headers: authHeaders() }
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || `Unable to load game (HTTP ${response.status}).`
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error("The server returned an invalid game response.");
  }

  const payload = data.game ? { ...data, ...data.game } : data;
  const game = payload as GameData;
  let room: RoomData | null = null;

  if (game.status !== "completed" && game.current_room) {
    const roomResponse = await fetch(
      `${API_URL}/game/${encodeURIComponent(sessionId)}/room`,
      { cache: "no-store", headers: authHeaders() }
    );
    const roomData = await roomResponse.json().catch(() => null);

    if (!roomResponse.ok) {
      throw new Error(
        roomData?.detail ||
          `Unable to load the room (HTTP ${roomResponse.status}).`
      );
    }

    room = roomData as RoomData;
  }

  return { game, room };
}

export default function GamePage() {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [game, setGame] = useState<GameData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [selectedObject, setSelectedObject] =
    useState<GameObject | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Retrieve the game session created by the home page.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
        router.replace("/auth");
        return;
      }
      const savedSessionId = localStorage.getItem("veylora_session_id");
      await Promise.resolve();

      if (!active) return;

      if (!savedSessionId) {
        setError("No game session found. Please start a new game.");
        setLoading(false);
        return;
      }

      setSessionId(savedSessionId);
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [router]);

  // Load the current game session from FastAPI.
  const loadGame = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { game: updatedGame, room: updatedRoom } =
        await fetchGameState(sessionId);

      setError("");
      setGame(updatedGame);
      setRoom(updatedRoom);

      if (typeof updatedGame.time_remaining === "number") {
        setTimeRemaining(
          Math.max(0, Math.floor(updatedGame.time_remaining))
        );
      }

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the game server."
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const isPlaying = game?.status === "playing";

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setTimeRemaining((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    const loadInitialGame = async () => {
      try {
        const { game: updatedGame, room: updatedRoom } =
          await fetchGameState(sessionId);

        if (!active) return;

        setError("");
        setGame(updatedGame);
        setRoom(updatedRoom);

        if (typeof updatedGame.time_remaining === "number") {
          setTimeRemaining(
            Math.max(0, Math.floor(updatedGame.time_remaining))
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the game server."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInitialGame();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const interact = async (object: GameObject) => {
    if (!sessionId) {
      setMessage("Game session not found. Please start a new game.");
      return;
    }

    try {
      setMessage(`Investigating ${object.name}...`);

      const response = await fetch(
        `${API_URL}/game/${encodeURIComponent(sessionId)}/interact/${encodeURIComponent(object.id)}`,
        {
          method: "POST",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail ?? data.message ?? "Unable to investigate this object.");
        return;
      }

      const clue = OBJECT_CLUES[object.id];
      setSelectedObject({
        ...(data.object ?? object),
        ...(clue ? { description: clue.text } : {}),
      });
      setMessage(
        clue
          ? `${clue.title} added to your clue journal.`
          : data.message ?? "Object discovered."
      );

      await loadGame();
    } catch (error) {
      console.error("[Veylora] Object interaction failed:", error);
      setMessage("Could not connect to the game server. Please try again.");
    }
  };

  const selectObject = (id: RoomObjectId) => {
    const object = objects.find((item) => item.id === id);
    const selected: GameObject = object ?? {
      id,
      name: id.replaceAll("_", " "),
      description: "You examine this object for clues.",
    };

    void interact(selected);
  };

  const solvePuzzle = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!sessionId || !selectedObject || !answer.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/puzzles/${encodeURIComponent(sessionId)}/${encodeURIComponent(selectedObject.id)}/solve`,
        {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            answer: answer.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(
          data?.detail || "That answer didn't work. Try again."
        );
        return;
      }

      setMessage(data?.message || "Answer submitted.");
      if (data?.correct) {
        setAnswer("");
        await loadGame();
      }
    } catch {
      setMessage("Could not submit your answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const tryExitDoor = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(
        `${API_URL}/game/${encodeURIComponent(sessionId)}/exit`,
        { method: "POST", headers: authHeaders() }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(data?.detail || "The exit is still locked.");
        return;
      }

      setMessage(data?.message || "You escaped!");
      await loadGame();
    } catch {
      setMessage("Could not use the exit door.");
    }
  };

  // Loading screen.
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101522] text-white">
        <div className="px-6 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-amber-400" />
          <p className="text-sm tracking-[0.25em] text-amber-300">
            PREPARING YOUR ESCAPE ROOM...
          </p>
          <p className="mt-3 text-sm text-white/50">
            Unlocking the secrets of the forgotten study.
          </p>
        </div>
      </main>
    );
  }

  // Error screen.
  if (error || !game) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101522] p-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <p className="mb-3 text-xs tracking-[0.3em] text-amber-300">
            VEYLORA
          </p>
          <h1 className="mb-3 text-2xl font-bold">
            Unable to load Veylora
          </h1>
          <p className="mb-6 text-sm leading-6 text-white/70">
            {error || "The game session could not be found."}
          </p>

          {sessionId && (
            <button
              onClick={() => void loadGame()}
              className="mr-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300"
            >
              Try again
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("veylora_session_id");
              router.push("/");
            }}
            className="mt-2 rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Start a new game
          </button>
        </div>
      </main>
    );
  }

  const discovered = game.discovered_objects ?? [];
  const discoveredClues = game.discovered_clues ?? [];

  const doorOpen =
    game.status === "completed" ||
    game.status === "escaped" ||
    game.game_completed === true;

  const objects = room?.objects ?? [];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <main className="relative h-dvh min-h-[600px] w-full overflow-hidden bg-[#101522] text-white">
      {/* Interactive isometric room */}
      <div className="absolute inset-0">
        
<RoomScene
  onSelectObject={selectObject}
  discovered={discovered}
  doorOpen={doorOpen}
/>

<GameMaster />

      </div>

      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent p-4 sm:p-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-amber-300">
            VEYLORA
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-3xl">
            The Forgotten Room
          </h1>
          <p className="mt-1 text-xs text-white/60 sm:text-sm">
            Explore. Discover clues. Find your way out.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-right shadow-xl backdrop-blur-md">
          <p className="text-[10px] tracking-[0.2em] text-white/60">
            TIME REMAINING
          </p>
          <p
            className={`mt-1 font-mono text-xl font-bold sm:text-2xl ${
              timeRemaining <= 60 ? "text-red-400" : "text-amber-300"
            }`}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>
      </header>

      {/* Exploration panel */}
      <section className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-3 sm:p-6">
        <div className="pointer-events-auto w-full max-w-sm">
          {message && (
            <div
              role="status"
              className="mb-2 w-fit max-w-full rounded-xl border border-amber-300/20 bg-[#171b27]/95 px-3 py-2 text-xs text-white shadow-xl"
            >
              {message}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-black/65 p-2.5 text-white shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-white/70">
                {discovered.length}/{objects.length} objects · {discoveredClues.length} clues
              </span>
              <button
                type="button"
                onClick={() => setJournalOpen((open) => !open)}
                aria-expanded={journalOpen}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
              >
                {journalOpen ? "Close journal" : "Journal & objects"}
              </button>
            </div>

            {journalOpen && (
              <div className="mt-2 max-h-[35dvh] space-y-3 overflow-y-auto border-t border-white/10 pt-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber-200">
                    CLUE JOURNAL
                  </p>
                  {discoveredClues.length === 0 ? (
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      Inspect the clock, diary, and bookshelf to uncover clues.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {discoveredClues.map((clueId) => {
                        const clue = Object.values(OBJECT_CLUES).find(
                          (entry) => entry.id === clueId
                        );

                        if (!clue) return null;

                        return (
                          <li
                            key={clue.id}
                            className="rounded-lg border border-amber-200/15 bg-amber-200/[0.06] px-2.5 py-2"
                          >
                            <p className="text-xs font-semibold text-amber-100">
                              {clue.title}
                            </p>
                            <p className="mt-0.5 text-xs leading-5 text-white/80">
                              {clue.text}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {objects.map((object) => {
                    const isDiscovered = discovered.includes(object.id);

                    return (
                      <button
                        key={object.id}
                        type="button"
                        onClick={() => selectObject(object.id)}
                        aria-label={`Inspect ${object.name || object.id.replaceAll("_", " ")}`}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition hover:border-amber-200/60 hover:bg-amber-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${
                          isDiscovered
                            ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                            : "border-white/10 bg-white/5 text-white/65"
                        }`}
                      >
                        {object.name || object.id.replaceAll("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Object inspection */}
      {selectedObject && (
        <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <section className="my-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#171b27] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.25em] text-amber-300">
                  OBJECT INSPECTION
                </p>
                <h2 className="mt-2 text-2xl font-bold capitalize">
                  {(selectedObject.name || selectedObject.id).replaceAll(
                    "_",
                    " "
                  )}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedObject(null);
                  setMessage("");
                }}
                aria-label="Close object panel"
                className="rounded-lg px-3 py-2 text-xl text-white/60 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/70">
              {selectedObject.description ||
                "Inspect this object carefully. It may contain a clue."}
            </p>

            {["safe", "locked_drawer"].includes(selectedObject.id) && (
              <form onSubmit={solvePuzzle} className="mt-5 space-y-3">
                <label
                  htmlFor="puzzle-answer"
                  className="block text-sm font-medium text-white/80"
                >
                  Enter the combination
                </label>

                <input
                  id="puzzle-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Enter the 4-digit code from your clues"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-amber-300"
                />

                <p className="text-xs leading-5 text-white/60">
                  {selectedObject.id === "locked_drawer"
                    ? "Find the clock and diary clues before trying the drawer."
                    : "Find the bookshelf clue and the small key from the drawer before trying the safe."}
                </p>

                <button
                  type="submit"
                  disabled={submitting || !answer.trim()}
                  className="w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Checking..." : "Submit answer"}
                </button>
              </form>
            )}

            {selectedObject.id === "exit_door" && (
              <button
                onClick={() => void tryExitDoor()}
                className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black hover:bg-amber-300"
              >
                Try the exit door
              </button>
            )}

            {message && (
              <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-amber-100">
                {message}
              </p>
            )}
          </section>
        </div>
      )}

      {/* Escape success */}
      {doorOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-6 backdrop-blur-md">
          <div className="max-w-md text-center">
            <p className="text-sm tracking-[0.35em] text-amber-300">
              ESCAPE SUCCESSFUL
            </p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              You made it out.
            </h2>
            <p className="mt-4 text-white/70">
              You solved the room&apos;s mysteries and found your way to freedom.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("veylora_session_id");
                router.push("/");
              }}
              className="mt-7 rounded-xl bg-amber-400 px-6 py-3 font-bold text-black hover:bg-amber-300"
            >
              Return to Veylora
            </button>
          </div>
        </div>
      )}
    </main>
  );
}