"use client";
import { MAX_NAME_LENGTH, validPlayers } from "@/lib/players";
export default function PlayersEditor({
  players,
  onChange,
  minimum = 2,
}: {
  players: string[];
  onChange: (players: string[]) => void;
  minimum?: number;
}) {
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>Quem vai jogar?</h2>
        <span>{players.length}/20</span>
      </div>
      <div className="player-list">
        {players.map((name, index) => (
          <div className="player-row" key={index}>
            <span className="avatar">{index + 1}</span>
            <input
              aria-label={`Nome do jogador ${index + 1}`}
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(event) =>
                onChange(
                  players.map((value, i) =>
                    i === index ? event.target.value : value,
                  ),
                )
              }
            />
            <button
              type="button"
              aria-label={`Remover jogador ${index + 1}`}
              disabled={players.length <= minimum}
              onClick={() => onChange(players.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        className="add-player"
        disabled={players.length >= 20}
        onClick={() => {
          let number = players.length + 1;
          while (players.includes(`Jogador ${number}`)) number++;
          onChange([...players, `Jogador ${number}`]);
        }}
      >
        ＋ Adicionar jogador
      </button>
      {!validPlayers(players, minimum) && (
        <p className="form-error" role="status">
          Use nomes diferentes, com 1 a 24 caracteres, para pelo menos {minimum}{" "}
          jogadores.
        </p>
      )}
    </section>
  );
}
