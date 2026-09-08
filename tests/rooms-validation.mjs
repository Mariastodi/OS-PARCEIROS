import assert from "node:assert/strict";
const base = process.env.TEST_URL ?? "http://localhost:3000";
async function post(data, token, status = 200, origin) {
  const r = await fetch(`${base}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify(data),
  });
  const body = await r.json();
  assert.equal(r.status, status, JSON.stringify(body));
  return body;
}
await post({ action: "create", name: "<script>" }, null, 400);
await post({ action: "create", name: "a".repeat(25) }, null, 400);
await post({ action: "create", name: 123 }, null, 400);
await post({ action: "create" }, null, 403, "https://untrusted.example");
const created = await post(
  { action: "create", name: "  Maria   Bia  " },
  null,
  200,
  base,
);
const pin = created.room.pin;
const sessions = [created.token];
assert.equal(created.room.players[0].name, "Maria Bia");
await post({ action: "join", pin, name: "maria bia" }, null, 409);
const guest = await post({ action: "join", pin, name: "João" });
sessions.push(guest.token);
await post({ action: "rename", pin, name: "Maria Bia" }, guest.token, 409);
await post({ action: "rename", pin, name: "Pedro" }, guest.token);
await post(
  { action: "settings", pin, category: "__proto__", impostors: 1 },
  created.token,
  400,
);
await post(
  { action: "settings", pin, category: "Comidas", impostors: 99 },
  created.token,
  400,
);
for (let i = 0; i < 18; i++) {
  const next = await post({ action: "join", pin, name: `Pessoa ${i}` });
  sessions.push(next.token);
}
await post({ action: "join", pin, name: "Extra" }, null, 400);
await post({ action: "start", pin }, created.token);
await post({ action: "rename", pin, name: "Ana" }, guest.token, 400);
await post(
  { action: "kick", pin, playerId: guest.room.me },
  created.token,
  400,
);
await post({ action: "cancel", pin }, created.token);
for (const token of sessions) await post({ action: "leave", pin }, token);
const bad = await fetch(`${base}/api/rooms`, { method: "POST", body: "{" });
assert.equal(bad.status, 400);
const large = await fetch(`${base}/api/rooms`, {
  method: "POST",
  body: "x".repeat(2049),
});
assert.equal(large.status, 413);
console.log(
  "PASS: custom names, duplicate names, invalid settings, 20-player capacity, rename, cross-origin rejection, malformed/oversized requests.",
);
