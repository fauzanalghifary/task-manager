import { useState, type SubmitEvent } from "react";

import type { CreateTaskInput } from "./task-api";

interface TaskFormProps {
  isError: boolean;
  isSubmitting: boolean;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

export function TaskForm({ isError, isSubmitting, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required");
      return;
    }

    setTitleError(null);

    try {
      await onSubmit({ title: trimmedTitle });
    } catch {
      return;
    }

    setTitle("");
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] outline-none transition-shadow focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)] disabled:opacity-60";

  return (
    <form
      className="rounded-xl border border-(--border) bg-(--surface) p-5"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-(--ink)"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-describedby={titleError ? "title-error" : undefined}
          aria-invalid={titleError ? true : undefined}
          disabled={isSubmitting}
          placeholder="What needs to be done?"
          className={`mt-1.5 ${inputClass}`}
        />
        {titleError && (
          <p id="title-error" className="mt-1.5 text-sm text-(--danger)">
            {titleError}
          </p>
        )}
      </div>

      {isError && (
        <p role="alert" className="mt-4 text-sm text-(--danger)">
          Task could not be created. Please try again.
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create task"}
        </button>
      </div>
    </form>
  );
}
