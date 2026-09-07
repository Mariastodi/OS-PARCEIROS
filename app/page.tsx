'use client';

import { useEffect, useMemo, useState } from 'react';
import Online from './components/online';
import { categories, drawWord, randomInt, shuffle } from '@/lib/words';

type Screen = 'online' | 'home' | 'setup' | 'pass' | 'reveal' | 'ready' | 'playing';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [players, setPlayers] = useState(['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4']);
  const [category, setCategory] = useState('Misturado');
  const [impostors, setImpostors] = useState(1);
  const [current, setCurrent] = useState(0);
  const [roles, setRoles] = useState<boolean[]>([]);
  const [secretWord, setSecretWord] = useState('');
  const [starter, setStarter] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);

  const [usedWords, setUsedWords] = useState<string[]>([]);
  useEffect(() => {
    if (screen !== 'playing') return;
    const end = Date.now() + 300000;
    const timer = setInterval(() => setTimeLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 250);
    return () => clearInterval(timer);
  }, [screen]);

  const canStart = players.length >= 3 && players.every((name) => name.trim()) && impostors < players.length;
  const time = useMemo(() => `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`, [timeLeft]);

  function addPlayer() {
    if (players.length < 20) setPlayers([...players, `Jogador ${players.length + 1}`]);
  }

  function prepareGame() {
    if (!canStart) return;
    const draw = drawWord(category, usedWords);
    setSecretWord(draw.word); setUsedWords(draw.used);
    setRoles(shuffle([...Array(impostors).fill(true), ...Array(players.length - impostors).fill(false)]));
    setStarter(players[randomInt(players.length)]);
    setCurrent(0);
    setTimeLeft(300);
    setScreen('pass');
  }

  function nextPlayer() {
    if (current === players.length - 1) setScreen('ready');
    else { setCurrent(current + 1); setScreen('pass'); }
  }

  if (screen === 'online') return <Online onBack={() => setScreen('home')} />;

  if (screen === 'setup') {
    return (
      <main className="app-shell setup-page">
        <header className="topbar compact"><button className="brand" onClick={() => setScreen('home')} aria-label="Voltar ao início"><span className="brand-mark">P</span><strong>Os Parceiros</strong></button><span className="step-label">Preparando a rodada</span></header>
        <section className="setup-wrap">
          <button className="back" onClick={() => setScreen('home')}>← Voltar</button>
          <div className="setup-heading"><div><span className="eyebrow">JOGO DO IMPOSTOR</span><h1>Quem vai jogar?</h1><p>Escolha quantas pessoas vão jogar e passe o celular para cada uma.</p></div><span className="players-badge">{players.length} jogadores</span></div>
          <div className="setup-grid">
            <section className="panel">
              <div className="panel-title"><h2>Jogadores</h2><span>mín. 3 · máx. 20</span></div>
              <div className="player-list">{players.map((name, index) => <div className="player-row" key={index}><span className="avatar">{index + 1}</span><strong className="player-name">{name}</strong><button aria-label={`Remover ${name}`} disabled={players.length <= 3} onClick={() => { setPlayers(players.slice(0, -1)); setImpostors(Math.min(impostors, players.length - 2)); }}>×</button></div>)}</div>
              <button className="add-player" onClick={addPlayer} disabled={players.length >= 20}>＋ Adicionar jogador</button>
            </section>
            <aside className="panel settings-panel">
              <label>Categoria</label>
              <div className="category-grid">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item === 'Misturado' ? '✦' : item === 'Comidas' ? '🍕' : item === 'Lugares' ? '⌖' : '◆'}<span>{item}</span></button>)}</div>
              <label>Quantidade de impostores</label>
              <div className="counter"><button onClick={() => setImpostors(Math.max(1, impostors - 1))}>−</button><strong>{impostors}</strong><button onClick={() => setImpostors(Math.min(players.length - 1, impostors + 1))}>＋</button></div>
              <p className="hint">Para {players.length} pessoas, recomendamos {players.length > 7 ? 2 : 1} impostor{players.length > 7 ? 'es' : ''}.</p>
              <button className="primary wide" disabled={!canStart} onClick={prepareGame}>Sortear papéis <span>→</span></button>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'pass' || screen === 'reveal') {
    const isImpostor = roles[current];
    return <main className="secret-page"><div className="secret-top"><span className="brand-mark">P</span><div className="progress"><span style={{width: `${((current + 1) / players.length) * 100}%`}}/></div><small>{current + 1} de {players.length}</small></div>{screen === 'pass' ? <section className="pass-card"><div className="phone-icon">▥</div><span className="eyebrow">PASSE O CELULAR PARA</span><h1>{players[current]}</h1><p>Só {players[current]} pode olhar a próxima tela.</p><button className="primary" onClick={() => setScreen('reveal')}>Sou {players[current]} — revelar</button><div className="privacy">◉ Proteja sua tela dos curiosos</div></section> : <section className={`reveal-card ${isImpostor ? 'impostor' : ''}`}><span className="eyebrow">SEU PAPEL É</span><div className="role-icon">{isImpostor ? '◉' : '✦'}</div><h1>{isImpostor ? 'Você é o impostor!' : secretWord}</h1><p>{isImpostor ? 'Descubra a palavra sem ser descoberto.' : 'Dê pistas sem entregar a palavra.'}</p><button className="primary" onClick={nextPlayer}>Já memorizei — esconder</button></section>}</main>;
  }

  if (screen === 'ready' || screen === 'playing') {
    return <main className="secret-page game-page"><header className="topbar compact"><div className="brand"><span className="brand-mark">P</span><strong>Os Parceiros</strong></div><span className="live-dot">● RODADA EM JOGO</span></header><section className="game-card"><span className="eyebrow">TODO MUNDO PRONTO?</span><h1>{screen === 'ready' ? 'Comecem as pistas!' : timeLeft ? time : 'Hora de votar!'}</h1><p>A palavra foi distribuída. Agora conversem e encontrem quem está fingindo.</p><div className="starter"><span>🎤</span><div><small>QUEM COMEÇA</small><strong>{starter}</strong></div></div>{screen === 'ready' ? <button className="primary" onClick={() => setScreen('playing')}>Iniciar rodada</button> : <div className="game-actions"><button className="primary" onClick={() => setScreen('home')}>Encerrar e jogar de novo</button></div>}<div className="rules-mini"><span>1. Dê uma pista por vez</span><span>2. Não fale a palavra</span><span>3. Depois, votem no impostor</span></div></section></main>;
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">P</span><strong>Os Parceiros</strong></div><nav><a href="#jogos">Jogos</a><a href="#como-jogar">Como jogar</a></nav><span className="party-pill">Feito para jogar junto</span></header>
      <section className="hero"><div className="hero-copy"><span className="eyebrow">NINGUÉM FICA DE FORA</span><h1>Quem é o<br/><em>impostor?</em></h1><p>Crie uma sala com PIN e cada amigo recebe seu papel no próprio celular. Ou joguem passando um único aparelho.</p><div className="mode-actions"><button className="primary" onClick={() => setScreen('online')}>Jogar com PIN <span>→</span></button><button className="add-player" onClick={() => setScreen('setup')}>Jogar em um celular</button></div><small>Sem cadastro · Grátis · Funciona no celular</small></div><div className="hero-art" aria-label="Cartas do jogo"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="card card-back"><span>?</span></div><div className="card card-word"><small>SUA PALAVRA</small><strong>PIPOCA</strong><span>✦</span></div><div className="card card-impostor"><span>◉</span><strong>IMPOSTOR</strong></div><i className="spark s1">✦</i><i className="spark s2">✦</i></div></section>
      <section className="games" id="jogos"><div className="section-heading"><div><span className="eyebrow">ESCOLHA O JOGO</span><h2>Qual vai ser a de hoje?</h2></div><p>Feitos para 3 ou mais pessoas, juntos no mesmo lugar.</p></div><div className="game-grid"><article className="game-tile featured" onClick={() => setScreen('setup')}><div className="tile-icon">◉</div><div><span className="tag">MAIS JOGADO</span><h3>O Impostor</h3><p>Todo mundo recebe a mesma palavra — menos uma pessoa. Descubram quem está fingindo.</p><div className="meta">♟ 3–20 jogadores <span>•</span> ◷ 10 min</div></div><button aria-label="Jogar O Impostor">→</button></article><article className="game-tile soon"><div className="tile-icon">☝</div><div><span className="tag">EM BREVE</span><h3>Quem é mais provável?</h3><p>Uma pergunta aparece e todo mundo aponta ao mesmo tempo. Preparem-se para as revelações.</p><div className="meta">♟ 4+ jogadores <span>•</span> ◷ 15 min</div></div></article><article className="game-tile soon"><div className="tile-icon">⚡</div><div><span className="tag">EM BREVE</span><h3>Desafio Relâmpago</h3><p>Missões rápidas e engraçadas sorteadas para cada pessoa da roda.</p><div className="meta">♟ 3+ jogadores <span>•</span> ◷ 10 min</div></div></article></div></section>
      <section className="how" id="como-jogar"><span className="eyebrow">É MUITO FÁCIL</span><h2>Do sofá pra brincadeira em segundos.</h2><div className="steps"><div><b>01</b><h3>Escolha como jogar</h3><p>Crie uma sala com PIN ou use um celular.</p></div><div><b>02</b><h3>Descubram seus papéis</h3><p>Cada pessoa vê seu papel em segredo.</p></div><div><b>03</b><h3>Comecem a jogar</h3><p>O site avisa quando todos estiverem prontos.</p></div></div></section>
      <footer><div className="brand"><span className="brand-mark">P</span><strong>Os Parceiros</strong></div><p>Feito para as histórias que começam com “vocês lembram daquele dia?”</p></footer>
    </main>
  );
}
