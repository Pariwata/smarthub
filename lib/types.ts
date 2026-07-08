// Shared domain constants and helper types used across the API and UI.

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_ROLES = ["owner", "manager", "member", "viewer"] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

/** Aggregated progress numbers over a set of tasks. */
export type Progress = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  /** Percentage of tasks that are done, 0–100 (rounded). */
  percent: number;
};

export function computeProgress(
  tasks: { status: string }[]
): Progress {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = total - done - inProgress;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, todo, inProgress, done, percent };
}
