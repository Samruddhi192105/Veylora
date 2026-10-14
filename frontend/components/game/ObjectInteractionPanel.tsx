
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LockKeyhole, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { RoomObjectId } from "./RoomObjects";

export type InteractionObject = {
  id: string;
  name: string;
  description: string;
};

type ObjectInteractionPanelProps = {
  selectedObject: InteractionObject | null;
  onClose: () => void;
  onSubmit: (objectId: RoomObjectId, answer: string) => void;
  message?: string;
  loading?: boolean;
};

export default function ObjectInteractionPanel({
  selectedObject,
  onClose,
  onSubmit,
  message = "",
  loading = false,
}: ObjectInteractionPanelProps) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [selectedObject?.id]);

  const isPuzzle =
    selectedObject?.id === "locked_drawer" ||
    selectedObject?.id === "safe";

  const isValidObject = (
    id: string
  ): id is RoomObjectId =>
    [
      "grandfather_clock",
      "old_painting",
      "diary",
      "bookshelf",
      "locked_drawer",
      "safe",
      "telephone",
      "exit_door",
    ].includes(id);

  return (
    <AnimatePresence>
      {selectedObject && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="object-panel-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#11151e] p-5 text-white shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
                  Investigation
                </p>

                <h2
                  id="object-panel-title"
                  className="mt-2 font-serif text-2xl sm:text-3xl"
                >
                  {selectedObject.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close investigation"
                className="rounded-full border border-white/10 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/65">
              {selectedObject.description}
            </p>

            {isPuzzle && (
              <form
                className="mt-6 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!answer.trim() || !isValidObject(selectedObject.id)) {
                    return;
                  }

                  onSubmit(selectedObject.id, answer.trim());
                }}
              >
                <label
                  htmlFor="puzzle-answer"
                  className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/55"
                >
                  <LockKeyhole size={14} />
                  Enter combination
                </label>

                <input
                  id="puzzle-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  autoComplete="off"
                  placeholder={
                    selectedObject.id === "locked_drawer"
                      ? "Enter drawer combination"
                      : "Enter safe combination"
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-amber-200/50"
                />

                <button
                  type="submit"
                  disabled={loading || !answer.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-100 px-4 py-3 text-sm font-medium text-[#17130d] transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LockKeyhole size={16} />
                  {loading ? "Checking..." : "Try Combination"}
                </button>
              </form>
            )}

            {message && (
              <div
                aria-live="polite"
                className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white/75"
              >
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-200"
                />
                <p>{message}</p>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
            >
              Return to room
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
