import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createDatabase } from "../src/database/database.js";

describe("GET /api/health", () => {
  const database = createDatabase(":memory:");
  const app = createApp(database);

  afterAll(() => {
    database.close();
  });

  it("returns the service health", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
