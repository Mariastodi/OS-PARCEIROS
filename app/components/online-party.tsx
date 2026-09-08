"use client";

import { Trophy } from "lucide-react";
import type { RoomView } from "@/lib/game";
import {
  partyGames,
  remainingSeconds,
  roundScore,
  type PartyGame,
} from "@/lib/party";
import { categories } from "@/lib/words";
import { multiWord } from "@/lib/party-engine";
import { useTilt } from "../hooks/use-tilt";
import HeadsRound from "./games/heads-round";

export default function OnlineParty({
  room,
  busy,
  now,
  action,
  error,
}: {
  error: string;
  room: RoomView;
  busy: boolean;
  now: number;
  action: (action: string, data?: Record<string, unknown>) => Promise<void>;
}) {
  const game = room.game as PartyGame;
  const info = partyGames[game];
  const match = room.party;
  const host = room.me === room.host;
  const active = match?.activePlayer === room.me;
  const player = room.players.find(
    (player) => player.id === match?.activePlayer,
  );
  const move = (move: string, correct?: boolean) =>
    action("party", {
      move,
      correct,
      round: room.round,
      turn: match?.turn,
      cursor: match?.cursor,
    });
  const tilt = useTilt(
    game === "heads" && active && match?.phase === "playing" && !busy,
    (answer) => {
      void move("answer", answer === "correct");
    },
  );
  if (
    game === "heads" &&
    active &&
    match &&
    ["countdown", "playing"].includes(match.phase)
  ) {
    const deck = Array.from({ length: match.cursor + 1 }, (_, index) =>
      index === match.cursor ? (match.word ?? "Prepare-se") : "",
    );
    return (
      <div className="heads-immersive online-heads">
        {error && (
          <p className="heads-network-error" role="alert">
            {error}
          </p>
        )}
        <HeadsRound
          match={{ ...match, deck }}
          now={now}
          seconds={remainingSeconds(match.deadline, now)}
          onAnswer={(correct) => {
            void move("answer", correct);
          }}
          onExit={() => {
            void move("end");
          }}
          disabled={busy || match.phase === "countdown"}
          exitLabel="Encerrar minha vez"
        />
      </div>
    );
  }
  if (room.phase === "lobby")
    return (
      <>
        <span className="eyebrow">{info.title}</span>
        <h2>Preparem a partida</h2>
        <p>{info.instruction}</p>
        <p>
          Joguem juntos no mesmo ambiente ou em uma chamada. Cada pessoa
          controla sua vez no próprio celular. O anfitrião passa para a próxima
          pessoa.
        </p>
        {multiWord(game) && (
          <>
            <label htmlFor="online-category">Categoria</label>
            <select
              id="online-category"
              disabled={busy || !host}
              value={room.category}
              onChange={(event) =>
                action("settings", {
                  category: event.target.value,
                  duration: room.duration,
                })
              }
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <label htmlFor="online-duration">Tempo por pessoa</label>
            <select
              id="online-duration"
              disabled={busy || !host}
              value={room.duration}
              onChange={(event) =>
                action("settings", {
                  category: room.category,
                  duration: Number(event.target.value),
                })
              }
            >
              {[30, 60, 90].map((duration) => (
                <option key={duration} value={duration}>
                  {duration} segundos
                </option>
              ))}
            </select>
          </>
        )}
        {host ? (
          <button
            className="primary wide"
            disabled={busy || room.players.length < 2}
            onClick={() => action("start")}
          >
            Começar partida
          </button>
        ) : (
          <p>Aguarde o anfitrião começar.</p>
        )}
        <p className="hint">De 2 a 20 jogadores. Uma vez para cada pessoa.</p>
      </>
    );
  if (!match) return <p>Aguardando a partida.</p>;
  const ranking = match.players
    .map((name, index) => ({ name, score: match.scores[index] }))
    .sort((a, b) => b.score - a.score);
  const winners = ranking.filter((player) => player.score === ranking[0].score);
  return (
    <div className="online-party">
      <span className="eyebrow">{info.title}</span>
      {match.phase === "results" ? (
        <>
          <div className="voting-winner">
            <Trophy size={64} aria-hidden="true" />
            <span className="eyebrow">
              {ranking[0].score === 0
                ? "PARTIDA ENCERRADA"
                : winners.length > 1
                  ? "VITÓRIA COMPARTILHADA"
                  : "CAMPEÃO DA PARTIDA"}
            </span>
            <h2>
              {ranking[0].score === 0
                ? "Todo mundo empatou"
                : winners.map((player) => player.name).join(" e ")}
            </h2>
          </div>
          <ol className="voting-ranking">
            {ranking.map((player) => (
              <li key={player.name}>
                <strong>{player.name}</strong>
                <span>{player.score} pontos</span>
              </li>
            ))}
          </ol>
          {host && (
            <button
              className="primary wide"
              disabled={busy}
              onClick={() => action("reset")}
            >
              Jogar novamente
            </button>
          )}
        </>
      ) : (
        <>
          <h2>{active ? "Sua vez" : `Vez de ${player?.name}`}</h2>
          {match.phase === "ready" && (
            <>
              <p>{info.instruction}</p>
              {active && (
                <>
                  {game === "heads" && (
                    <>
                      <button
                        className="secondary"
                        onClick={tilt.enabled ? tilt.disable : tilt.enable}
                      >
                        {tilt.enabled
                          ? "Desativar movimentos"
                          : "Ativar movimentos"}
                      </button>
                      <p role="status">{tilt.status}</p>
                    </>
                  )}
                  <button
                    className="primary wide"
                    disabled={busy}
                    onClick={() => move("start")}
                  >
                    Estou pronto
                  </button>
                </>
              )}
              {!active && <p>Aguarde essa pessoa começar.</p>}
            </>
          )}
          {match.phase === "countdown" && (
            <p role="timer">
              Começa em {remainingSeconds(match.deadline, now)} segundos
            </p>
          )}
          {match.phase === "playing" && (
            <>
              <p role="timer">
                {remainingSeconds(match.deadline, now)} segundos
              </p>
              <h3 className="online-prompt">
                {match.word ?? "Acompanhe a mímica e tente adivinhar."}
              </h3>
              {active && (
                <>
                  <div className="answer-actions">
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => move("answer", false)}
                    >
                      Passar
                    </button>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => move("answer", true)}
                    >
                      Acertou
                    </button>
                  </div>
                  <button
                    className="back"
                    disabled={busy}
                    onClick={() => move("end")}
                  >
                    Encerrar minha vez
                  </button>
                </>
              )}
            </>
          )}
          {match.phase === "review" && (
            <>
              <h3>{roundScore(match.answers)} pontos nesta vez</h3>
              {!multiWord(game) && !match.graded ? (
                active ? (
                  <>
                    <p>A turma confirma: conseguiu dentro do tempo?</p>
                    <div className="answer-actions">
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() => move("answer", false)}
                      >
                        Não
                      </button>
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() => move("answer", true)}
                      >
                        Sim
                      </button>
                    </div>
                  </>
                ) : (
                  <p>Aguardando a confirmação da pessoa da vez.</p>
                )
              ) : (
                <>
                  <ul className="voting-ranking">
                    {match.answers.map((answer, index) => (
                      <li key={index}>
                        <strong>{answer.word}</strong>
                        <span>
                          {answer.correct
                            ? "Acertou"
                            : answer.timedOut
                              ? "Sem resposta"
                              : "Passou"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {host ? (
                    <button
                      className="primary wide"
                      disabled={busy}
                      onClick={() => move("next")}
                    >
                      {match.turn + 1 === match.players.length
                        ? "Ver placar"
                        : "Próxima pessoa"}
                    </button>
                  ) : (
                    <p>Aguarde o anfitrião continuar.</p>
                  )}
                </>
              )}
            </>
          )}
          {host && (
            <button
              className="back"
              disabled={busy}
              onClick={() => action("cancel")}
            >
              Cancelar partida
            </button>
          )}
        </>
      )}
    </div>
  );
}
