export type TaskStatus = "to_do" | "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
