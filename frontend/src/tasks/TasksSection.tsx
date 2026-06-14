import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTask, fetchTasks, type CreateTaskInput } from "./task-api";
import type { Task } from "./task";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";

const tasksQueryKey = ["tasks"] as const;

interface TasksSectionProps {
  loadTasks?: () => Promise<Task[]>;
  submitTask?: (input: CreateTaskInput) => Promise<Task>;
}

export function TasksSection({
  loadTasks = fetchTasks,
  submitTask = createTask,
}: TasksSectionProps) {
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
  const tasks = tasksQuery.data ?? [];

  return (
    <section className="space-y-8">
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
      />
    </section>
  );
}
