import Fastify from "fastify";
import { mockRouteCandidates } from "@route5/shared";
import { registerRouteFeedbackRoute } from "./routes/route-feedback";
import { registerHealthRoute } from "./routes/health";
import { registerRoutePlanRoutes } from "./routes/route-plans";
import type {
  RouteFeedbackRepository,
  RoutePlanRepository
} from "./services/persistence";

export type BuildServerOptions = {
  routeFeedbackRepository?: RouteFeedbackRepository;
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
  await registerRouteFeedbackRoute(app, {
    routeFeedbackRepository: options.routeFeedbackRepository
  });

  app.get("/api/mock-routes", async () => ({
    candidates: mockRouteCandidates
  }));

  return app;
};
