export const LAUNCH_GOAL = 100;
export const MOMENTUM_THRESHOLD = 15;
export const ALMOST_THERE_THRESHOLD = 70;

export type LaunchMilestone = "early" | "momentum" | "almost" | "done";

export function getLaunchProgress(count: number, goal: number = LAUNCH_GOAL): number {
  return Math.min((count / goal) * 100, 100);
}

export function getLaunchMilestone(
  count: number,
  goal: number = LAUNCH_GOAL
): LaunchMilestone {
  if (count >= goal) return "done";
  if (count >= ALMOST_THERE_THRESHOLD) return "almost";
  if (count >= MOMENTUM_THRESHOLD) return "momentum";
  return "early";
}
