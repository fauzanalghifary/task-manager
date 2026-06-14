import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Task } from "./task";
import { TaskList } from "./TaskList";

const task: Task = {
  id: "task-1",
  title: "Prepare invoice",
  description: "Send it to the customer",
  status: "to_do",
  createdAt: "2026-06-14T10:00:00.000Z",
  updatedAt: "2026-06-14T10:00:00.000Z",
};

describe("TaskList", () => {
  it("shows a loading state while tasks are being fetched", () => {
    const loadTasks = vi.fn(() => new Promise<Task[]>(() => undefined));

    render(<TaskList loadTasks={loadTasks} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tasks...");
  });

  it("shows an empty state when no tasks exist", async () => {
    render(<TaskList loadTasks={async () => []} />);

    expect(await screen.findByText("No tasks yet")).toBeInTheDocument();
    expect(screen.getByText("New tasks will appear here.")).toBeInTheDocument();
  });

  it("shows an error state when tasks cannot be loaded", async () => {
    const loadTasks = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<TaskList loadTasks={loadTasks} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tasks could not be loaded. Please try again.",
    );
  });

  it("renders tasks returned by the API", async () => {
    render(<TaskList loadTasks={async () => [task]} />);

    expect(
      await screen.findByRole("heading", { name: "Prepare invoice" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Send it to the customer")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });
});
