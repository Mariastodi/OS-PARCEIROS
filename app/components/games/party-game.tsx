"use client";
import { GameIcon } from "../icons";
import { useEffect, useReducer, useState } from "react";
import { categories, poolFor, shuffle } from "@/lib/words";
import {
  challengePrompts,
  fivePrompts,
  likelyPrompts,
  partyGames,
  remainingSeconds,
  roundScore,
  type PartyGame,
} from "@/lib/party";
import {
  matchReducer,
  multiWord,
  newMatch,
  totalTurns,
  type Match,
} from "@/lib/party-engine";
import { playerName, validPlayers } from "@/lib/players";
import { useTilt } from "@/app/hooks/use-tilt";
import PlayersEditor from "../players-editor";
import ConfirmExit from "../confirm-exit";
import GameHeader from "../game-header";

export default function PartySetup({
  game,
  onBack,
}: {
  game: PartyGame;
  onBack: () => void;
}) {
  const info = partyGames[game];
  const [players, setPlayers] = useState([
    "Jogador 1",
    "Jogador 2",
    "Jogador 3",
  ]);
  const [duration, setDuration] = useState(info.duration);
  const [category, setCategory] = useState("Misturado");
  const [match, setMatch] = useState<Match | null>(null);
  if (match)
    return (
      <PartyMatch
        initial={match}
        onBack={onBack}
        onReplay={() => setMatch(null)}
      />
    );
  function start() {
    if (!validPlayers(players)) return;
    const prompts =
      game === "likely"
        ? likelyPrompts
        : game === "challenge"
          ? challengePrompts
          : game === "five"
            ? fivePrompts
            : poolFor(category);
    setMatch(
      newMatch(
        game,
        players.map((name) => playerName(name, "")),
        shuffle(prompts),
        duration,
      ),
    );
  }
  return (
    <main className="app-shell setup-page">
      <GameHeader onBack={onBack} subtitle={info.title} />
      <section className="setup-wrap">
        <button className="back" onClick={onBack}>
          ← Todos os jogos
        </button>
        <div className="setup-heading">
          <div>
            <span className="eyebrow">JOGUEM NO MESMO CELULAR</span>
            <h1>{info.title}</h1>
            <p>{info.description}</p>
          </div>
          <span className="game-symbol">
            <GameIcon game={game} size={60} />
          </span>
        </div>
        <div className="setup-grid">
          <PlayersEditor players={players} onChange={setPlayers} />
          <section className="panel settings-panel">
            <h2>Como jogar</h2>
            <p>{info.instruction}</p>
            {multiWord(game) && (
              <>
                <label htmlFor="party-category">Categoria</label>
                <select
                  id="party-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <label htmlFor="party-duration">Tempo por jogador</label>
                <select
                  id="party-duration"
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                >
                  {[30, 60, 90].map((value) => (
                    <option key={value} value={value}>
                      {value} segundos
                    </option>
                  ))}
                </select>
              </>
            )}
            <p className="hint">
              {game === "likely"
                ? "10 perguntas por partida. O placar registra as indicações da turma."
                : `Uma vez para cada jogador · ${duration} segundos por vez.`}
            </p>
            <button
              className="primary wide"
              disabled={!validPlayers(players)}
              onClick={start}
            >
              Preparar partida <span>→</span>
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
function PartyMatch({
  initial,
  onBack,
  onReplay,
}: {
  initial: Match;
  onBack: () => void;
  onReplay: () => void;
}) {
  const [match, dispatch] = useReducer(matchReducer, initial);
  const [now, setNow] = useState(() => Date.now());
  const [exitOpen, setExitOpen] = useState(false);
  const info = partyGames[match.game];
  const multiple = multiWord(match.game);
  const heads = match.game === "heads";
  const player = match.players[match.turn % match.players.length];
  const seconds = remainingSeconds(match.deadline, now);
  const tilt = useTilt(
    heads && match.phase === "playing" && !exitOpen,
    (action) =>
      dispatch({
        type: "answer",
        correct: action === "correct",
        now: Date.now(),
      }),
  );
  useEffect(() => {
    if (
      !["countdown", "playing"].includes(match.phase) ||
      match.game === "likely"
    )
      return;
    const tick = () => {
      const now = Date.now();
      setNow(now);
      dispatch({ type: "tick", now });
    };
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [match.phase, match.game]);
  function act(type: "start" | "end" | "next") {
    const now = Date.now();
    setNow(now);
    dispatch({ type, now });
  }
  const answer = (correct: boolean) =>
    dispatch({ type: "answer", correct, now: Date.now() });
  const ranking = match.players
    .map((name, i) => ({ name, score: match.scores[i] }))
    .sort((a, b) => b.score - a.score);
  return (
    <main
      className={`party-surface ${heads && match.phase === "playing" ? "heads-active" : ""}`}
    >
      <GameHeader
        onBack={() =>
          match.phase === "results" ? onBack() : setExitOpen(true)
        }
        subtitle={info.title}
      />
      <section className="party-stage">
        <div className="party-meta">
          <span>
            <GameIcon game={match.game} size={18} /> {info.title}
          </span>
          <span>
            {match.phase === "results"
              ? "Placar final"
              : `${match.game === "likely" ? "Pergunta" : "Vez"} ${match.turn + 1} de ${totalTurns(match)}`}
          </span>
        </div>
        {match.phase === "ready" && (
          <div className="party-center">
            <span className="eyebrow">
              {match.game === "likely"
                ? "TODO MUNDO PARTICIPA"
                : "PASSE O CELULAR PARA"}
            </span>
            <h1>
              {match.game === "likely" ? "Em quem vocês vão votar?" : player}
            </h1>
            <p>{info.instruction}</p>
            {heads && (
              <div className="motion-settings">
                <button
                  className="secondary"
                  onClick={tilt.enabled ? tilt.disable : tilt.enable}
                >
                  {tilt.enabled ? "Desativar movimentos" : "Ativar movimentos"}
                </button>
                <p role="status">{tilt.status}</p>
              </div>
            )}
            <button className="primary" onClick={() => act("start")}>
              {match.game === "likely"
                ? "Mostrar pergunta"
                : "Estou pronto — começar"}
            </button>
          </div>
        )}
        {match.phase === "countdown" && (
          <div className="party-center">
            <span className="eyebrow">
              {heads ? "CELULAR NA TESTA · TELA PARA A TURMA" : "PREPARE-SE"}
            </span>
            <h1 className="countdown" aria-live="polite">
              {seconds || 1}
            </h1>
            <p>{player}, já vai começar!</p>
          </div>
        )}
        {match.phase === "playing" && (
          <div className="party-center">
            {match.game !== "likely" && (
              <div
                className={`clock-pill ${seconds <= 5 ? "urgent" : ""}`}
                role="timer"
              >
                {seconds}s <span>· {player}</span>
              </div>
            )}
            <span className="eyebrow">
              {match.game === "likely"
                ? "QUEM É MAIS PROVÁVEL…"
                : match.game === "five"
                  ? "DIGA 3…"
                  : match.game === "challenge"
                    ? "SUA MISSÃO"
                    : heads
                      ? "QUEM SOU EU?"
                      : "FAÇA A MÍMICA"}
            </span>
            <h1 className={`prompt-word ${multiple ? "large-word" : ""}`}>
              {match.deck[match.cursor]}
            </h1>
            {match.game === "likely" ? (
              <>
                <p>Apontem juntos. Registrem quem recebeu mais votos.</p>
                <div className="vote-grid">
                  {match.players.map((name, i) => (
                    <button
                      className="primary"
                      key={i}
                      onClick={() =>
                        dispatch({ type: "vote", player: i, now: Date.now() })
                      }
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <button
                  className="secondary"
                  onClick={() =>
                    dispatch({ type: "vote", player: null, now: Date.now() })
                  }
                >
                  Empate / ninguém
                </button>
              </>
            ) : (
              <>
                <div className="answer-actions">
                  <button className="secondary" onClick={() => answer(false)}>
                    ↓ Passar
                  </button>
                  <button className="primary" onClick={() => answer(true)}>
                    ↑ Acertou
                  </button>
                </div>
                {multiple && (
                  <p className="round-score">
                    {roundScore(match.answers)} acertos ·{" "}
                    {match.answers.length - roundScore(match.answers)} passadas
                  </p>
                )}
                {heads && <p className="sensor-status">{tilt.status}</p>}
                <button className="back light-back" onClick={() => act("end")}>
                  Encerrar esta vez
                </button>
              </>
            )}
          </div>
        )}
        {match.phase === "review" && (
          <div className="party-center">
            <span className="eyebrow">
              {match.game === "likely"
                ? "INDICAÇÃO REGISTRADA"
                : `VEZ DE ${player}`}
            </span>
            <h1>
              {match.game === "likely"
                ? match.vote === null
                  ? "Deu empate!"
                  : match.players[match.vote]
                : multiple
                  ? `${roundScore(match.answers)} acerto${roundScore(match.answers) === 1 ? "" : "s"}!`
                  : match.graded
                    ? match.answers[0]?.correct
                      ? "Ponto garantido!"
                      : "Valeu a tentativa!"
                    : "Tempo encerrado!"}
            </h1>
            {!multiple && match.game !== "likely" && !match.graded ? (
              <>
                <p>A turma confirma: cumpriu a missão dentro do tempo?</p>
                <p className="review-prompt">
                  {match.game === "five" ? "Diga 3: " : ""}
                  {match.deck[match.cursor]}
                </p>
                <div className="answer-actions">
                  <button className="secondary" onClick={() => answer(false)}>
                    Não / passou
                  </button>
                  <button className="primary" onClick={() => answer(true)}>
                    Sim, conseguiu
                  </button>
                </div>
              </>
            ) : (
              <>
                {match.answers.length > 0 && (
                  <ul className="answers-list">
                    {match.answers.map((answer, i) => (
                      <li key={i}>
                        <span>{answer.word}</span>
                        <strong>
                          {answer.correct
                            ? "✓ Acertou"
                            : answer.timedOut
                              ? "◷ Sem resposta"
                              : "↷ Passou"}
                        </strong>
                      </li>
                    ))}
                  </ul>
                )}
                <button className="primary" onClick={() => act("next")}>
                  {match.turn + 1 >= totalTurns(match) ||
                  match.cursor >= match.deck.length
                    ? "Ver placar"
                    : "Próxima vez →"}
                </button>
              </>
            )}
          </div>
        )}
        {match.phase === "results" && (
          <div className="party-center">
            <span className="eyebrow">
              {match.game === "likely"
                ? "AS ESCOLHAS DA TURMA"
                : "PARTIDA ENCERRADA"}
            </span>
            <h1>
              {match.game === "likely"
                ? "Quem foi mais indicado?"
                : "Olha esse placar!"}
            </h1>
            <ol className="scoreboard">
              {ranking.map(({ name, score }, i) => (
                <li key={name}>
                  <span>{i + 1}</span>
                  <strong>{name}</strong>
                  <b>
                    {score}{" "}
                    {match.game === "likely"
                      ? score === 1
                        ? "indicação"
                        : "indicações"
                      : score === 1
                        ? "pt"
                        : "pts"}
                  </b>
                </li>
              ))}
            </ol>
            <div className="answer-actions">
              <button className="secondary" onClick={onBack}>
                Todos os jogos
              </button>
              <button className="primary" onClick={onReplay}>
                Jogar novamente
              </button>
            </div>
          </div>
        )}
      </section>
      {exitOpen && (
        <ConfirmExit onCancel={() => setExitOpen(false)} onExit={onBack} />
      )}
    </main>
  );
}
