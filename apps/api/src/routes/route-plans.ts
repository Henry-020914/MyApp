import type { FastifyInstance } from "fastify";
import { routePlanRequestSchema } from "@route5/shared";
import { RouteGenerationService } from "../services/route-generation";

export const registerRoutePlanRoutes = async (app: FastifyInstance) => {
  const routeGenerationService = new RouteGenerationService();

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

    return reply
      .status(200)
      .send(routeGenerationService.buildRoutePlanResponse(validation.data));
  });
};
