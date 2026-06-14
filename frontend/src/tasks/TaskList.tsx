import { nextStatus, type Task, type TaskStatus } from "./task";

interface TaskListProps {
  isError: boolean;
  isPending: boolean;
  tasks: Task[];
  busyTaskId?: string | null;
  onAdvance?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  to_do: "To do",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

const statusDot: Record<TaskStatus, string> = {
  to_do: "bg-(--status-to-do)",
  pending: "bg-(--status-pending)",
  in_progress: "bg-(--status-in-progress)",
  done: "bg-(--status-done)",
};

const statusOrder: TaskStatus[] = ["to_do", "pending", "in_progress", "done"];

export function TaskList({
  isError,
  isPending,
  tasks,
  busyTaskId,
  onAdvance,
  onDelete,
}: TaskListProps) {
  if (isPending) {
    return (
      <p role="status" className="text-sm text-(--ink-mute)">
        Loading tasks...
      </p>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-(--danger)">
        Tasks could not be loaded. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {statusOrder.map((status) => {
        const tasksInStatus = tasks.filter((task) => task.status === status);

        return (
          <section key={status} aria-labelledby={`status-${status}`}>
            <div className="mb-2.5 flex items-center gap-2">
              <span
                aria-hidden
                className={`h-2 w-2 rounded-full ${statusDot[status]}`}
              />
              <h2
                id={`status-${status}`}
                className="text-sm font-medium text-(--ink)"
              >
                {statusLabels[status]}
              </h2>
              <span className="text-xs text-(--ink-mute)">
                {tasksInStatus.length}
              </span>
            </div>

            {tasksInStatus.length === 0 ? (
              <p className="rounded-xl border border-dashed border-(--border) px-5 py-4 text-sm text-(--ink-mute)">
                No tasks
              </p>
            ) : (
              <ul className="grid list-none gap-2 p-0">
                {tasksInStatus.map((task) => {
                  const next = nextStatus[task.status];
                  const isBusy = busyTaskId === task.id;

                  return (
                    <li
                      key={task.id}
                      className="group rounded-xl border border-(--border) bg-(--surface) px-5 py-4 transition-colors hover:border-(--border-strong)"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="min-w-0 font-medium text-(--ink)">
                          {task.title}
                        </h3>

                        <div className="flex shrink-0 items-center gap-1">
                          {next && onAdvance ? (
                            <button
                              type="button"
                              onClick={() => onAdvance(task)}
                              disabled={isBusy}
                              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-(--ink-soft) transition-colors hover:bg-(--canvas) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Move to {statusLabels[next]}
                            </button>
                          ) : null}
                          {onDelete ? (
                            <button
                              type="button"
                              onClick={() => onDelete(task)}
                              disabled={isBusy}
                              aria-label={`Delete ${task.title}`}
                              className="rounded-md p-1.5 text-(--ink-mute) transition-colors hover:bg-(--canvas) hover:text-(--danger) disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                aria-hidden
                              >
                                <path
                                  d="M3 3l8 8M11 3l-8 8"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
