import Fastify from "fastify";
import { mockRouteCandidates } from "@route5/shared";
import { registerHealthRoute } from "./routes/health";
import { registerRoutePlanRoutes } from "./routes/route-plans";
import type { RoutePlanRepository } from "./services/persistence";

export type BuildServerOptions = {
  routePlanRepository?: RoutePlanRepository;
};

export const buildServer = async (options: BuildServerOptions = {}) => {
  const app = Fastify({
    logger: true
  });

  await registerHealthRoute(app);
  await registerRoutePlanRoutes(app, {
    routePlanRepository: options.routePlanRepository
  });

  app.get("/api/mock-routes", async () => ({
    candidates: mockRouteCandidates
  }));

  return app;
};
