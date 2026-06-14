import type Database from "better-sqlite3";

export function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'to_do'
        CHECK (status IN ('to_do', 'pending', 'in_progress', 'done')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY,
      task_id TEXT NOT NULL,
      actor TEXT NOT NULL,
      from_status TEXT NOT NULL
        CHECK (from_status IN ('to_do', 'pending', 'in_progress', 'done')),
      to_status TEXT NOT NULL
        CHECK (to_status IN ('to_do', 'pending', 'in_progress', 'done')),
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT,
      CHECK (from_status <> to_status)
    );

    CREATE INDEX IF NOT EXISTS audit_logs_task_id_created_at_index
      ON audit_logs(task_id, created_at, id);

    CREATE TRIGGER IF NOT EXISTS prevent_audit_logs_update
    BEFORE UPDATE ON audit_logs
    BEGIN
      SELECT RAISE(ABORT, 'audit logs are immutable');
    END;

    CREATE TRIGGER IF NOT EXISTS prevent_audit_logs_delete
    BEFORE DELETE ON audit_logs
    BEGIN
      SELECT RAISE(ABORT, 'audit logs are immutable');
    END;
  `);
}
