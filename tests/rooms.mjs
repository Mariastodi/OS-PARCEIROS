import assert from 'node:assert/strict';
const base = process.env.TEST_URL ?? 'http://localhost:3000';
async function post(action, session = {}, extra = {}, expected = 200) {
  const response = await fetch(`${base}/api/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}) }, body: JSON.stringify({ action, pin: session.pin, ...extra }) });
  const body = await response.json();
  assert.equal(response.status, expected, JSON.stringify(body)); return body;
}
async function get(s, expected = 200) {
  const response = await fetch(`${base}/api/rooms?pin=${s.pin}`, { headers: { Authorization: `Bearer ${s.token}` } });
  const body = await response.json(); assert.equal(response.status, expected); return body;
}
const created = await post('create');
const host = { pin: created.room.pin, token: created.token };
assert.match(host.pin, /^\d{6}$/);
assert.equal(created.room.players[0].name, 'Jogador 1');
await post('start', host, {}, 400);
const joined = await Promise.all(Array.from({ length: 5 }, () => post('join', { pin: host.pin })));
const sessions = [host, ...joined.map(p => ({ pin: host.pin, token: p.token }))];
const lobby = await get(host);
assert.equal(lobby.players.length, 6);
assert.equal(new Set(lobby.players.map(p => p.name)).size, 6);
await get({ pin: host.pin, token: 'fake' }, 401);
await post('start', sessions[1], {}, 403);
await post('settings', host, { category: 'Animais', impostors: 2 });
await post('start', host);
await post('join', { pin: host.pin }, {}, 400);
const views = await Promise.all(sessions.map(s => get(s)));
assert.equal(views.filter(v => v.role === 'impostor').length, 2);
assert.equal(new Set(views.filter(v => v.role === 'parceiro').map(v => v.word)).size, 1);
for (const v of views) { assert.deepEqual(v.spies, []); assert.ok(v.players.every(p => !('token' in p))); if (v.role === 'impostor') assert.equal(v.word, null); }
await Promise.all(sessions.map(s => post('ready', s)));
const playing = await get(host);
assert.equal(playing.phase, 'playing'); assert.ok(playing.endsAt > Date.now());
assert.equal((await get(sessions[1])).endsAt, playing.endsAt);
await post('finish', sessions[1], {}, 403);
const finish = await post('finish', host);
assert.equal(finish.room.spies.length, 2); assert.ok(finish.room.word);
await post('reset', host);
const next = await post('start', host);
const nextViews = await Promise.all(sessions.map(s => get(s)));
assert.notEqual(nextViews.find(v => v.word).word, finish.room.word);
assert.equal(next.room.round, 2);
await post('cancel', sessions[1], {}, 403);
await post('cancel', host);
assert.equal((await get(host)).phase, 'lobby');
await post('start', host);
await post('leave', host);
const afterLeave = await get(sessions[1]);
assert.equal(afterLeave.phase, 'lobby'); assert.equal(afterLeave.players.length, 5); assert.notEqual(afterLeave.host, created.room.me);
const newHost = sessions.find((s, i) => i > 0 && views[i].me === afterLeave.host);
const victim = sessions.find(s => s !== newHost && s !== host);
const victimView = await get(victim);
await post('kick', newHost, { playerId: victimView.me }); await get(victim, 401);
for (const s of sessions.slice(1).filter(s => s !== victim)) await post('leave', s);
await post('join', { pin: host.pin }, {}, 404);
await post('join', { pin: 'bad' }, {}, 400);
console.log('PASS: concurrent joins, automatic names, auth, roles privacy, synchronized clock, rematch, host transfer, removal, validation.');
