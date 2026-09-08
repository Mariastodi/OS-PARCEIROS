"use client";
import { CircleHelp, Fingerprint, Sparkles } from "lucide-react";
import { GameIcon } from "./components/icons";
import { useState } from "react";
import Online from "./components/online";
import LocalImpostor from "./components/games/local-impostor";
import PartySetup from "./components/games/party-game";
import { partyGames, type PartyGame } from "@/lib/party";
type Screen = "home" | "online" | "local" | PartyGame;
export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const home = () => setScreen("home");
  if (screen === "online") return <Online onBack={home} />;
  if (screen === "local") return <LocalImpostor onBack={home} />;
  if (screen !== "home") return <PartySetup game={screen} onBack={home} />;
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <strong>Os Parceiros</strong>
        </div>
        <nav aria-label="Navegação principal">
          <a href="#jogos">Todos os jogos</a>
          <a href="#como-jogar">Como jogar</a>
        </nav>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A TURMA CHEGOU. ESCOLHAM UM JOGO.</span>
          <h1>
            Quem é o<br />
            <em>impostor?</em>
          </h1>
          <p>
            Uma palavra secreta. Alguém disfarçando. Joguem na mesma sala com
            PIN ou passem o celular.
          </p>
          <div className="mode-actions">
            <button className="primary" onClick={() => setScreen("online")}>
              Jogar com PIN <span>→</span>
            </button>
            <button className="add-player" onClick={() => setScreen("local")}>
              Jogar em um celular
            </button>
          </div>
          <small>3–20 pessoas · Sem cadastro</small>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="card card-back">
            <CircleHelp size={100} strokeWidth={1.5} />
          </div>
          <div className="card card-word">
            <small>SUA PALAVRA</small>
            <strong>PIPOCA</strong>
            <Sparkles size={32} />
          </div>
          <div className="card card-impostor">
            <Fingerprint size={80} strokeWidth={1.5} />
            <strong>IMPOSTOR</strong>
          </div>
        </div>
      </section>
      <section className="games" id="jogos">
        <div className="section-heading">
          <div>
            <span className="eyebrow">6 JOGOS. QUAL VAI SER?</span>
            <h2>A próxima rodada é de vocês.</h2>
          </div>
          <p>Escolham os nomes, entendam as regras e comecem.</p>
        </div>
        <div className="catalog-grid">
          <article className="catalog-tile impostor-tile">
            <span className="tile-icon">
              <GameIcon game="impostor" />
            </span>
            <span className="tag">COM PIN OU NO MESMO CELULAR</span>
            <h3>O Impostor</h3>
            <p>Deem pistas e descubram quem não recebeu a palavra.</p>
            <div className="catalog-actions">
              <button className="primary" onClick={() => setScreen("online")}>
                Sala com PIN
              </button>
              <button className="add-player" onClick={() => setScreen("local")}>
                Um celular
              </button>
            </div>
          </article>
          {Object.entries(partyGames).map(([id, game]) => (
            <article className={`catalog-tile game-${id}`} key={id}>
              <span className="tile-icon">
                <GameIcon game={id as PartyGame} />
              </span>
              <span className="tag">
                {id === "heads"
                  ? "COM MOVIMENTOS DO CELULAR"
                  : "NO MESMO CELULAR"}
              </span>
              <h3>{game.title}</h3>
              <p>{game.description}</p>
              <button
                className="primary"
                onClick={() => setScreen(id as PartyGame)}
              >
                Jogar {game.title} <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="how" id="como-jogar">
        <span className="eyebrow">DOIS JEITOS DE REUNIR A TURMA</span>
        <h2>Escolheu? Bora jogar.</h2>
        <div className="steps">
          <div>
            <b>01</b>
            <h3>Coloquem os nomes</h3>
            <p>Cada pessoa ou equipe escolhe como quer aparecer.</p>
          </div>
          <div>
            <b>02</b>
            <h3>Confiram as regras</h3>
            <p>Cada jogo explica o que fazer antes de começar.</p>
          </div>
          <div>
            <b>03</b>
            <h3>Disputem mais uma</h3>
            <p>Vejam o resultado e escolham a próxima rodada.</p>
          </div>
        </div>
      </section>
      <footer>
        <div className="brand">
          <span className="brand-mark">P</span>
          <strong>Os Parceiros</strong>
        </div>
        <a href="#jogos">Voltar aos jogos ↑</a>
      </footer>
    </main>
  );
}
