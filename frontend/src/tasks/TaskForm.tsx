import { useState, type SubmitEvent } from "react";

import type { CreateTaskInput } from "./task-api";

interface TaskFormProps {
  isError: boolean;
  isSubmitting: boolean;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

export function TaskForm({ isError, isSubmitting, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required");
      return;
    }

    setTitleError(null);

    try {
      await onSubmit({
        title: trimmedTitle,
        ...(trimmedDescription && { description: trimmedDescription }),
      });
    } catch {
      return;
    }

    setTitle("");
    setDescription("");
  }

  return (
    <form
      className="border border-[#d9d3c6] bg-[#faf8f2] p-5"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <h2 className="text-xl font-bold tracking-[-0.02em] text-[#20231d]">
        Create task
      </h2>

      <div className="mt-5">
        <label
          className="block text-sm font-bold text-[#373830]"
          htmlFor="title"
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
          className="mt-2 w-full border border-[#c9c1b1] bg-white px-3 py-2 outline-none focus:border-[#a0442b] focus:ring-2 focus:ring-[#a0442b]/20 disabled:opacity-60"
        />
        {titleError && (
          <p id="title-error" className="mt-2 text-sm text-[#8a3825]">
            {titleError}
          </p>
        )}
      </div>

      <div className="mt-4">
        <label
          className="block text-sm font-bold text-[#373830]"
          htmlFor="description"
        >
          Description{" "}
          <span className="font-normal text-[#777269]">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          className="mt-2 w-full resize-y border border-[#c9c1b1] bg-white px-3 py-2 outline-none focus:border-[#a0442b] focus:ring-2 focus:ring-[#a0442b]/20 disabled:opacity-60"
        />
      </div>

      {isError && (
        <p role="alert" className="mt-4 text-sm text-[#8a3825]">
          Task could not be created. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 bg-[#20231d] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#a0442b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a0442b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
