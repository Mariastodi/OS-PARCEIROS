import { type Answer, type PartyGame, roundScore } from "./party";
export type Match = {
  game: PartyGame;
  phase: "ready" | "countdown" | "playing" | "review" | "results";
  players: string[];
  scores: number[];
  turn: number;
  deck: string[];
  cursor: number;
  answers: Answer[];
  deadline: number;
  duration: number;
  lastAnswer: number;
  graded: boolean;
  vote: number | null;
};
export type MatchAction =
  | { type: "start" | "tick" | "end" | "next"; now: number }
  | { type: "answer"; correct: boolean; now: number }
  | { type: "vote"; player: number | null; now: number };
export function newMatch(
  game: PartyGame,
  players: string[],
  deck: string[],
  duration: number,
): Match {
  return {
    game,
    players,
    deck,
    duration,
    phase: "ready",
    scores: players.map(() => 0),
    turn: 0,
    cursor: 0,
    answers: [],
    deadline: 0,
    lastAnswer: -Infinity,
    graded: false,
    vote: null,
  };
}
export const multiWord = (game: PartyGame) =>
  game === "heads" || game === "mime";
export const totalTurns = (match: Match) =>
  match.game === "likely"
    ? Math.min(10, match.deck.length)
    : match.players.length;
function finishTurn(state: Match): Match {
  const word = state.deck[state.cursor];
  if (multiWord(state.game) && word) {
    return {
      ...state,
      phase: "review",
      cursor: state.cursor + 1,
      answers: [...state.answers, { word, correct: false, timedOut: true }],
    };
  }
  return { ...state, phase: "review" };
}
export function matchReducer(state: Match, action: MatchAction): Match {
  const { now } = action;
  if (action.type === "start" && state.phase === "ready") {
    return {
      ...state,
      phase: state.game === "likely" ? "playing" : "countdown",
      deadline: now + 3000,
    };
  }
  if (action.type === "tick") {
    if (state.phase === "countdown" && now >= state.deadline)
      return {
        ...state,
        phase: "playing",
        deadline: now + state.duration * 1000,
      };
    if (
      state.phase === "playing" &&
      state.game !== "likely" &&
      now >= state.deadline
    )
      return finishTurn(state);
  }
  if (
    action.type === "end" &&
    state.phase === "playing" &&
    state.game !== "likely"
  )
    return finishTurn(state);
  if (
    action.type === "vote" &&
    state.phase === "playing" &&
    state.game === "likely"
  ) {
    if (
      action.player !== null &&
      (!Number.isInteger(action.player) || !state.players[action.player])
    )
      return state;
    return {
      ...state,
      phase: "review",
      graded: true,
      vote: action.player,
      scores: state.scores.map(
        (score, i) => score + (i === action.player ? 1 : 0),
      ),
    };
  }
  if (action.type === "answer") {
    if (state.game === "likely") return state;
    const multiple = multiWord(state.game);
    if (
      multiple &&
      (state.phase !== "playing" ||
        now >= state.deadline ||
        now - state.lastAnswer < 400)
    )
      return state;
    if (
      !multiple &&
      (state.graded || !["playing", "review"].includes(state.phase))
    )
      return state;
    const word = state.deck[state.cursor];
    if (!word) return state;
    const answers = [...state.answers, { word, correct: action.correct }];
    return {
      ...state,
      answers,
      cursor: state.cursor + 1,
      lastAnswer: now,
      graded: !multiple,
      phase:
        !multiple || state.cursor + 1 >= state.deck.length
          ? "review"
          : "playing",
    };
  }
  if (action.type === "next" && state.phase === "review") {
    if (!multiWord(state.game) && !state.graded) return state;
    const scores =
      state.game === "likely"
        ? state.scores
        : state.scores.map(
            (score, i) =>
              score +
              (i === state.turn % state.players.length
                ? roundScore(state.answers)
                : 0),
          );
    const cursor = state.game === "likely" ? state.cursor + 1 : state.cursor;
    const done =
      state.turn + 1 >= totalTurns(state) || cursor >= state.deck.length;
    return {
      ...state,
      scores,
      cursor,
      turn: state.turn + 1,
      phase: done ? "results" : "ready",
      answers: [],
      lastAnswer: -Infinity,
      graded: false,
      vote: null,
    };
  }
  return state;
}
