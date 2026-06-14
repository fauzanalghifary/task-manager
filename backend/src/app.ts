import express from "express";
import type Database from "better-sqlite3";

import { healthHandler } from "./health/health-handler.js";
import { TaskRepository } from "./tasks/task-repository.js";
import { createTaskRouter } from "./tasks/task-router.js";

export function createApp(database: Database.Database) {
  const app = express();
  const taskRepository = new TaskRepository(database);

  app.use(express.json());
  app.get("/api/health", healthHandler);
  app.use("/api/tasks", createTaskRouter(taskRepository));

  return app;
}
