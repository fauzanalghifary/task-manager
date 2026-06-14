import type { TaskStatus } from "./task";
import { useTasks, type TaskLoader } from "./useTasks";

interface TaskListProps {
  loadTasks?: TaskLoader;
}

const statusLabels: Record<TaskStatus, string> = {
  to_do: "To do",
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

export function TaskList({ loadTasks }: TaskListProps) {
  const tasksState = useTasks(loadTasks);

  return (
    <section className="mt-16 border-t border-[#d9d3c6] pt-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#20231d]">
          Tasks
        </h2>
        {tasksState.status === "success" && (
          <p className="text-sm text-[#777269]">
            {tasksState.tasks.length}{" "}
            {tasksState.tasks.length === 1 ? "task" : "tasks"}
          </p>
        )}
      </div>

      {tasksState.status === "loading" && (
        <p role="status" className="text-[#777269]">
          Loading tasks...
        </p>
      )}

      {tasksState.status === "error" && (
        <div
          role="alert"
          className="border-l-4 border-[#a0442b] bg-[#eee6d8] px-4 py-3 text-[#6f2f20]"
        >
          Tasks could not be loaded. Please try again.
        </div>
      )}

      {tasksState.status === "success" && tasksState.tasks.length === 0 && (
        <div className="border border-dashed border-[#c9c1b1] px-6 py-12 text-center">
          <p className="font-bold text-[#20231d]">No tasks yet</p>
          <p className="mt-2 text-sm text-[#777269]">
            New tasks will appear here.
          </p>
        </div>
      )}

      {tasksState.status === "success" && tasksState.tasks.length > 0 && (
        <ul className="grid list-none gap-3 p-0">
          {tasksState.tasks.map((task) => (
            <li
              key={task.id}
              className="border border-[#d9d3c6] bg-[#faf8f2] px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#20231d]">{task.title}</h3>
                  {task.description && (
                    <p className="mt-2 text-sm leading-6 text-[#6a665e]">
                      {task.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 bg-[#e7dfcf] px-2.5 py-1 text-xs font-bold text-[#5a554c]">
                  {statusLabels[task.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
