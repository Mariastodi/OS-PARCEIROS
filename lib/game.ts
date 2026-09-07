import { categories, drawWord, randomInt, shuffle } from './words';
export type Player = { id: string; token: string; name: string; ready: boolean };
export type Room = { pin: string; host: string; players: Player[]; nextNumber: number; phase: 'lobby' | 'reveal' | 'playing' | 'finished'; category: string; impostors: number; round: number; word: string; spies: string[]; starter: string; endsAt: number | null; used: string[]; expires: number };
export class GameError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function newPlayer(number: number): Player { return { id: crypto.randomUUID(), token: crypto.randomUUID(), name: `Jogador ${number}`, ready: false }; }
export function newRoom(pin: string): Room {
  const player = newPlayer(1);
  return { pin, host: player.id, players: [player], nextNumber: 2, phase: 'lobby', category: 'Misturado', impostors: 1, round: 0, word: '', spies: [], starter: '', endsAt: null, used: [], expires: Date.now() + 86400000 };
}
export function member(room: Room, token: string) {
  const player = room.players.find(p => p.token === token);
  if (!player) throw new GameError('Sua sessão não está nesta sala. Entre novamente.', 401);
  return player;
}
export function view(room: Room, token: string) {
  const me = member(room, token);
  return { pin: room.pin, host: room.host, me: me.id, players: room.players.map(({ id, name, ready }) => ({ id, name, ready })), phase: room.phase, category: room.category, impostors: room.impostors, round: room.round, starter: room.starter, endsAt: room.endsAt, serverNow: Date.now(), role: room.phase === 'lobby' ? null : room.spies.includes(me.id) ? 'impostor' : 'parceiro', word: room.phase === 'finished' || (room.phase !== 'lobby' && !room.spies.includes(me.id)) ? room.word : null, spies: room.phase === 'finished' ? room.spies : [] };
}
export type RoomView = ReturnType<typeof view>;
export function change(room: Room, token: string, action: string, data: Record<string, unknown>) {
  const me = member(room, token);
  if (['start', 'finish', 'reset', 'settings', 'kick', 'cancel'].includes(action) && me.id !== room.host) throw new GameError('Só o anfitrião pode fazer isso.', 403);
  if (action === 'settings') {
    if (room.phase !== 'lobby') throw new GameError('A rodada já começou.');
    if (typeof data.category !== 'string' || !categories.includes(data.category) || !Number.isInteger(data.impostors) || Number(data.impostors) < 1 || Number(data.impostors) >= Math.max(3, room.players.length)) throw new GameError('Configuração inválida.');
    room.category = data.category; room.impostors = Number(data.impostors);
  } else if (action === 'start') {
    if (room.phase !== 'lobby' || room.players.length < 3 || room.impostors >= room.players.length) throw new GameError('Aguarde pelo menos 3 jogadores e confira os impostores.');
    const draw = drawWord(room.category, room.used);
    room.word = draw.word; room.used = draw.used;
    room.spies = shuffle(room.players).slice(0, room.impostors).map(p => p.id);
    room.starter = room.players[randomInt(room.players.length)].name;
    room.phase = 'reveal'; room.round++; room.endsAt = null;
    room.players.forEach(p => { p.ready = false; });
  } else if (action === 'ready') {
    if (room.phase !== 'reveal') throw new GameError('Não é hora de confirmar o papel.');
    me.ready = true;
    if (room.players.every(p => p.ready)) { room.phase = 'playing'; room.endsAt = Date.now() + 300000; }
  } else if (action === 'finish') {
    if (room.phase !== 'playing') throw new GameError('A rodada ainda não começou.');
    room.phase = 'finished';
  } else if (action === 'cancel') {
    if (room.phase !== 'reveal' && room.phase !== 'playing') throw new GameError('Não há rodada para cancelar.');
    room.phase = 'lobby'; room.word = ''; room.spies = []; room.endsAt = null; room.players.forEach(p => { p.ready = false; });
  } else if (action === 'reset') {
    if (room.phase !== 'finished') throw new GameError('Encerre a rodada primeiro.');
    room.phase = 'lobby'; room.word = ''; room.spies = []; room.endsAt = null; room.players.forEach(p => { p.ready = false; });
  } else if (action === 'leave' || action === 'kick') {
    if (action === 'kick' && room.phase !== 'lobby') throw new GameError('Remova jogadores antes da rodada.');
    const target = action === 'leave' ? me.id : data.playerId;
    if (!room.players.some(p => p.id === target) || (action === 'kick' && target === me.id)) throw new GameError('Jogador inválido.');
    room.players = room.players.filter(p => p.id !== target);
    if (target === room.host) room.host = room.players[0]?.id ?? '';
    room.impostors = Math.min(room.impostors, Math.max(1, room.players.length - 1));
    // Uma saída durante a rodada cancela o sorteio para manter os papéis justos.
    if (room.phase !== 'lobby') { room.phase = 'lobby'; room.word = ''; room.spies = []; room.endsAt = null; room.players.forEach(p => { p.ready = false; }); }
  } else throw new GameError('Ação inválida.');
}
