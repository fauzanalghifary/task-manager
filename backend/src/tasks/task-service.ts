import type Database from "better-sqlite3";

import type { Actor } from "../actors/actor.js";
import type { AuditLogRepository } from "../audit-logs/audit-log-repository.js";
import type { AuditLog } from "../audit-logs/audit-log.js";
import type { TaskRepository } from "./task-repository.js";
import type { Task, TaskStatus } from "./task.js";

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  to_do: "pending",
  pending: "in_progress",
  in_progress: "done",
  done: null,
};

export class TaskNotFoundError extends Error {}

export class InvalidStatusTransitionError extends Error {}

export class TaskStatusConflictError extends Error {}

interface UpdateStatusResult {
  task: Task;
  changed: boolean;
}

export class TaskService {
  constructor(
    private readonly database: Database.Database,
    private readonly taskRepository: TaskRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  updateStatus(
    taskId: string,
    toStatus: TaskStatus,
    actor: Actor,
  ): UpdateStatusResult {
    const updateStatusTransaction = this.database.transaction(() => {
      const task = this.taskRepository.findById(taskId);

      if (!task) {
        throw new TaskNotFoundError();
      }

      if (task.status === toStatus) {
        return { task, changed: false };
      }

      if (nextStatus[task.status] !== toStatus) {
        throw new InvalidStatusTransitionError();
      }

      const updatedAt = new Date().toISOString();
      const didUpdate = this.taskRepository.updateStatus(
        task.id,
        task.status,
        toStatus,
        updatedAt,
      );

      if (!didUpdate) {
        throw new TaskStatusConflictError();
      }

      this.auditLogRepository.create({
        taskId: task.id,
        actor,
        fromStatus: task.status,
        toStatus,
        createdAt: updatedAt,
      });

      return {
        changed: true,
        task: {
          ...task,
          status: toStatus,
          updatedAt,
        },
      };
    });

    return updateStatusTransaction.immediate();
  }

  findAuditLogs(taskId: string): AuditLog[] {
    if (!this.taskRepository.findById(taskId)) {
      throw new TaskNotFoundError();
    }

    return this.auditLogRepository.findByTaskId(taskId);
  }
}
