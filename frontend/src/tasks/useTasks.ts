import { useEffect, useState } from "react";

import { fetchTasks } from "./task-api";
import type { Task } from "./task";

export type TaskLoader = () => Promise<Task[]>;

export type TasksState =
  | { status: "loading" }
  | { status: "success"; tasks: Task[] }
  | { status: "error" };

export function useTasks(loadTasks: TaskLoader = fetchTasks): TasksState {
  const [state, setState] = useState<TasksState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    void loadTasks()
      .then((tasks) => {
        if (isActive) {
          setState({ status: "success", tasks });
        }
      })
      .catch(() => {
        if (isActive) {
          setState({ status: "error" });
        }
      });

    return () => {
      isActive = false;
    };
  }, [loadTasks]);

  return state;
}
