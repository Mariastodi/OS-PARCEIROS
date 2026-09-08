import { matchReducer, newMatch, type Match } from "./party-engine";
import {
  challengePrompts,
  fivePrompts,
  partyGames,
  type PartyGame,
} from "./party";
import { poolFor, shuffle } from "./words";

export type RoomGame = "impostor" | PartyGame;
export const isPartyRoom = (game?: RoomGame) =>
  Boolean(game && game !== "impostor" && game !== "likely");

export function advanceParty(match: Match, now = Date.now()): Match {
  let next = match;
  if (next.phase === "countdown" && now >= next.deadline)
    next = matchReducer(next, { type: "tick", now: next.deadline });
  return matchReducer(next, { type: "tick", now });
}

export function createParty(
  game: PartyGame,
  players: string[],
  category: string,
  duration?: number,
) {
  const deck =
    game === "challenge"
      ? challengePrompts
      : game === "five"
        ? fivePrompts
        : poolFor(category);
  return newMatch(
    game,
    players,
    shuffle(deck),
    duration ?? partyGames[game].duration,
  );
}
