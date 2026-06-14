import type { Task } from "./task";
import type { TaskStatus } from "./task";

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

export function TaskList({ isError, isPending, tasks }: TaskListProps) {
  return (
    <>
      {isPending && (
        <p role="status" className="text-[#777269]">
          Loading tasks...
        </p>
      )}

      {isError && (
        <div
          role="alert"
          className="border-l-4 border-[#a0442b] bg-[#eee6d8] px-4 py-3 text-[#6f2f20]"
        >
          Tasks could not be loaded. Please try again.
        </div>
      )}

      {!isPending && !isError && tasks.length === 0 && (
        <div className="border border-dashed border-[#c9c1b1] px-6 py-12 text-center">
          <p className="font-bold text-[#20231d]">No tasks yet</p>
          <p className="mt-2 text-sm text-[#777269]">
            New tasks will appear here.
          </p>
        </div>
      )}

      {!isPending && !isError && tasks.length > 0 && (
        <ul className="grid list-none gap-3 p-0">
          {tasks.map((task) => (
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
    </>
  );
}
