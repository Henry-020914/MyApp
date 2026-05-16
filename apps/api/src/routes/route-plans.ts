import type { FastifyInstance } from "fastify";
import { routePlanRequestSchema } from "@route5/shared";
import {
  createRoutePlanRepositoryFromEnv,
  type RoutePlanRepository
} from "../services/persistence";
import { RouteGenerationService } from "../services/route-generation";

export type RegisterRoutePlanRoutesOptions = {
  routePlanRepository?: RoutePlanRepository;
};

export const registerRoutePlanRoutes = async (
  app: FastifyInstance,
  options: RegisterRoutePlanRoutesOptions = {}
) => {
  const routeGenerationService = new RouteGenerationService();
  const routePlanRepository =
    options.routePlanRepository ?? createRoutePlanRepositoryFromEnv();

  app.post("/api/route-plans", async (request, reply) => {
    const validation = routePlanRequestSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        error: "invalid_route_plan_request",
        message: "ルート生成の入力内容が正しい形ではありません。",
        issues: validation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const response = routeGenerationService.buildRoutePlanResponse(
      validation.data
    );
    await routePlanRepository.saveRoutePlan({
      request: validation.data,
      response,
      savedAt: new Date().toISOString()
    });

    return reply.status(200).send(response);
  });

  app.get<{ Params: { planId: string } }>(
    "/api/route-plans/:planId",
    async (request, reply) => {
      const routePlan = await routePlanRepository.getRoutePlan(
        request.params.planId
      );

      if (!routePlan) {
        return reply.status(404).send({
          error: "route_plan_not_found",
          message: "Route plan was not found."
        });
      }

      return reply.status(200).send(routePlan);
    }
  );
};
