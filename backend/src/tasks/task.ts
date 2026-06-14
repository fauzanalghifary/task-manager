export const taskStatuses = [
  "to_do",
  "pending",
  "in_progress",
  "done",
] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
