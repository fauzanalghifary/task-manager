import type { Actor } from "./actor";
import type { AuditLog } from "./audit-log";
import type { Task, TaskStatus } from "./task";

export interface CreateTaskInput {
  title: string;
}

export interface UpdateTaskStatusInput {
  id: string;
  status: TaskStatus;
  actor: Actor;
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks");

  if (!response.ok) {
    throw new Error("Unable to load tasks");
  }

  return response.json() as Promise<Task[]>;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Unable to create task");
  }

  return response.json() as Promise<Task>;
}

export async function updateTaskStatus({
  id,
  status,
  actor,
}: UpdateTaskStatusInput): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, actor }),
  });

  if (!response.ok) {
    throw new Error("Unable to update task status");
  }

  const result = (await response.json()) as { task: Task; changed: boolean };
  return result.task;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete task");
  }
}

export async function fetchTaskAuditLogs(taskId: string): Promise<AuditLog[]> {
  const response = await fetch(`/api/tasks/${taskId}/audit-logs`);

  if (!response.ok) {
    throw new Error("Unable to load task history");
  }

  return response.json() as Promise<AuditLog[]>;
}
