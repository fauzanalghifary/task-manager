import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Task } from "./task";
import { TaskList } from "./TaskList";

const task: Task = {
  id: "task-1",
  title: "Prepare invoice",
  status: "to_do",
  createdAt: "2026-06-14T10:00:00.000Z",
  updatedAt: "2026-06-14T10:00:00.000Z",
};

describe("TaskList", () => {
  it("shows a loading state", () => {
    render(<TaskList isError={false} isPending tasks={[]} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading tasks...");
  });

  it("shows an empty state when no tasks exist", () => {
    render(<TaskList isError={false} isPending={false} tasks={[]} />);

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    expect(screen.getByText("New tasks will appear here.")).toBeInTheDocument();
  });

  it("shows an error state when tasks cannot be loaded", () => {
    render(<TaskList isError isPending={false} tasks={[]} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tasks could not be loaded. Please try again.",
    );
  });

  it("renders tasks returned by the API", () => {
    render(<TaskList isError={false} isPending={false} tasks={[task]} />);

    expect(
      screen.getByRole("heading", { name: "Prepare invoice" }),
    ).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
  });
});
