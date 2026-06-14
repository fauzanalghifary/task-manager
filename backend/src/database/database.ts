import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { initializeSchema } from "./schema.js";

export function createDatabase(filename: string): Database.Database {
  if (filename !== ":memory:") {
    mkdirSync(path.dirname(filename), { recursive: true });
  }

  const database = new Database(filename);

  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  initializeSchema(database);

  return database;
}
