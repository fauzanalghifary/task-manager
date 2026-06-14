import type { RequestHandler } from "express";

export const healthHandler: RequestHandler = (_request, response) => {
  response.json({ status: "ok" });
};
