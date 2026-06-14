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
    <section className="mt-16 border-t border-[#d9d3c6] pt-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#20231d]">
          Tasks
        </h2>
        {tasksQuery.isSuccess && (
          <p className="text-sm text-[#777269]">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
        <TaskForm
          isError={createTaskMutation.isError}
          isSubmitting={createTaskMutation.isPending}
          onSubmit={async (input) => {
            await createTaskMutation.mutateAsync(input);
          }}
        />
        <TaskList
          isError={tasksQuery.isError}
          isPending={tasksQuery.isPending}
          tasks={tasks}
        />
      </div>
    </section>
  );
}
