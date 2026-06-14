import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Task } from "./task";
import { TasksSection } from "./TasksSection";

const createdTask: Task = {
  id: "task-1",
  title: "Prepare invoice",
  description: null,
  status: "to_do",
  createdAt: "2026-06-14T10:00:00.000Z",
  updatedAt: "2026-06-14T10:00:00.000Z",
};

describe("TasksSection", () => {
  it("refreshes the task list after creating a task", async () => {
    const user = userEvent.setup();
    const loadTasks = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createdTask]);
    const submitTask = vi.fn().mockResolvedValue(createdTask);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TasksSection loadTasks={loadTasks} submitTask={submitTask} />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("No tasks yet")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Title"), "Prepare invoice");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(
      await screen.findByRole("heading", { name: "Prepare invoice" }),
    ).toBeInTheDocument();
    expect(loadTasks).toHaveBeenCalledTimes(2);
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });
});
