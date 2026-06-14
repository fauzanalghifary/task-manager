import type { Task, TaskStatus } from "./task";

interface TaskListProps {
  isError: boolean;
  isPending: boolean;
  tasks: Task[];
}

const statusLabels: Record<TaskStatus, string> = {
  to_do: "To do",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

const statusDot: Record<TaskStatus, string> = {
  to_do: "bg-[var(--status-to-do)]",
  pending: "bg-[var(--status-pending)]",
  in_progress: "bg-[var(--status-in-progress)]",
  done: "bg-[var(--status-done)]",
};

export function TaskList({ isError, isPending, tasks }: TaskListProps) {
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

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-strong)] px-6 py-14 text-center">
        <p className="font-medium text-(--ink)">No tasks yet</p>
        <p className="mt-1 text-sm text-[var(--ink-mute)]">
          New tasks will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid list-none gap-2 p-0">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-xl border border-(--border) bg-(--surface) px-5 py-4 transition-colors hover:border-(--border-strong)"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-medium text-(--ink)">{task.title}</h3>
              {task.description && (
                <p className="mt-1 text-sm leading-relaxed text-(--ink-soft)">
                  {task.description}
                </p>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 text-xs text-(--ink-soft)">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${statusDot[task.status]}`}
              />
              {statusLabels[task.status]}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
