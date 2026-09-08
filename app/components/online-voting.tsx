"use client";

import { Trophy, Check } from "lucide-react";
import type { RoomView } from "@/lib/game";

export default function OnlineVoting({
  room,
  busy,
  action,
}: {
  room: RoomView;
  busy: boolean;
  action: (action: string, data?: Record<string, unknown>) => Promise<void>;
}) {
  const voting = room.voting!;
  const host = room.me === room.host;
  const highest = voting.results[0]?.votes ?? 0;
  const winners = voting.results.filter((player) => player.votes === highest);
  return (
    <div className="online-voting">
      <span className="eyebrow">QUEM É MAIS PROVÁVEL?</span>
      {room.phase === "lobby" && (
        <>
          <h2>Uma pergunta. Um voto por pessoa.</h2>
          <p>
            Escolha quem mais combina com a pergunta, inclusive você. O
            resultado aparece quando todos votarem. Os votos individuais ficam
            em segredo.
          </p>
          {host ? (
            <button
              className="primary wide"
              disabled={busy || room.players.length < 2}
              onClick={() => action("start")}
            >
              Começar votação
            </button>
          ) : (
            <p>Aguarde o anfitrião começar.</p>
          )}
          <p className="hint">
            De 2 a 20 jogadores. Cada rodada traz uma nova pergunta.
          </p>
        </>
      )}
      {room.phase === "playing" && (
        <>
          <h2>{voting.question}</h2>
          <p role="status">
            {voting.count} de {room.players.length} votos recebidos
          </p>
          {voting.myVote ? (
            <div className="vote-confirmation">
              <Check aria-hidden="true" />
              <strong>Voto registrado</strong>
              <p>
                Aguardando a turma. O resultado aparece aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="online-ballot">
              {room.players.map((player) => (
                <button
                  key={player.id}
                  className="primary"
                  disabled={busy}
                  onClick={() =>
                    action("vote", { playerId: player.id, round: room.round })
                  }
                >
                  {player.name}
                  {player.id === room.me ? " (você)" : ""}
                </button>
              ))}
            </div>
          )}
          {host && (
            <button
              className="back"
              disabled={busy}
              onClick={() => action("cancel")}
            >
              Cancelar votação
            </button>
          )}
        </>
      )}
      {room.phase === "finished" && (
        <>
          <div className="voting-winner" role="status">
            <Trophy size={64} strokeWidth={1.5} aria-hidden="true" />
            <span className="eyebrow">
              {winners.length > 1 ? "EMPATE NO TOPO" : "A TURMA ESCOLHEU"}
            </span>
            <h2>{winners.map((player) => player.name).join(" e ")}</h2>
            <p>
              {highest} {highest === 1 ? "voto" : "votos"}
              {winners.length > 1 ? " para cada pessoa" : ""}
            </p>
          </div>
          <p className="voting-question">{voting.question}</p>
          <ol className="voting-ranking">
            {voting.results.map((player) => (
              <li key={player.id}>
                <strong>{player.name}</strong>
                <span>
                  {player.votes} {player.votes === 1 ? "voto" : "votos"}
                </span>
              </li>
            ))}
          </ol>
          {host ? (
            <button
              className="primary wide"
              disabled={busy}
              onClick={() => action("reset")}
            >
              Próxima pergunta
            </button>
          ) : (
            <p>Aguarde o anfitrião preparar a próxima pergunta.</p>
          )}
        </>
      )}
    </div>
  );
}
