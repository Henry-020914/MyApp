import type { FastifyInstance } from "fastify";
import {
  routePlanRequestSchema,
  type RoutePlanRequest,
  type RoutePlanResponse
} from "@route5/shared";
import {
  createRoutePlanRepositoryFromEnv,
  type RoutePlanRepository
} from "../services/persistence";
import {
  RouteGenerationProviderUnavailableError,
  RouteGenerationService,
  type RoutePlanResponseBuilder
} from "../services/route-generation";

export type RegisterRoutePlanRoutesOptions = {
  routeGenerationService?: RoutePlanResponseBuilder;
  routePlanRepository?: RoutePlanRepository;
};

export const registerRoutePlanRoutes = async (
  app: FastifyInstance,
  options: RegisterRoutePlanRoutesOptions = {}
) => {
  const routeGenerationService =
    options.routeGenerationService ?? new RouteGenerationService();
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

    let response: RoutePlanResponse;

    try {
      response = await buildRoutePlanResponse(
        routeGenerationService,
        validation.data
      );
    } catch (error) {
      if (error instanceof RouteGenerationProviderUnavailableError) {
        return reply.status(503).send({
          error: "route_provider_unavailable",
          message:
            "現在ルート生成が混み合っています。少し時間をおいて再試行してください。"
        });
      }

      request.log.error({ error }, "Route plan generation failed.");

      return reply.status(500).send({
        error: "route_plan_generation_failed",
        message: "ルート生成中に問題が起きました。"
      });
    }

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

const buildRoutePlanResponse = (
  routeGenerationService: RoutePlanResponseBuilder,
  request: RoutePlanRequest
) => Promise.resolve(routeGenerationService.buildRoutePlanResponse(request));
