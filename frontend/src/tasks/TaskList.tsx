import type { AuditLog } from "./audit-log";
import type { Task, TaskStatus } from "./task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  isError: boolean;
  isPending: boolean;
  tasks: Task[];
  busyTaskId: string | null;
  onAdvance: (task: Task) => void;
  onDelete: (task: Task) => void;
  loadAuditLogs: (taskId: string) => Promise<AuditLog[]>;
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
  loadAuditLogs,
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
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isBusy={busyTaskId === task.id}
                      onAdvance={onAdvance}
                      onDelete={onDelete}
                      loadAuditLogs={loadAuditLogs}
                    />
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
