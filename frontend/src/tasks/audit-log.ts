import type { Actor } from "./actor";
import type { TaskStatus } from "./task";

export interface AuditLog {
  id: number;
  taskId: string;
  actor: Actor;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  createdAt: string;
}

export function taskAuditLogsQueryKey(taskId: string) {
  return ["tasks", taskId, "audit-logs"] as const;
}
