import {
  advanceParty,
  createParty,
  isPartyRoom,
  type RoomGame,
} from "./room-party";
import { matchReducer, type Match } from "./party-engine";
import { type PartyGame } from "./party";
import { likelyPrompts } from "./party";
import { randomInt } from "./words";
import { nameKey, playerName } from "./players";
import { categories, drawWord } from "./words";
import { balancedDraw, type DrawHistory } from "./draw";
export type Player = {
  id: string;
  token: string;
  name: string;
  ready: boolean;
};
export type Room = {
  game?: RoomGame;
  match?: Match;
  duration?: number;
  votes?: Record<string, string>;
  pin: string;
  host: string;
  players: Player[];
  nextNumber: number;
  phase: "lobby" | "reveal" | "playing" | "finished";
  category: string;
  impostors: number;
  round: number;
  word: string;
  spies: string[];
  starter: string;
  endsAt: number | null;
  used: string[];
  expires: number;
  roleHistory?: DrawHistory;
  starterHistory?: DrawHistory;
};
export class GameError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function newPlayer(number: number, requestedName?: unknown): Player {
  let name: string;
  try {
    name = playerName(requestedName, `Jogador ${number}`);
  } catch (error) {
    throw new GameError((error as Error).message);
  }
  return {
    id: crypto.randomUUID(),
    token: crypto.randomUUID(),
    name,
    ready: false,
  };
}
export function addMember(room: Room, requestedName?: unknown) {
  if (room.phase !== "lobby")
    throw new GameError("A rodada já começou. Aguarde a próxima.");
  if (room.players.length >= 20) throw new GameError("A sala está cheia.");
  let player = newPlayer(room.nextNumber++, requestedName);
  if (typeof requestedName !== "string" || !requestedName.trim()) {
    while (room.players.some((p) => nameKey(p.name) === nameKey(player.name)))
      player = newPlayer(room.nextNumber++);
  }
  if (room.players.some((p) => nameKey(p.name) === nameKey(player.name)))
    throw new GameError("Esse nome já está na sala. Escolha outro.", 409);
  room.players.push(player);
  return player;
}
export function newRoom(
  pin: string,
  requestedName?: unknown,
  game: unknown = "impostor",
): Room {
  if (
    typeof game !== "string" ||
    !["impostor", "likely", "heads", "mime", "challenge", "five"].includes(game)
  )
    throw new GameError("Jogo inválido.");
  const player = newPlayer(1, requestedName);
  return {
    pin,
    game: game as RoomGame,
    host: player.id,
    players: [player],
    nextNumber: 2,
    phase: "lobby",
    category: "Misturado",
    impostors: 1,
    round: 0,
    word: "",
    spies: [],
    starter: "",
    endsAt: null,
    used: [],
    expires: Date.now() + 86400000,
  };
}
export function member(room: Room, token: string) {
  const player = room.players.find((p) => p.token === token);
  if (!player)
    throw new GameError(
      "Sua sessão não está nesta sala. Entre novamente.",
      401,
    );
  return player;
}
export function view(room: Room, token: string) {
  const me = member(room, token);
  const match = room.match ? advanceParty(room.match) : null;
  return {
    duration: room.duration ?? 60,
    party: match
      ? {
          ...match,
          deck: undefined,
          word:
            match.phase === "playing" &&
            (match.game !== "mime" || room.players[match.turn]?.id === me.id)
              ? match.deck[match.cursor]
              : null,
          activePlayer: room.players[match.turn]?.id ?? null,
        }
      : null,
    game: room.game ?? "impostor",
    voting:
      room.game === "likely"
        ? {
            question: room.phase === "lobby" ? null : room.word,
            myVote: room.votes?.[me.id] ?? null,
            count: Object.keys(room.votes ?? {}).length,
            results:
              room.phase === "finished"
                ? room.players
                    .map((player) => ({
                      id: player.id,
                      name: player.name,
                      votes: Object.values(room.votes ?? {}).filter(
                        (id) => id === player.id,
                      ).length,
                    }))
                    .sort((a, b) => b.votes - a.votes)
                : [],
          }
        : null,
    pin: room.pin,
    host: room.host,
    me: me.id,
    players: room.players.map(({ id, name, ready }) => ({ id, name, ready })),
    phase: room.phase,
    category: room.category,
    impostors: room.impostors,
    round: room.round,
    starter: room.starter,
    endsAt: room.endsAt,
    serverNow: Date.now(),
    role:
      room.phase === "lobby" ||
      (room.game !== "impostor" && room.game !== undefined)
        ? null
        : room.spies.includes(me.id)
          ? "impostor"
          : "parceiro",
    word:
      room.phase === "finished" ||
      (room.phase !== "lobby" && !room.spies.includes(me.id))
        ? room.word
        : null,
    spies: room.phase === "finished" ? room.spies : [],
  };
}
export type RoomView = ReturnType<typeof view>;
export function change(
  room: Room,
  token: string,
  action: string,
  data: Record<string, unknown>,
) {
  const me = member(room, token);
  if (
    ["start", "finish", "reset", "settings", "kick", "cancel"].includes(
      action,
    ) &&
    me.id !== room.host
  )
    throw new GameError("Só o anfitrião pode fazer isso.", 403);
  if (isPartyRoom(room.game)) {
    if (action === "start") {
      if (room.phase !== "lobby" || room.players.length < 2)
        throw new GameError("Aguarde pelo menos 2 jogadores.");
      room.match = createParty(
        room.game as PartyGame,
        room.players.map((player) => player.name),
        room.category,
        ["heads", "mime"].includes(room.game!) ? room.duration : undefined,
      );
      room.phase = "playing";
      room.round++;
      return;
    }
    if (action === "settings") {
      if (
        room.phase !== "lobby" ||
        typeof data.category !== "string" ||
        !categories.includes(data.category) ||
        ![30, 60, 90].includes(Number(data.duration))
      )
        throw new GameError("Configuração inválida.");
      room.category = data.category;
      room.duration = Number(data.duration);
      return;
    }
    if (action === "party") {
      if (!room.match || room.phase !== "playing")
        throw new GameError("Não há partida em andamento.");
      room.match = advanceParty(room.match);
      const match = room.match;
      if (
        data.round !== room.round ||
        data.turn !== match.turn ||
        data.cursor !== match.cursor
      )
        throw new GameError("A rodada mudou. Aguarde a atualização.", 409);
      const activePlayer = room.players[match.turn]?.id;
      if (data.move === "next" ? me.id !== room.host : me.id !== activePlayer)
        throw new GameError("Aguarde sua vez.", 403);
      if (!["start", "answer", "end", "next"].includes(String(data.move)))
        throw new GameError("Ação inválida.");
      if (data.move === "answer" && typeof data.correct !== "boolean")
        throw new GameError("Resposta inválida.");
      const now = Date.now();
      const next =
        data.move === "answer"
          ? matchReducer(match, {
              type: "answer",
              correct: data.correct as boolean,
              now,
            })
          : matchReducer(match, {
              type: data.move as "start" | "end" | "next",
              now,
            });
      if (next === match)
        throw new GameError("Essa ação não está disponível agora.", 409);
      room.match = next;
      if (next.phase === "results") room.phase = "finished";
      return;
    }
    if (["ready", "finish", "vote"].includes(action))
      throw new GameError("Ação indisponível neste jogo.");
  }
  if (
    room.game === "likely" &&
    ["start", "vote", "finish", "ready", "settings"].includes(action)
  ) {
    if (action === "start") {
      if (room.phase !== "lobby" || room.players.length < 2)
        throw new GameError("Aguarde pelo menos 2 jogadores.");
      let available = likelyPrompts.filter(
        (question) => !room.used.includes(question),
      );
      if (!available.length) {
        room.used = [];
        available = [...likelyPrompts];
      }
      room.word = available[randomInt(available.length)];
      room.used.push(room.word);
      room.votes = {};
      room.round++;
      room.phase = "playing";
      room.endsAt = null;
    } else if (action === "vote") {
      if (room.phase !== "playing" || data.round !== room.round)
        throw new GameError("Essa votação já terminou ou mudou.", 409);
      if (
        typeof data.playerId !== "string" ||
        !room.players.some((player) => player.id === data.playerId)
      )
        throw new GameError("Escolha alguém da sala.");
      room.votes ??= {};
      if (room.votes[me.id])
        throw new GameError("Seu voto já foi registrado.", 409);
      room.votes[me.id] = data.playerId;
      if (room.players.every((player) => room.votes?.[player.id]))
        room.phase = "finished";
    } else throw new GameError("Ação indisponível neste jogo.");
    return;
  }
  if (action === "vote")
    throw new GameError("Esta sala não tem votação eletrônica.");
  if (action === "rename") {
    if (room.phase !== "lobby")
      throw new GameError("Mude seu nome antes de começar a rodada.");
    let name: string;
    try {
      name = playerName(data.name, me.name);
    } catch (error) {
      throw new GameError((error as Error).message);
    }
    if (
      room.players.some(
        (p) => p.id !== me.id && nameKey(p.name) === nameKey(name),
      )
    )
      throw new GameError("Esse nome já está na sala. Escolha outro.", 409);
    me.name = name;
  } else if (action === "settings") {
    if (room.phase !== "lobby") throw new GameError("A rodada já começou.");
    if (
      typeof data.category !== "string" ||
      !categories.includes(data.category) ||
      !Number.isInteger(data.impostors) ||
      Number(data.impostors) < 1 ||
      Number(data.impostors) >= Math.max(3, room.players.length)
    )
      throw new GameError("Configuração inválida.");
    room.category = data.category;
    room.impostors = Number(data.impostors);
  } else if (action === "start") {
    if (
      room.phase !== "lobby" ||
      room.players.length < 3 ||
      room.impostors >= room.players.length
    )
      throw new GameError(
        "Aguarde pelo menos 3 jogadores e confira os impostores.",
      );
    const draw = drawWord(room.category, room.used);
    room.word = draw.word;
    room.used = draw.used;
    const ids = room.players.map((player) => player.id);
    const roles = balancedDraw(ids, room.impostors, room.roleHistory);
    const starter = balancedDraw(ids, 1, room.starterHistory);
    room.spies = roles.selected;
    room.roleHistory = roles.history;
    room.starterHistory = starter.history;
    room.starter = room.players.find(
      (player) => player.id === starter.selected[0],
    )!.name;
    room.phase = "reveal";
    room.round++;
    room.endsAt = null;
    room.players.forEach((p) => {
      p.ready = false;
    });
  } else if (action === "ready") {
    if (room.phase !== "reveal")
      throw new GameError("Não é hora de confirmar o papel.");
    me.ready = true;
    if (room.players.every((p) => p.ready)) {
      room.phase = "playing";
      room.endsAt = Date.now() + 300000;
    }
  } else if (action === "finish") {
    if (room.phase !== "playing")
      throw new GameError("A rodada ainda não começou.");
    room.phase = "finished";
  } else if (action === "cancel") {
    if (room.phase !== "reveal" && room.phase !== "playing")
      throw new GameError("Não há rodada para cancelar.");
    room.phase = "lobby";
    room.match = undefined;
    room.votes = {};
    room.word = "";
    room.spies = [];
    room.endsAt = null;
    room.players.forEach((p) => {
      p.ready = false;
    });
  } else if (action === "reset") {
    if (room.phase !== "finished")
      throw new GameError("Encerre a rodada primeiro.");
    room.phase = "lobby";
    room.match = undefined;
    room.votes = {};
    room.word = "";
    room.spies = [];
    room.endsAt = null;
    room.players.forEach((p) => {
      p.ready = false;
    });
  } else if (action === "leave" || action === "kick") {
    if (action === "kick" && room.phase !== "lobby")
      throw new GameError("Remova jogadores antes da rodada.");
    const target = action === "leave" ? me.id : data.playerId;
    if (
      !room.players.some((p) => p.id === target) ||
      (action === "kick" && target === me.id)
    )
      throw new GameError("Jogador inválido.");
    room.players = room.players.filter((p) => p.id !== target);
    if (target === room.host) room.host = room.players[0]?.id ?? "";
    room.impostors = Math.min(
      room.impostors,
      Math.max(1, room.players.length - 1),
    );
    if (room.phase !== "lobby") {
      room.phase = "lobby";
      room.match = undefined;
      room.votes = {};
      room.word = "";
      room.spies = [];
      room.endsAt = null;
      room.players.forEach((p) => {
        p.ready = false;
      });
    }
  } else throw new GameError("Ação inválida.");
}
