import { Router } from "express";

import {
  createCreateTaskHandler,
  createListTasksHandler,
  createListAuditLogsHandler,
  createUpdateTaskStatusHandler,
} from "./task-handlers.js";
import type { TaskRepository } from "./task-repository.js";
import type { TaskService } from "./task-service.js";

export function createTaskRouter(
  taskRepository: TaskRepository,
  taskService: TaskService,
): Router {
  const router = Router();

  router.get("/", createListTasksHandler(taskRepository));
  router.post("/", createCreateTaskHandler(taskRepository));
  router.patch("/:id/status", createUpdateTaskStatusHandler(taskService));
  router.get("/:id/audit-logs", createListAuditLogsHandler(taskService));

  return router;
}
