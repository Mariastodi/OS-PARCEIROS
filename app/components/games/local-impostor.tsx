"use client";
import {
  Fingerprint,
  Mic,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { CategoryIcon } from "../icons";
import { useEffect, useMemo, useState } from "react";
import { categories, drawWord } from "@/lib/words";
import { validPlayers, playerName } from "@/lib/players";
import { balancedDraw, emptyHistory } from "@/lib/draw";
import PlayersEditor from "../players-editor";
type Screen = "setup" | "pass" | "reveal" | "ready" | "playing" | "result";
export default function LocalImpostor({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>("setup");
  const [players, setPlayers] = useState([
    "Jogador 1",
    "Jogador 2",
    "Jogador 3",
    "Jogador 4",
  ]);
  const [roleHistory, setRoleHistory] = useState(emptyHistory);
  const [starterHistory, setStarterHistory] = useState(emptyHistory);
  const [category, setCategory] = useState("Misturado");
  const [impostors, setImpostors] = useState(1);
  const [current, setCurrent] = useState(0);
  const [roles, setRoles] = useState<boolean[]>([]);
  const [secretWord, setSecretWord] = useState("");
  const [starter, setStarter] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);

  const [usedWords, setUsedWords] = useState<string[]>([]);
  useEffect(() => {
    if (screen !== "playing") return;
    const end = Date.now() + 300000;
    const timer = setInterval(
      () => setTimeLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))),
      250,
    );
    return () => clearInterval(timer);
  }, [screen]);

  const canStart =
    players.length >= 3 &&
    validPlayers(players, 3) &&
    impostors < players.length;
  const time = useMemo(
    () =>
      `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`,
    [timeLeft],
  );

  function prepareGame() {
    if (!canStart) return;
    const names = players.map((name) => playerName(name, ""));
    setPlayers(names);
    const draw = drawWord(category, usedWords);
    setSecretWord(draw.word);
    setUsedWords(draw.used);
    const ids = names.map((_, index) => String(index));
    const roles = balancedDraw(ids, impostors, roleHistory);
    const first = balancedDraw(ids, 1, starterHistory);
    setRoles(ids.map((id) => roles.selected.includes(id)));
    setRoleHistory(roles.history);
    setStarterHistory(first.history);
    setStarter(names[Number(first.selected[0])]);
    setCurrent(0);
    setTimeLeft(300);
    setScreen("pass");
  }

  function nextPlayer() {
    if (current === players.length - 1) setScreen("ready");
    else {
      setCurrent(current + 1);
      setScreen("pass");
    }
  }

  if (screen === "setup") {
    return (
      <main className="app-shell setup-page">
        <header className="topbar compact">
          <button
            className="brand"
            onClick={() => onBack()}
            aria-label="Voltar ao início"
          >
            <span className="brand-mark">P</span>
            <strong>Os Parceiros</strong>
          </button>
          <span className="step-label">Preparando a rodada</span>
        </header>
        <section className="setup-wrap">
          <button className="back" onClick={() => onBack()}>
            Voltar
          </button>
          <div className="setup-heading">
            <div>
              <span className="eyebrow">JOGO DO IMPOSTOR</span>
              <h1>Quem vai jogar?</h1>
              <p>
                Escolha quantas pessoas vão jogar e passe o celular para cada
                uma.
              </p>
            </div>
            <span className="players-badge">{players.length} jogadores</span>
          </div>
          <div className="setup-grid">
            <PlayersEditor
              players={players}
              minimum={3}
              onChange={(next) => {
                setPlayers(next);
                setRoleHistory(emptyHistory());
                setStarterHistory(emptyHistory());
                setImpostors(Math.min(impostors, next.length - 1));
              }}
            />
            <aside className="panel settings-panel">
              <label>Categoria</label>
              <div className="category-grid">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={category === item ? "selected" : ""}
                    onClick={() => setCategory(item)}
                  >
                    <CategoryIcon category={item} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
              <label>Quantidade de impostores</label>
              <div className="counter">
                <button
                  onClick={() => setImpostors(Math.max(1, impostors - 1))}
                >
                  −
                </button>
                <strong>{impostors}</strong>
                <button
                  onClick={() =>
                    setImpostors(Math.min(players.length - 1, impostors + 1))
                  }
                >
                  ＋
                </button>
              </div>
              <p className="hint">
                Para {players.length} pessoas, recomendamos{" "}
                {players.length > 7 ? 2 : 1} impostor
                {players.length > 7 ? "es" : ""}.
              </p>
              <button
                className="primary wide"
                disabled={!canStart}
                onClick={prepareGame}
              >
                Sortear papéis
              </button>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "pass" || screen === "reveal") {
    const isImpostor = roles[current];
    return (
      <main className="secret-page">
        <div className="secret-top">
          <span className="brand-mark">P</span>
          <div className="progress">
            <span
              style={{ width: `${((current + 1) / players.length) * 100}%` }}
            />
          </div>
          <small>
            {current + 1} de {players.length}
          </small>
        </div>
        {screen === "pass" ? (
          <section className="pass-card">
            <div className="phone-icon">
              <Smartphone size={52} />
            </div>
            <span className="eyebrow">PASSE O CELULAR PARA</span>
            <h1>{players[current]}</h1>
            <p>Só {players[current]} pode olhar a próxima tela.</p>
            <button className="primary" onClick={() => setScreen("reveal")}>
              Sou {players[current]}: revelar
            </button>
            <div className="privacy">
              <ShieldCheck size={16} /> Proteja sua tela dos curiosos
            </div>
          </section>
        ) : (
          <section className={`reveal-card ${isImpostor ? "impostor" : ""}`}>
            <span className="eyebrow">SEU PAPEL É</span>
            <div className="role-icon">
              {isImpostor ? <Fingerprint size={52} /> : <Sparkles size={52} />}
            </div>
            <h1>{isImpostor ? "Você é o impostor!" : secretWord}</h1>
            <p>
              {isImpostor
                ? "Descubra a palavra sem ser descoberto."
                : "Dê pistas sem entregar a palavra."}
            </p>
            <button className="primary" onClick={nextPlayer}>
              Já memorizei: esconder
            </button>
          </section>
        )}
      </main>
    );
  }

  if (screen === "ready" || screen === "playing") {
    return (
      <main className="secret-page game-page">
        <header className="topbar compact">
          <div className="brand">
            <span className="brand-mark">P</span>
            <strong>Os Parceiros</strong>
          </div>
          <span className="live-dot">● RODADA EM JOGO</span>
        </header>
        <section className="game-card">
          <span className="eyebrow">TODO MUNDO PRONTO?</span>
          <h1>
            {screen === "ready"
              ? "Comecem as pistas!"
              : timeLeft
                ? time
                : "Hora de votar!"}
          </h1>
          <p>
            A palavra foi distribuída. Agora conversem e encontrem quem está
            fingindo.
          </p>
          <div className="starter">
            <Mic size={30} aria-hidden="true" />
            <div>
              <small>QUEM COMEÇA</small>
              <strong>{starter}</strong>
            </div>
          </div>
          {screen === "ready" ? (
            <button className="primary" onClick={() => setScreen("playing")}>
              Iniciar rodada
            </button>
          ) : (
            <div className="game-actions">
              <button className="primary" onClick={() => setScreen("result")}>
                Encerrar e revelar resultado
              </button>
            </div>
          )}
          <div className="rules-mini">
            <span>1. Dê uma pista por vez</span>
            <span>2. Não fale a palavra</span>
            <span>3. Depois, votem no impostor</span>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "result")
    return (
      <main className="secret-page">
        <section className="game-card">
          <span className="eyebrow">RESULTADO DA RODADA</span>
          <h1>{secretWord}</h1>
          <p>
            Impostor{impostors > 1 ? "es" : ""}:{" "}
            <strong>
              {players.filter((_, index) => roles[index]).join(", ")}
            </strong>
          </p>
          <div className="game-actions">
            <button className="primary" onClick={() => setScreen("setup")}>
              Jogar novamente
            </button>
            <button className="secondary" onClick={onBack}>
              Todos os jogos
            </button>
          </div>
        </section>
      </main>
    );
  return null;
}
