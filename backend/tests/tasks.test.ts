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

  it("updates status and records an audit log", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });

    const updateResponse = await request(app)
      .patch(`/api/tasks/${createResponse.body.id}/status`)
      .send({ status: "pending", actor: "john.doe" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      changed: true,
      task: {
        id: createResponse.body.id,
        status: "pending",
      },
    });

    const auditResponse = await request(app).get(
      `/api/tasks/${createResponse.body.id}/audit-logs`,
    );

    expect(auditResponse.status).toBe(200);
    expect(auditResponse.body).toEqual([
      expect.objectContaining({
        id: expect.any(Number),
        taskId: createResponse.body.id,
        actor: "john.doe",
        fromStatus: "to_do",
        toStatus: "pending",
      }),
    ]);
  });

  it("does not create a log when status is unchanged", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });

    const updateResponse = await request(app)
      .patch(`/api/tasks/${createResponse.body.id}/status`)
      .send({ status: "to_do", actor: "john.doe" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      changed: false,
      task: { status: "to_do" },
    });

    const auditResponse = await request(app).get(
      `/api/tasks/${createResponse.body.id}/audit-logs`,
    );

    expect(auditResponse.body).toEqual([]);
  });

  it("creates only one log for concurrent identical updates", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });
    const taskId = createResponse.body.id;

    const responses = await Promise.all([
      request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .send({ status: "pending", actor: "john.doe" }),
      request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .send({ status: "pending", actor: "jane.smith" }),
    ]);

    expect(responses.map((response) => response.body.changed).sort()).toEqual([
      false,
      true,
    ]);

    const auditResponse = await request(app).get(
      `/api/tasks/${taskId}/audit-logs`,
    );
    expect(auditResponse.body).toHaveLength(1);
  });

  it("rejects an invalid status transition", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });

    const updateResponse = await request(app)
      .patch(`/api/tasks/${createResponse.body.id}/status`)
      .send({ status: "in_progress", actor: "john.doe" });

    expect(updateResponse.status).toBe(422);
    expect(updateResponse.body).toEqual({
      error: "Invalid status transition",
    });

    const tasksResponse = await request(app).get("/api/tasks");
    expect(tasksResponse.body[0].status).toBe("to_do");
  });

  it("returns not found for an unknown task", async () => {
    const app = createApp(database);

    const updateResponse = await request(app)
      .patch("/api/tasks/missing/status")
      .send({ status: "pending", actor: "john.doe" });
    const auditResponse = await request(app).get(
      "/api/tasks/missing/audit-logs",
    );

    expect(updateResponse.status).toBe(404);
    expect(auditResponse.status).toBe(404);
  });

  it("validates status and actor", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });

    const response = await request(app)
      .patch(`/api/tasks/${createResponse.body.id}/status`)
      .send({ status: "unknown", actor: "unknown.user" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: "Invalid request",
      details: {
        status: expect.any(Array),
        actor: expect.any(Array),
      },
    });
  });

  it("returns audit logs in chronological order", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });
    const taskId = createResponse.body.id;

    await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: "pending", actor: "john.doe" });
    await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: "in_progress", actor: "jane.smith" });

    const response = await request(app).get(`/api/tasks/${taskId}/audit-logs`);

    expect(response.body).toMatchObject([
      {
        actor: "john.doe",
        fromStatus: "to_do",
        toStatus: "pending",
      },
      {
        actor: "jane.smith",
        fromStatus: "pending",
        toStatus: "in_progress",
      },
    ]);
  });

  it("rolls back the status update when audit creation fails", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });

    database.exec(`
      CREATE TRIGGER fail_audit_insert
      BEFORE INSERT ON audit_logs
      BEGIN
        SELECT RAISE(ABORT, 'audit insert failed');
      END;
    `);

    const updateResponse = await request(app)
      .patch(`/api/tasks/${createResponse.body.id}/status`)
      .send({ status: "pending", actor: "john.doe" });

    expect(updateResponse.status).toBe(500);

    const tasksResponse = await request(app).get("/api/tasks");
    expect(tasksResponse.body[0].status).toBe("to_do");

    const auditResponse = await request(app).get(
      `/api/tasks/${createResponse.body.id}/audit-logs`,
    );
    expect(auditResponse.body).toEqual([]);
  });

  it("soft deletes a task and preserves its audit logs", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });
    const taskId = createResponse.body.id;

    await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: "pending", actor: "john.doe" });

    const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);

    expect(deleteResponse.status).toBe(204);
    expect(deleteResponse.body).toEqual({});

    const tasksResponse = await request(app).get("/api/tasks");
    expect(tasksResponse.body).toEqual([]);

    const updateResponse = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .send({ status: "in_progress", actor: "jane.smith" });
    expect(updateResponse.status).toBe(404);

    const auditResponse = await request(app).get(
      `/api/tasks/${taskId}/audit-logs`,
    );
    expect(auditResponse.status).toBe(200);
    expect(auditResponse.body).toHaveLength(1);
  });

  it("returns not found when deleting an already deleted task", async () => {
    const app = createApp(database);
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare invoice" });
    const taskId = createResponse.body.id;

    await request(app).delete(`/api/tasks/${taskId}`);
    const response = await request(app).delete(`/api/tasks/${taskId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Task not found" });
  });
});
