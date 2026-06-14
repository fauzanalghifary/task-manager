import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskForm } from "./TaskForm";

describe("TaskForm", () => {
  it("requires a title", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskForm isError={false} isSubmitting={false} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed task details and resets the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskForm isError={false} isSubmitting={false} onSubmit={onSubmit} />,
    );

    await user.type(screen.getByLabelText("Title"), "  Prepare invoice  ");
    await user.type(
      screen.getByLabelText("Description (optional)"),
      "  Send it to the customer  ",
    );
    await user.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Prepare invoice",
        description: "Send it to the customer",
      });
    });

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Description (optional)")).toHaveValue("");
  });

  it("keeps form values when creation fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Network error"));

    const { rerender } = render(
      <TaskForm isError={false} isSubmitting={false} onSubmit={onSubmit} />,
    );

    await user.type(screen.getByLabelText("Title"), "Prepare invoice");
    await user.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    rerender(<TaskForm isError isSubmitting={false} onSubmit={onSubmit} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Task could not be created. Please try again.",
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Prepare invoice");
  });
});
