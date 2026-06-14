import { useState } from "react";

import type { AuditLog } from "./audit-log";
import { nextStatus, type Task, type TaskStatus } from "./task";
import { TaskAuditLog } from "./TaskAuditLog";

interface TaskItemProps {
  task: Task;
  isBusy: boolean;
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

export function TaskItem({
  task,
  isBusy,
  onAdvance,
  onDelete,
  loadAuditLogs,
}: TaskItemProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const next = nextStatus[task.status];
  const historyId = `task-history-${task.id}`;

  return (
    <li className="group rounded-xl border border-(--border) bg-(--surface) px-5 py-4 transition-colors hover:border-(--border-strong)">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="min-w-0 font-medium text-(--ink)">{task.title}</h3>

        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setIsHistoryOpen((isOpen) => !isOpen)}
            aria-expanded={isHistoryOpen}
            aria-controls={historyId}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-(--ink-soft) transition-colors hover:bg-(--canvas) hover:text-(--ink)"
          >
            {isHistoryOpen ? "Hide history" : "View history"}
          </button>
          {next ? (
            <button
              type="button"
              onClick={() => onAdvance(task)}
              disabled={isBusy}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-(--ink-soft) transition-colors hover:bg-(--canvas) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-50"
            >
              Move to {statusLabels[next]}
            </button>
          ) : null}
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
        </div>
      </div>

      {isHistoryOpen ? (
        <div id={historyId} className="mt-4 border-t border-(--border) pt-4">
          <TaskAuditLog taskId={task.id} loadAuditLogs={loadAuditLogs} />
        </div>
      ) : null}
    </li>
  );
}
