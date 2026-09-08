import { randomInt } from "./words";
export type DrawHistory = { counts: Record<string, number>; last: string[] };
export const emptyHistory = (): DrawHistory => ({ counts: {}, last: [] });
export function drawWeights(ids: string[], history: DrawHistory): number[] {
  const minimum = Math.min(...ids.map((id) => history.counts[id] ?? 0));
  return ids.map((id) => {
    const difference = Math.max(0, (history.counts[id] ?? 0) - minimum);
    return Math.max(
      1,
      Math.floor(
        (1000 / 2 ** Math.min(8, difference)) *
          (history.last.includes(id) ? 0.35 : 1),
      ),
    );
  });
}
export function balancedDraw(
  ids: string[],
  count: number,
  previous: DrawHistory = emptyHistory(),
  random = randomInt,
) {
  if (
    !ids.length ||
    new Set(ids).size !== ids.length ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > ids.length
  )
    throw new Error("Participantes inválidos para o sorteio.");
  const history: DrawHistory = {
    counts: Object.fromEntries(ids.map((id) => [id, previous.counts[id] ?? 0])),
    last: previous.last.filter((id) => ids.includes(id)),
  };
  const remaining = [...ids];
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const weights = drawWeights(remaining, history);
    let ticket = random(weights.reduce((sum, weight) => sum + weight, 0));
    let index = 0;
    while (index < weights.length - 1 && ticket >= weights[index]) {
      ticket -= weights[index];
      index++;
    }
    selected.push(remaining.splice(index, 1)[0]);
  }
  for (const id of selected) history.counts[id]++;
  history.last = selected;
  return { selected, history };
}
