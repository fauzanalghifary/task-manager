import type { RequestHandler } from "express";
import { z } from "zod";

import { actors } from "../actors/actor.js";
import type { TaskRepository } from "./task-repository.js";
import {
  InvalidStatusTransitionError,
  TaskNotFoundError,
  TaskStatusConflictError,
  type TaskService,
} from "./task-service.js";
import { taskStatuses } from "./task.js";

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

const updateStatusSchema = z.object({
  status: z.enum(taskStatuses),
  actor: z.enum(actors),
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

export function createUpdateTaskStatusHandler(
  taskService: TaskService,
): RequestHandler<{ id: string }> {
  return (request, response) => {
    const result = updateStatusSchema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        error: "Invalid request",
        details: z.flattenError(result.error).fieldErrors,
      });
      return;
    }

    try {
      response.json(
        taskService.updateStatus(
          request.params.id,
          result.data.status,
          result.data.actor,
        ),
      );
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        response.status(404).json({ error: "Task not found" });
        return;
      }

      if (error instanceof InvalidStatusTransitionError) {
        response.status(422).json({ error: "Invalid status transition" });
        return;
      }

      if (error instanceof TaskStatusConflictError) {
        response.status(409).json({ error: "Task status changed" });
        return;
      }

      throw error;
    }
  };
}

export function createListAuditLogsHandler(
  taskService: TaskService,
): RequestHandler<{ id: string }> {
  return (request, response) => {
    try {
      response.json(taskService.findAuditLogs(request.params.id));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        response.status(404).json({ error: "Task not found" });
        return;
      }

      throw error;
    }
  };
}
