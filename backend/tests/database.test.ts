import { afterEach, describe, expect, it } from "vitest";

import { createDatabase } from "../src/database/database.js";

describe("createDatabase", () => {
  const database = createDatabase(":memory:");

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
});
