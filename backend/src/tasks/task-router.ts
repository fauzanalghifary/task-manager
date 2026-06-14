import { Router } from "express";

import {
  createCreateTaskHandler,
  createListTasksHandler,
} from "./task-handlers.js";
import type { TaskRepository } from "./task-repository.js";

export function createTaskRouter(taskRepository: TaskRepository): Router {
  const router = Router();

  router.get("/", createListTasksHandler(taskRepository));
  router.post("/", createCreateTaskHandler(taskRepository));

  return router;
}
