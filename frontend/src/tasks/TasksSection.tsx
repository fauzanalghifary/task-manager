import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { actors, type Actor } from "./actor";
import { taskAuditLogsQueryKey, type AuditLog } from "./audit-log";
import {
  createTask,
  deleteTask,
  fetchTaskAuditLogs,
  fetchTasks,
  updateTaskStatus,
  type CreateTaskInput,
  type UpdateTaskStatusInput,
} from "./task-api";
import { nextStatus, type Task } from "./task";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";

const tasksQueryKey = ["tasks"] as const;

interface TasksSectionProps {
  loadTasks?: () => Promise<Task[]>;
  submitTask?: (input: CreateTaskInput) => Promise<Task>;
  changeTaskStatus?: (input: UpdateTaskStatusInput) => Promise<Task>;
  removeTask?: (id: string) => Promise<void>;
  loadTaskAuditLogs?: (taskId: string) => Promise<AuditLog[]>;
}

export function TasksSection({
  loadTasks = fetchTasks,
  submitTask = createTask,
  changeTaskStatus = updateTaskStatus,
  removeTask = deleteTask,
  loadTaskAuditLogs = fetchTaskAuditLogs,
}: TasksSectionProps) {
  const [actor, setActor] = useState<Actor>(actors[0].value);
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: tasksQueryKey,
    queryFn: loadTasks,
  });
  const createTaskMutation = useMutation({
    mutationFn: submitTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: (input: UpdateTaskStatusInput) => changeTaskStatus(input),
    onSuccess: async (_task, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tasksQueryKey }),
        queryClient.invalidateQueries({
          queryKey: taskAuditLogsQueryKey(input.id),
        }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: removeTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
  const tasks = tasksQuery.data ?? [];

  const busyTaskId =
    (updateStatusMutation.isPending
      ? updateStatusMutation.variables?.id
      : undefined) ??
    (deleteMutation.isPending ? deleteMutation.variables : undefined) ??
    null;

  return (
    <section className="space-y-8">
      <section aria-label="Actor context">
        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="actor" className="text-sm font-medium text-(--ink)">
            Acting as
          </label>
          <div className="relative">
            <select
              id="actor"
              value={actor}
              onChange={(event) => setActor(event.target.value as Actor)}
              className="w-32 appearance-none rounded-lg border border-(--border) bg-(--surface) py-2 pr-9 pl-3 text-sm text-(--ink) outline-none transition-shadow focus:border-(--ink) focus:ring-2 focus:ring-(--focus)"
            >
              {actors.map((actorOption) => (
                <option key={actorOption.value} value={actorOption.value}>
                  {actorOption.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 text-(--ink-soft)"
            >
              <path
                d="m3 4.5 3 3 3-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-(--ink-mute)">
          Used in the audit log when a task status changes.
        </p>
      </section>

      <TaskForm
        isError={createTaskMutation.isError}
        isSubmitting={createTaskMutation.isPending}
        onSubmit={async (input) => {
          await createTaskMutation.mutateAsync(input);
        }}
      />

      {tasksQuery.isSuccess && tasks.length > 0 && (
        <p className="text-sm text-(--ink-mute)">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </p>
      )}

      <TaskList
        isError={tasksQuery.isError}
        isPending={tasksQuery.isPending}
        tasks={tasks}
        busyTaskId={busyTaskId}
        loadAuditLogs={loadTaskAuditLogs}
        onAdvance={(task) => {
          const next = nextStatus[task.status];
          if (next) {
            updateStatusMutation.mutate({
              id: task.id,
              status: next,
              actor,
            });
          }
        }}
        onDelete={(task) => {
          deleteMutation.mutate(task.id);
        }}
      />
    </section>
  );
}
