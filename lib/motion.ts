export type TiltAction = "correct" | "pass";
export type TiltState = {
  armed: boolean;
  candidate: TiltAction | null;
  since: number;
  lastAction: number;
};
export const initialTilt = (): TiltState => ({
  armed: false,
  candidate: null,
  since: 0,
  lastAction: -Infinity,
});
export function screenTilt(
  beta: number | null,
  gamma: number | null,
): number | null {
  if (
    beta === null ||
    gamma === null ||
    !Number.isFinite(beta) ||
    !Number.isFinite(gamma)
  )
    return null;
  const rad = Math.PI / 180;
  return (
    Math.asin(
      Math.max(-1, Math.min(1, Math.cos(beta * rad) * Math.cos(gamma * rad))),
    ) / rad
  );
}
export function detectTilt(
  state: TiltState,
  angle: number | null,
  now: number,
): { state: TiltState; action: TiltAction | null } {
  if (angle === null || !Number.isFinite(angle)) return { state, action: null };
  if (Math.abs(angle) < 20)
    return { state: { ...state, armed: true, candidate: null }, action: null };
  const candidate = angle > 45 ? "correct" : angle < -45 ? "pass" : null;
  if (!state.armed || !candidate || now - state.lastAction < 900)
    return { state: { ...state, candidate: null }, action: null };
  if (candidate !== state.candidate)
    return { state: { ...state, candidate, since: now }, action: null };
  if (now - state.since < 180) return { state, action: null };
  return {
    state: { armed: false, candidate: null, since: now, lastAction: now },
    action: candidate,
  };
}
