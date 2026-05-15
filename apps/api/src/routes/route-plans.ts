import type { FastifyInstance } from "fastify";
import {
  buildMockRoutePlanResponse,
  routePlanRequestSchema
} from "@route5/shared";

export const registerRoutePlanRoutes = async (app: FastifyInstance) => {
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
      .send(buildMockRoutePlanResponse(validation.data));
  });
};
