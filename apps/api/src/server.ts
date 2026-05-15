import Fastify from "fastify";
import { mockRouteCandidates } from "@route5/shared";
import { registerHealthRoute } from "./routes/health";

export const buildServer = async () => {
  const app = Fastify({
    logger: true
  });

  await registerHealthRoute(app);

  app.get("/api/mock-routes", async () => ({
    candidates: mockRouteCandidates
  }));

  return app;
};
