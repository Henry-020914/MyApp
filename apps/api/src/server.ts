import Fastify from "fastify";
import { mockRouteCandidates } from "@route5/shared";
import { registerHealthRoute } from "./routes/health";
import { registerRoutePlanRoutes } from "./routes/route-plans";

export const buildServer = async () => {
  const app = Fastify({
    logger: true
  });

  await registerHealthRoute(app);
  await registerRoutePlanRoutes(app);

  app.get("/api/mock-routes", async () => ({
    candidates: mockRouteCandidates
  }));

  return app;
};
