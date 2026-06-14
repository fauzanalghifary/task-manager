import { randomUUID } from "node:crypto";

import type Database from "better-sqlite3";

import type { Task, TaskStatus } from "./task.js";

interface TaskRow {
  id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

interface CreateTaskInput {
  title: string;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TaskRepository {
  constructor(private readonly database: Database.Database) {}

  create(input: CreateTaskInput): Task {
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      status: "to_do",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.database
      .prepare(
        `
          INSERT INTO tasks (
            id,
            title,
            status,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?)
        `,
      )
      .run(task.id, task.title, task.status, task.createdAt, task.updatedAt);

    return task;
  }

  findAll(): Task[] {
    const rows = this.database
      .prepare(
        `
          SELECT id, title, status, created_at, updated_at
          FROM tasks
          WHERE deleted_at IS NULL
          ORDER BY created_at, rowid
        `,
      )
      .all() as TaskRow[];

    return rows.map(mapTask);
  }

  findById(id: string): Task | null {
    const row = this.database
      .prepare(
        `
          SELECT id, title, status, created_at, updated_at
          FROM tasks
          WHERE id = ? AND deleted_at IS NULL
        `,
      )
      .get(id) as TaskRow | undefined;

    return row ? mapTask(row) : null;
  }

  exists(id: string): boolean {
    return (
      this.database
        .prepare("SELECT 1 FROM tasks WHERE id = ?")
        .pluck()
        .get(id) === 1
    );
  }

  updateStatus(
    id: string,
    fromStatus: TaskStatus,
    toStatus: TaskStatus,
    updatedAt: string,
  ): boolean {
    const result = this.database
      .prepare(
        `
          UPDATE tasks
          SET status = ?, updated_at = ?
          WHERE id = ? AND status = ? AND deleted_at IS NULL
        `,
      )
      .run(toStatus, updatedAt, id, fromStatus);

    return result.changes === 1;
  }

  softDelete(id: string, deletedAt: string): boolean {
    const result = this.database
      .prepare(
        `
          UPDATE tasks
          SET deleted_at = ?, updated_at = ?
          WHERE id = ? AND deleted_at IS NULL
        `,
      )
      .run(deletedAt, deletedAt, id);

    return result.changes === 1;
  }
}
