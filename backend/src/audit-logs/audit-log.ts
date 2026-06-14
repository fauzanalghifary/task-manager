import type { Actor } from "../actors/actor.js";
import type { TaskStatus } from "../tasks/task.js";

export interface AuditLog {
  id: number;
  taskId: string;
  actor: Actor;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  createdAt: string;
}
