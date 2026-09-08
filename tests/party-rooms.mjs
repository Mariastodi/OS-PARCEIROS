import assert from "node:assert/strict";
const base = process.env.TEST_URL ?? "http://localhost:3000";
async function post(session, action, extra = {}, status = 200) {
  const response = await fetch(`${base}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: JSON.stringify({ action, pin: session?.room.pin, ...extra }),
  });
  const data = await response.json();
  assert.equal(response.status, status, JSON.stringify(data));
  return data;
}
for (const game of ["likely", "heads", "mime", "challenge", "five"]) {
  let host;
  let guest;
  try {
    host = await post(null, "create", { game, name: "Ana" });
    guest = await post(null, "join", { pin: host.room.pin, name: "Bia" });
    assert.equal(guest.room.game, game);
    await post(guest, "start", {}, 403);
    host = await post(host, "start");
    if (game === "likely") {
      const votes = await Promise.all([
        post(host, "vote", { playerId: guest.room.me, round: host.room.round }),
        post(guest, "vote", {
          playerId: guest.room.me,
          round: host.room.round,
        }),
      ]);
      const result = votes.find(
        (response) => response.room.phase === "finished",
      );
      assert.equal(result.room.voting.results[0].name, "Bia");
      assert.equal(result.room.voting.results[0].votes, 2);
      await post(
        host,
        "vote",
        { playerId: host.room.me, round: host.room.round },
        409,
      );
    } else {
      for (let turn = 0; turn < 2; turn++) {
        let active = turn === 0 ? host : guest;
        const snapshot = await fetch(`${base}/api/rooms?pin=${host.room.pin}`, {
          headers: { Authorization: `Bearer ${active.token}` },
        }).then((response) => response.json());
        const move = (state, name, extra = {}) =>
          post(state, "party", {
            move: name,
            turn: state.room.party.turn,
            cursor: state.room.party.cursor,
            round: state.room.round,
            ...extra,
          });
        active = { token: active.token, room: snapshot };
        active = await move(active, "start");
        await new Promise((resolve) => setTimeout(resolve, 3100));
        active = await move(active, "answer", { correct: true });
        if (["heads", "mime"].includes(game))
          active = await move(active, "end");
        host = await post(host, "party", {
          move: "next",
          turn: active.room.party.turn,
          cursor: active.room.party.cursor,
          round: active.room.round,
        });
      }
      assert.equal(host.room.phase, "finished");
      assert.deepEqual(host.room.party.scores, [1, 1]);
      assert.equal(host.room.party.deck, undefined);
    }
    await post(host, "reset");
  } finally {
    if (guest) await post(guest, "leave");
    if (host) await post(host, "leave");
  }
}
console.log(
  "PASS: all party room types, simultaneous votes, winner, turn permissions, shared scoring and cleanup.",
);
