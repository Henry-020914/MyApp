import Fastify from "fastify";
import { mockRouteCandidates } from "@route5/shared";
import { registerRouteFeedbackRoute } from "./routes/route-feedback";
import { registerHealthRoute } from "./routes/health";
import { registerRoutePlanRoutes } from "./routes/route-plans";
import type {
  RouteFeedbackRepository,
  RoutePlanRepository
} from "./services/persistence";
import { createRoutePlanRepositoryFromEnv } from "./services/persistence";
import type { RoutePlanResponseBuilder } from "./services/route-generation";

export type BuildServerOptions = {
  routeGenerationService?: RoutePlanResponseBuilder;
  routeFeedbackRepository?: RouteFeedbackRepository;
  routePlanRepository?: RoutePlanRepository;
};

export const buildServer = async (options: BuildServerOptions = {}) => {
  const app = Fastify({
    logger: true
  });
  const routePlanRepository =
    options.routePlanRepository ?? createRoutePlanRepositoryFromEnv();

  await registerHealthRoute(app);
  await registerRoutePlanRoutes(app, {
    routeGenerationService: options.routeGenerationService,
    routePlanRepository
  });
  await registerRouteFeedbackRoute(app, {
    routeFeedbackRepository: options.routeFeedbackRepository,
    routePlanRepository
  });

  app.get("/api/mock-routes", async () => ({
    candidates: mockRouteCandidates
  }));

  return app;
};
