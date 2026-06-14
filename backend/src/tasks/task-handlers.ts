import type { RequestHandler } from "express";
import { z } from "zod";

import type { TaskRepository } from "./task-repository.js";

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1).optional(),
});

export function createListTasksHandler(
  taskRepository: TaskRepository,
): RequestHandler {
  return (_request, response) => {
    response.json(taskRepository.findAll());
  };
}

export function createCreateTaskHandler(
  taskRepository: TaskRepository,
): RequestHandler {
  return (request, response) => {
    const result = createTaskSchema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        error: "Invalid request",
        details: z.flattenError(result.error).fieldErrors,
      });
      return;
    }

    const task = taskRepository.create(result.data);

    response.status(201).json(task);
  };
}
