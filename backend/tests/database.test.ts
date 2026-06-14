import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createDatabase } from "../src/database/database.js";

describe("createDatabase", () => {
  let database: ReturnType<typeof createDatabase>;

  beforeEach(() => {
    database = createDatabase(":memory:");
  });

  afterEach(() => {
    database.close();
  });

  it("configures SQLite and initializes the schema", () => {
    const tables = database
      .prepare(
        `
          SELECT name
          FROM sqlite_master
          WHERE type = 'table'
          ORDER BY name
        `,
      )
      .pluck()
      .all();

    expect(database.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(database.pragma("busy_timeout", { simple: true })).toBe(5000);
    expect(tables).toEqual(["audit_logs", "tasks"]);
  });

  it("prevents audit logs from being updated or deleted", () => {
    database
      .prepare(
        `
          INSERT INTO tasks (id, title, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `,
      )
      .run("task-1", "Prepare invoice", "to_do", "created", "created");
    database
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
      .run("task-1", "john.doe", "to_do", "pending", "created");

    expect(() =>
      database
        .prepare("UPDATE audit_logs SET actor = ? WHERE id = ?")
        .run("jane.smith", 1),
    ).toThrow("audit logs are immutable");
    expect(() =>
      database.prepare("DELETE FROM audit_logs WHERE id = ?").run(1),
    ).toThrow("audit logs are immutable");

    expect(
      database.prepare("SELECT COUNT(*) FROM audit_logs").pluck().get(),
    ).toBe(1);
  });
});
