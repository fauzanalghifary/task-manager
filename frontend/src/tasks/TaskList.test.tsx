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

  it("shows every status group when no tasks exist", () => {
    render(<TaskList isError={false} isPending={false} tasks={[]} />);

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["To do", "Pending", "In progress", "Done"]);
    expect(screen.getAllByText("No tasks")).toHaveLength(4);
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

  it("groups tasks by status in workflow order", () => {
    render(
      <TaskList
        isError={false}
        isPending={false}
        tasks={[
          { ...task, id: "done", title: "Archive invoice", status: "done" },
          {
            ...task,
            id: "pending",
            title: "Review invoice",
            status: "pending",
          },
          task,
        ]}
      />,
    );

    const groupHeadings = screen.getAllByRole("heading", { level: 2 });

    expect(groupHeadings.map((heading) => heading.textContent)).toEqual([
      "To do",
      "Pending",
      "In progress",
      "Done",
    ]);
    expect(
      screen.getByRole("heading", { level: 2, name: "In progress" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No tasks")).toBeInTheDocument();
  });
});
