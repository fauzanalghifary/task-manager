import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createDatabase } from "../src/database/database.js";

describe("task endpoints", () => {
  let database: ReturnType<typeof createDatabase>;

  beforeEach(() => {
    database = createDatabase(":memory:");
  });

  afterEach(() => {
    database.close();
  });

  it("creates a task with the initial status", async () => {
    const response = await request(createApp(database))
      .post("/api/tasks")
      .send({ title: "  Prepare invoice  " });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Prepare invoice",
      status: "to_do",
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toBe(response.body.createdAt);
  });

  it("rejects a blank title", async () => {
    const response = await request(createApp(database))
      .post("/api/tasks")
      .send({ title: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: "Invalid request",
      details: {
        title: ["Title is required"],
      },
    });
  });

  it("lists created tasks in chronological order", async () => {
    const app = createApp(database);

    await request(app).post("/api/tasks").send({ title: "First task" });
    await request(app).post("/api/tasks").send({ title: "Second task" });

    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((task: { title: string }) => task.title)).toEqual([
      "First task",
      "Second task",
    ]);
  });
});
