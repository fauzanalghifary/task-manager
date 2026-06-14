import type { Task } from "./task";

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks");

  if (!response.ok) {
    throw new Error("Unable to load tasks");
  }

  return response.json() as Promise<Task[]>;
}
