"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { Match } from "@/lib/party-engine";

export default function HeadsRound({
  match,
  now,
  seconds,
  onAnswer,
  onExit,
  disabled = false,
  exitLabel = "Sair da partida",
}: {
  match: Match;
  now: number;
  seconds: number;
  onAnswer: (correct: boolean) => void;
  onExit: () => void;
  disabled?: boolean;
  exitLabel?: string;
}) {
  const preparing = match.phase === "countdown";
  const lastAnswer = match.answers.at(-1);
  const feedback = !preparing && now - match.lastAnswer < 400 && lastAnswer;
  const word = feedback ? lastAnswer.word : match.deck[match.cursor];

  return (
    <section
      className={`heads-round ${feedback ? (lastAnswer.correct ? "heads-correct" : "heads-pass") : ""}`}
      aria-label="Quem sou eu?"
    >
      <div className="heads-toolbar">
        <button
          className="heads-control"
          aria-label={exitLabel}
          disabled={disabled}
          onClick={onExit}
        >
          <X aria-hidden="true" size={24} />
        </button>
        {!preparing && (
          <span
            className="heads-timer"
            role="timer"
            aria-label={`${seconds} segundos restantes`}
          >
            {seconds}s
          </span>
        )}
      </div>
      <h1 className="heads-word">{preparing ? seconds || 1 : word}</h1>
      <span className="sr-only" role="status">
        {feedback ? (lastAnswer.correct ? "Acertou" : "Passou") : ""}
      </span>
      {!preparing && (
        <div className="heads-controls">
          <button
            className="heads-control"
            aria-label="Passar palavra"
            disabled={disabled}
            onClick={() => onAnswer(false)}
          >
            <ArrowDown aria-hidden="true" size={28} />
          </button>
          <button
            className="heads-control"
            aria-label="Marcar acerto"
            disabled={disabled}
            onClick={() => onAnswer(true)}
          >
            <ArrowUp aria-hidden="true" size={28} />
          </button>
        </div>
      )}
    </section>
  );
}
