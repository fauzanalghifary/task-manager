import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AuditLog } from "./audit-log";
import type { Task } from "./task";
import { TaskList } from "./TaskList";

const task: Task = {
  id: "task-1",
  title: "Prepare invoice",
  status: "to_do",
  createdAt: "2026-06-14T10:00:00.000Z",
  updatedAt: "2026-06-14T10:00:00.000Z",
};

const requiredTaskListProps = {
  busyTaskId: null,
  onAdvance: vi.fn(),
  onDelete: vi.fn(),
  loadAuditLogs: vi.fn().mockResolvedValue([]),
};

describe("TaskList", () => {
  it("shows a loading state", () => {
    render(
      <TaskList
        {...requiredTaskListProps}
        isError={false}
        isPending
        tasks={[]}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading tasks...");
  });

  it("shows every status group when no tasks exist", () => {
    render(
      <TaskList
        {...requiredTaskListProps}
        isError={false}
        isPending={false}
        tasks={[]}
      />,
    );

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["To do", "Pending", "In progress", "Done"]);
    expect(screen.getAllByText("No tasks")).toHaveLength(4);
  });

  it("shows an error state when tasks cannot be loaded", () => {
    render(
      <TaskList
        {...requiredTaskListProps}
        isError
        isPending={false}
        tasks={[]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tasks could not be loaded. Please try again.",
    );
  });

  it("renders tasks returned by the API", () => {
    render(
      <TaskList
        {...requiredTaskListProps}
        isError={false}
        isPending={false}
        tasks={[task]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Prepare invoice" }),
    ).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
  });

  it("groups tasks by status in workflow order", () => {
    render(
      <TaskList
        {...requiredTaskListProps}
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

  it("loads and shows task history only when expanded", async () => {
    const user = userEvent.setup();
    const auditLogs: AuditLog[] = [
      {
        id: 1,
        taskId: task.id,
        actor: "john.doe",
        fromStatus: "to_do",
        toStatus: "pending",
        createdAt: "2026-06-14T10:00:00.000Z",
      },
      {
        id: 2,
        taskId: task.id,
        actor: "jane.smith",
        fromStatus: "pending",
        toStatus: "in_progress",
        createdAt: "2026-06-14T11:00:00.000Z",
      },
    ];
    const loadAuditLogs = vi.fn().mockResolvedValue(auditLogs);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TaskList
          {...requiredTaskListProps}
          isError={false}
          isPending={false}
          tasks={[task]}
          loadAuditLogs={loadAuditLogs}
        />
      </QueryClientProvider>,
    );

    expect(loadAuditLogs).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "View history" }));

    const history = await screen.findByRole("list", {
      name: "Status change history",
    });
    const entries = within(history).getAllByRole("listitem");

    expect(loadAuditLogs).toHaveBeenCalledWith(task.id);
    expect(entries.map((entry) => entry.textContent)).toEqual([
      expect.stringContaining("John Doe"),
      expect.stringContaining("Jane Smith"),
    ]);
    expect(
      screen.getByRole("button", { name: "Hide history" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
