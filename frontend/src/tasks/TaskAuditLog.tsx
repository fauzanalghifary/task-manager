import { useQuery } from "@tanstack/react-query";

import { actors } from "./actor";
import { taskAuditLogsQueryKey, type AuditLog } from "./audit-log";
import { fetchTaskAuditLogs } from "./task-api";
import type { TaskStatus } from "./task";

interface TaskAuditLogProps {
  taskId: string;
  loadAuditLogs?: (taskId: string) => Promise<AuditLog[]>;
}

const statusLabels: Record<TaskStatus, string> = {
  to_do: "To do",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function getActorLabel(actor: AuditLog["actor"]) {
  return (
    actors.find((actorOption) => actorOption.value === actor)?.label ?? actor
  );
}

export function TaskAuditLog({
  taskId,
  loadAuditLogs = fetchTaskAuditLogs,
}: TaskAuditLogProps) {
  const auditLogsQuery = useQuery({
    queryKey: taskAuditLogsQueryKey(taskId),
    queryFn: () => loadAuditLogs(taskId),
  });

  if (auditLogsQuery.isPending) {
    return (
      <p role="status" className="text-sm text-(--ink-mute)">
        Loading history...
      </p>
    );
  }

  if (auditLogsQuery.isError) {
    return (
      <p role="alert" className="text-sm text-(--danger)">
        History could not be loaded. Please try again.
      </p>
    );
  }

  if (auditLogsQuery.data.length === 0) {
    return <p className="text-sm text-(--ink-mute)">No status changes yet.</p>;
  }

  return (
    <ol aria-label="Status change history" className="space-y-3">
      {auditLogsQuery.data.map((auditLog) => (
        <li key={auditLog.id} className="text-sm">
          <p className="text-(--ink-soft)">
            <span className="font-medium text-(--ink)">
              {getActorLabel(auditLog.actor)}
            </span>{" "}
            moved this task from{" "}
            <em className="italic">{statusLabels[auditLog.fromStatus]}</em> to{" "}
            <em className="italic">{statusLabels[auditLog.toStatus]}</em>.
          </p>
          <time
            dateTime={auditLog.createdAt}
            className="mt-0.5 block text-xs text-(--ink-mute)"
          >
            {dateFormatter.format(new Date(auditLog.createdAt))}
          </time>
        </li>
      ))}
    </ol>
  );
}
