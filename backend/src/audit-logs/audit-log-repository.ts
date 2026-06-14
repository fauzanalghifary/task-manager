import type Database from "better-sqlite3";

import type { Actor } from "../actors/actor.js";
import type { TaskStatus } from "../tasks/task.js";
import type { AuditLog } from "./audit-log.js";

interface AuditLogRow {
  id: number;
  task_id: string;
  actor: Actor;
  from_status: TaskStatus;
  to_status: TaskStatus;
  created_at: string;
}

interface CreateAuditLogInput {
  taskId: string;
  actor: Actor;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  createdAt: string;
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    taskId: row.task_id,
    actor: row.actor,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    createdAt: row.created_at,
  };
}

export class AuditLogRepository {
  constructor(private readonly database: Database.Database) {}

  create(input: CreateAuditLogInput): AuditLog {
    const result = this.database
      .prepare(
        `
          INSERT INTO audit_logs (
            task_id,
            actor,
            from_status,
            to_status,
            created_at
          )
          VALUES (?, ?, ?, ?, ?)
        `,
      )
      .run(
        input.taskId,
        input.actor,
        input.fromStatus,
        input.toStatus,
        input.createdAt,
      );

    return {
      id: Number(result.lastInsertRowid),
      ...input,
    };
  }

  findByTaskId(taskId: string): AuditLog[] {
    const rows = this.database
      .prepare(
        `
          SELECT id, task_id, actor, from_status, to_status, created_at
          FROM audit_logs
          WHERE task_id = ?
          ORDER BY created_at, id
        `,
      )
      .all(taskId) as AuditLogRow[];

    return rows.map(mapAuditLog);
  }
}
