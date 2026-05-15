import type { FastifyInstance } from "fastify";

export const registerHealthRoute = async (app: FastifyInstance) => {
  app.get("/api/health", async () => ({
    status: "ok",
    service: "route5-api",
    version: "0.1.0"
  }));
};
