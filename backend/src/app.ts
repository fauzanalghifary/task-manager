import express from "express";
import type Database from "better-sqlite3";

import { AuditLogRepository } from "./audit-logs/audit-log-repository.js";
import { errorHandler } from "./errors/error-handler.js";
import { healthHandler } from "./health/health-handler.js";
import { TaskRepository } from "./tasks/task-repository.js";
import { createTaskRouter } from "./tasks/task-router.js";
import { TaskService } from "./tasks/task-service.js";

export function createApp(database: Database.Database) {
  const app = express();
  const taskRepository = new TaskRepository(database);
  const auditLogRepository = new AuditLogRepository(database);
  const taskService = new TaskService(
    database,
    taskRepository,
    auditLogRepository,
  );

  app.use(express.json());
  app.get("/api/health", healthHandler);
  app.use("/api/tasks", createTaskRouter(taskRepository, taskService));
  app.use(errorHandler);

  return app;
}
