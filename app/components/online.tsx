"use client";
import { useEffect, useRef, useState } from "react";
import type { RoomView } from "@/lib/game";
import { MAX_NAME_LENGTH } from "@/lib/players";
import { categories } from "@/lib/words";
type Session = { pin: string; token: string };
const storageKey = "parceiros-room";
export default function Online({ onBack }: { onBack: () => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const offset = useRef(0);
  const generation = useRef(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (saved?.pin && saved?.token) setSession(saved);
    } catch {
      /* Sem armazenamento, a sessão permanece em memória. */
    }
  }, []);
  function accept(next: RoomView) {
    offset.current = next.serverNow - Date.now();
    setRoom(next);
  }
  useEffect(() => {
    if (!session) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    async function poll() {
      const version = generation.current;
      try {
        const response = await fetch(`/api/rooms?pin=${session!.pin}`, {
          headers: { Authorization: `Bearer ${session!.token}` },
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(10000),
          ]),
        });
        const data = (await response.json()) as RoomView & { error?: string };
        if (!active || version !== generation.current) return;
        if (!response.ok) {
          if ([401, 404].includes(response.status)) {
            setSession(null);
            setRoom(null);
            try {
              sessionStorage.removeItem(storageKey);
            } catch {}
          }
          throw new Error(data.error);
        }
        accept(data);
        setError("");
      } catch (err) {
        if (active && version === generation.current)
          setError(
            err instanceof Error ? err.message : "Conexão interrompida.",
          );
      } finally {
        if (active) timer = setTimeout(poll, 1500);
      }
    }
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [session]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setRevealed(false);
  }, [room?.round, room?.phase]);
  async function action(action: string, extra: Record<string, unknown> = {}) {
    if (busy) return;
    setBusy(true);
    setError("");
    generation.current++;
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          action,
          pin: session?.pin ?? pin,
          name,
          ...extra,
        }),
        signal: AbortSignal.timeout(12000),
      });
      const data = (await response.json()) as {
        room: RoomView;
        token: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error);
      generation.current++;
      if (action === "leave") {
        setSession(null);
        setRoom(null);
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
        return;
      }
      accept(data.room);
      if (!session) {
        const next = { pin: data.room.pin, token: data.token };
        setSession(next);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível conectar.",
      );
    } finally {
      setBusy(false);
    }
  }
  const host = room?.me === room?.host;
  const me = room?.players.find((p) => p.id === room.me);
  const seconds = Math.max(
    0,
    Math.ceil(((room?.endsAt ?? now) - now - offset.current) / 1000),
  );
  return (
    <main className="app-shell setup-page">
      <header className="topbar compact">
        <div className="brand">
          <span className="brand-mark">P</span>
          <strong>Os Parceiros</strong>
        </div>
        <span className="step-label">Cada um no seu celular</span>
      </header>
      <section className="online-wrap">
        {!room && !session && (
          <>
            <button className="back" onClick={onBack}>
              ← Voltar
            </button>
            <span className="eyebrow">JOGO DO IMPOSTOR</span>
            <h1>Juntos na mesma sala.</h1>
            <p>
              Crie uma sala ou entre com o PIN. Escolha seu nome e reúna a
              turma.
            </p>
            <div className="name-field">
              <label htmlFor="online-name">
                Seu nome <span>(opcional)</span>
              </label>
              <input
                id="online-name"
                autoComplete="nickname"
                maxLength={MAX_NAME_LENGTH}
                placeholder="Como a turma te chama?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <small>Se deixar vazio, usamos Jogador 1, Jogador 2…</small>
            </div>
            <div className="online-entry">
              <section className="panel">
                <h2>Chame a turma</h2>
                <p>
                  De 3 a 20 jogadores. Compartilhe o PIN e espere todo mundo
                  entrar.
                </p>
                <button
                  className="primary wide"
                  disabled={busy}
                  onClick={() => action("create")}
                >
                  Criar sala
                </button>
              </section>
              <form
                className="panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  void action("join");
                }}
              >
                <h2>Já tem um PIN?</h2>
                <label htmlFor="pin">PIN da sala</label>
                <input
                  id="pin"
                  className="pin-input"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
                <button
                  className="primary wide"
                  disabled={busy || pin.length !== 6}
                >
                  Entrar na sala
                </button>
              </form>
            </div>
          </>
        )}
        {session && !room && <p role="status">Reconectando à sua sala…</p>}
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        {room && (
          <>
            <div className="room-heading">
              <div>
                <span className="eyebrow">PIN DA SALA</span>
                <strong className="room-pin">{room.pin}</strong>
                <button
                  className="back"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(room.pin);
                      setCopied(true);
                    } catch {
                      setError("Copie os 6 números do PIN acima.");
                    }
                  }}
                >
                  {copied ? "Copiado!" : "Copiar PIN"}
                </button>
              </div>
              <div>
                <span className="players-badge">
                  Você é {me?.name}
                  {host ? " · anfitrião" : ""}
                </span>
                <button
                  className="back leave"
                  disabled={busy}
                  onClick={() => action("leave")}
                >
                  Sair da sala
                </button>
              </div>
            </div>
            <div className="setup-grid">
              <section className="panel">
                <div className="panel-title">
                  <h2>Na sala</h2>
                  <span>{room.players.length}/20 jogadores</span>
                </div>
                {room.phase === "lobby" && (
                  <form
                    className="rename-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void action("rename");
                    }}
                  >
                    <label htmlFor="rename">Mudar meu nome</label>
                    <div>
                      <input
                        id="rename"
                        maxLength={MAX_NAME_LENGTH}
                        value={name}
                        placeholder={me?.name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <button
                        className="add-player"
                        disabled={busy || !name.trim()}
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                )}
                <ul className="room-players">
                  {room.players.map((p, index) => (
                    <li key={p.id}>
                      <span className="avatar">{index + 1}</span>
                      <strong>
                        {p.name}
                        {p.id === room.me ? " (você)" : ""}
                      </strong>
                      <span>
                        {p.id === room.host ? "Anfitrião" : ""}
                        {room.phase === "reveal" && p.ready ? " · Pronto" : ""}
                      </span>
                      {host && room.phase === "lobby" && p.id !== room.me && (
                        <button
                          className="back"
                          disabled={busy}
                          aria-label={`Remover ${p.name}`}
                          onClick={() => action("kick", { playerId: p.id })}
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="hint">
                  Conversem pessoalmente ou por uma chamada de voz. Só
                  compartilhe o PIN com quem vai jogar.
                </p>
              </section>
              <section className="panel settings-panel">
                {room.phase === "lobby" && (
                  <>
                    <h2>Preparar rodada</h2>
                    <label htmlFor="category">Categoria</label>
                    <select
                      id="category"
                      disabled={!host || busy}
                      value={room.category}
                      onChange={(e) =>
                        action("settings", {
                          category: e.target.value,
                          impostors: room.impostors,
                        })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <label htmlFor="impostors">Impostores</label>
                    <select
                      id="impostors"
                      disabled={!host || busy}
                      value={room.impostors}
                      onChange={(e) =>
                        action("settings", {
                          category: room.category,
                          impostors: Number(e.target.value),
                        })
                      }
                    >
                      {Array.from(
                        { length: Math.max(2, room.players.length - 1) },
                        (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ),
                      )}
                    </select>
                    {host ? (
                      <button
                        className="primary wide"
                        disabled={busy || room.players.length < 3}
                        onClick={() => action("start")}
                      >
                        Sortear papéis
                      </button>
                    ) : (
                      <p>Aguarde o anfitrião começar.</p>
                    )}
                    <p className="hint">
                      A rodada precisa de pelo menos 3 jogadores.
                    </p>
                  </>
                )}
                {(room.phase === "reveal" || room.phase === "playing") && (
                  <>
                    <span className="eyebrow">RODADA {room.round}</span>
                    <h2>
                      {room.phase === "reveal"
                        ? "Veja seu papel em segredo"
                        : seconds
                          ? `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
                          : "Hora de votar!"}
                    </h2>
                    {revealed ? (
                      <div className={`private-role ${room.role}`}>
                        <small>SEU PAPEL</small>
                        <h3>
                          {room.role === "impostor"
                            ? "Você é o impostor!"
                            : room.word}
                        </h3>
                        <p>
                          {room.role === "impostor"
                            ? "Descubra a palavra sem ser descoberto."
                            : "Dê pistas sem entregar a palavra."}
                        </p>
                      </div>
                    ) : (
                      <p>Proteja sua tela dos curiosos.</p>
                    )}
                    <button
                      className="primary wide"
                      onClick={() => setRevealed(!revealed)}
                    >
                      {revealed ? "Esconder papel" : "Revelar meu papel"}
                    </button>
                    {room.phase === "reveal" && !me?.ready && (
                      <button
                        className="add-player"
                        disabled={busy || !revealed}
                        onClick={() => {
                          setRevealed(false);
                          void action("ready");
                        }}
                      >
                        Memorizei, estou pronto
                      </button>
                    )}
                    {host && room.phase === "reveal" && (
                      <button
                        className="add-player"
                        disabled={busy}
                        onClick={() => action("cancel")}
                      >
                        Cancelar rodada e voltar à sala
                      </button>
                    )}
                    {room.phase === "reveal" && me?.ready && (
                      <p>Você está pronto. Aguardando os demais…</p>
                    )}
                    {room.phase === "playing" && (
                      <>
                        <p>
                          Quem começa: <strong>{room.starter}</strong>
                        </p>
                        <p>Dê uma pista por vez. Depois, votem em voz alta.</p>
                        {host && (
                          <button
                            className="add-player"
                            disabled={busy}
                            onClick={() => action("finish")}
                          >
                            Encerrar e revelar resultado
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
                {room.phase === "finished" && (
                  <>
                    <span className="eyebrow">RESULTADO</span>
                    <h2>{room.word}</h2>
                    <p>
                      Impostor{room.spies.length > 1 ? "es" : ""}:{" "}
                      <strong>
                        {room.players
                          .filter((p) => room.spies.includes(p.id))
                          .map((p) => p.name)
                          .join(", ")}
                      </strong>
                    </p>
                    {host ? (
                      <button
                        className="primary wide"
                        disabled={busy}
                        onClick={() => action("reset")}
                      >
                        Preparar próxima rodada
                      </button>
                    ) : (
                      <p>Aguarde o anfitrião preparar a próxima rodada.</p>
                    )}
                  </>
                )}
              </section>
            </div>
          </>
        )}
        {busy && <p role="status">Conectando…</p>}
      </section>
    </main>
  );
}
