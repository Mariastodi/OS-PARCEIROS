import { test } from "node:test";
import assert from "node:assert/strict";
import { playerName, validPlayers, nameKey } from "../lib/players";
import { screenTilt, initialTilt, detectTilt } from "../lib/motion";
import { matchReducer, newMatch } from "../lib/party-engine";
import { categories, poolFor, drawWord, shuffle } from "../lib/words";
import { addMember, change, newRoom, view } from "../lib/game";
import { remainingSeconds } from "../lib/party";

test("names: whitespace, accents, fallback, limits and reserved symbols", () => {
  assert.equal(playerName("  Ana   Clara ", ""), "Ana Clara");
  assert.equal(playerName("", "Jogador 1"), "Jogador 1");
  assert.equal(nameKey("JOÃO"), nameKey("Joao"));
  assert.ok(validPlayers(["Ana", "Bia"]));
  assert.ok(!validPlayers(["Ana", " ana "]));
  assert.ok(!validPlayers(["Ana", ""]));
  assert.ok(!validPlayers(["João", "Joao"]));
  assert.throws(() => playerName("a".repeat(25), ""));
  assert.throws(() => playerName("<script>", ""));
  assert.throws(() => playerName(3, ""));
});
test("word bank: every category is unique and draws do not repeat until exhausted", () => {
  for (const category of categories) {
    const pool = poolFor(category);
    assert.ok(pool.length >= 90);
    assert.equal(pool.length, new Set(pool).size);
    let used: string[] = [];
    for (let i = 0; i < pool.length; i++) {
      const draw = drawWord(category, used);
      assert.ok(!used.includes(draw.word));
      used = draw.used;
    }
    assert.ok(pool.includes(drawWord(category, used).word));
  }
  assert.throws(() => poolFor("__proto__"));
  const input = [1, 2, 3, 4];
  assert.deepEqual(shuffle(input).sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4]);
});
test("tilt: portrait, landscape, face up/down and missing readings", () => {
  assert.equal(screenTilt(0, 0), 90);
  assert.equal(screenTilt(180, 0), -90);
  assert.ok(Math.abs(screenTilt(90, 0)!) < 0.01);
  assert.ok(Math.abs(screenTilt(0, 90)!) < 0.01);
  assert.equal(screenTilt(null, 0), null);
  assert.equal(screenTilt(NaN, 0), null);
});
test("tilt: must return to neutral, sustain movement and wait cooldown", () => {
  let state = initialTilt();
  const step = (angle: number, time: number) => {
    const result = detectTilt(state, angle, time);
    state = result.state;
    return result.action;
  };
  assert.equal(step(60, 0), null);
  assert.equal(step(0, 10), null);
  assert.equal(step(60, 100), null);
  assert.equal(step(60, 300), "correct");
  assert.equal(step(60, 1500), null);
  assert.equal(step(-60, 1800), null);
  step(0, 1900);
  step(-60, 2000);
  assert.equal(step(-60, 2200), "pass");
});
test("heads: countdown, duplicate tap prevention, timeout and scoring exactly once", () => {
  let s = newMatch("heads", ["Ana", "Bia"], ["Gato", "Café", "Sol", "Lua"], 30);
  s = matchReducer(s, { type: "start", now: 0 });
  assert.equal(s.phase, "countdown");
  s = matchReducer(s, { type: "answer", correct: true, now: 2000 });
  assert.equal(s.cursor, 0);
  s = matchReducer(s, { type: "tick", now: 3000 });
  assert.equal(s.phase, "playing");
  s = matchReducer(s, { type: "answer", correct: true, now: 4000 });
  assert.equal(s.cursor, 1);
  s = matchReducer(s, { type: "answer", correct: true, now: 4001 });
  assert.equal(s.cursor, 1);
  s = matchReducer(s, { type: "answer", correct: false, now: 4500 });
  assert.equal(s.cursor, 2);
  s = matchReducer(s, { type: "answer", correct: true, now: 33000 });
  assert.equal(s.cursor, 2);
  s = matchReducer(s, { type: "tick", now: 34000 });
  assert.equal(s.phase, "review");
  s = matchReducer(s, { type: "next", now: 34001 });
  assert.deepEqual(s.scores, [1, 0]);
  s = matchReducer(s, { type: "next", now: 34002 });
  assert.deepEqual(s.scores, [1, 0]);
  assert.equal(s.turn, 1);
});
test("timed challenge: time expiry requires a single manual verdict", () => {
  let s = newMatch("five", ["A", "B"], ["frutas", "cores"], 5);
  s = matchReducer(s, { type: "start", now: 0 });
  s = matchReducer(s, { type: "tick", now: 3000 });
  s = matchReducer(s, { type: "tick", now: 8000 });
  assert.equal(s.phase, "review");
  s = matchReducer(s, { type: "next", now: 9000 });
  assert.equal(s.turn, 0);
  s = matchReducer(s, { type: "answer", correct: true, now: 9000 });
  s = matchReducer(s, { type: "answer", correct: true, now: 9001 });
  assert.equal(s.answers.length, 1);
  s = matchReducer(s, { type: "next", now: 10000 });
  assert.deepEqual(s.scores, [1, 0]);
});
test("voting: invalid player, tie, duplicate votes and final results", () => {
  let s = newMatch("likely", ["Ana", "Bia"], ["Q1", "Q2"], 0);
  s = matchReducer(s, { type: "start", now: 0 });
  s = matchReducer(s, { type: "vote", player: 50, now: 1 });
  assert.equal(s.phase, "playing");
  s = matchReducer(s, { type: "vote", player: 1, now: 1 });
  s = matchReducer(s, { type: "vote", player: 1, now: 2 });
  assert.deepEqual(s.scores, [0, 1]);
  s = matchReducer(s, { type: "next", now: 3 });
  s = matchReducer(s, { type: "start", now: 4 });
  s = matchReducer(s, { type: "vote", player: null, now: 5 });
  s = matchReducer(s, { type: "next", now: 6 });
  assert.equal(s.phase, "results");
  assert.deepEqual(s.scores, [0, 1]);
});
test("empty score, exhausted deck and clock clamping", () => {
  let s = newMatch("mime", ["Ana", "Bia"], ["Gato"], 30);
  s = matchReducer(s, { type: "start", now: 0 });
  s = matchReducer(s, { type: "tick", now: 3000 });
  s = matchReducer(s, { type: "answer", correct: true, now: 4000 });
  assert.equal(s.phase, "review");
  s = matchReducer(s, { type: "next", now: 5000 });
  assert.equal(s.phase, "results");
  assert.deepEqual(s.scores, [1, 0]);
  assert.equal(remainingSeconds(1000, 1001), 0);
  assert.equal(remainingSeconds(1000, 1), 1);
});
test("rooms: custom names, collision handling, renaming and private views", () => {
  const room = newRoom("123456", "Jogador 2");
  const host = room.players[0];
  const guest = addMember(room);
  assert.equal(guest.name, "Jogador 3");
  addMember(room, "Bia");
  assert.throws(() => addMember(room, "BIA"));
  change(room, guest.token, "rename", { name: "João" });
  assert.equal(guest.name, "João");
  assert.throws(() => change(room, guest.token, "rename", { name: "Bia" }));
  change(room, host.token, "start", {});
  assert.throws(() => change(room, guest.token, "rename", { name: "Pedro" }));
  for (const p of room.players) {
    const data = view(room, p.token);
    assert.ok(data.players.every((p) => !("token" in p)));
    if (data.role === "impostor") assert.equal(data.word, null);
  }
});

test("timeout consumes the visible word before passing to the next player", () => {
  let state = newMatch("heads", ["Ana", "Bia"], ["Gato", "Café"], 30);
  state = matchReducer(state, { type: "start", now: 0 });
  state = matchReducer(state, { type: "tick", now: 3000 });
  state = matchReducer(state, { type: "tick", now: 33000 });
  assert.equal(state.cursor, 1);
  assert.equal(state.answers[0].timedOut, true);
  state = matchReducer(state, { type: "next", now: 34000 });
  assert.equal(state.deck[state.cursor], "Café");
});

test("balanced draw: favors less-selected people without making anybody impossible", async () => {
  const { balancedDraw, drawWeights } = await import("../lib/draw");
  const history = { counts: { a: 3, b: 0, c: 1 }, last: ["a"] };
  const weights = drawWeights(["a", "b", "c"], history);
  assert.ok(
    weights[1] > weights[2] && weights[2] > weights[0] && weights[0] > 0,
  );
  const result = balancedDraw(["a", "b", "c"], 2, history, () => 0);
  assert.equal(new Set(result.selected).size, 2);
  assert.equal(result.history.counts.a, 4);
  assert.equal(history.counts.a, 3);
  assert.deepEqual(
    Object.keys(balancedDraw(["b", "new"], 1, history, () => 0).history.counts),
    ["b", "new"],
  );
  assert.throws(() => balancedDraw(["a"], 2));
  const room = newRoom("123456");
  addMember(room);
  addMember(room);
  change(room, room.players[0].token, "start", {});
  const publicView = view(room, room.players[0].token);
  assert.ok(!("roleHistory" in publicView));
  assert.ok(!("starterHistory" in publicView));
});
