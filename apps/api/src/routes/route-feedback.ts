import type { FastifyInstance } from "fastify";
import { routeFeedbackRequestSchema } from "@route5/shared";
import {
  createRouteFeedbackRepositoryFromEnv,
  type RouteFeedbackRepository
} from "../services/persistence";

export type RegisterRouteFeedbackRouteOptions = {
  routeFeedbackRepository?: RouteFeedbackRepository;
};

export const registerRouteFeedbackRoute = async (
  app: FastifyInstance,
  options: RegisterRouteFeedbackRouteOptions = {}
) => {
  const routeFeedbackRepository =
    options.routeFeedbackRepository ?? createRouteFeedbackRepositoryFromEnv();

  app.post("/api/route-feedback", async (request, reply) => {
    const validation = routeFeedbackRequestSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        error: "invalid_route_feedback_request",
        message: "フィードバックの入力内容が正しい形ではありません。",
        issues: validation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const response = await routeFeedbackRepository.saveFeedback(
      validation.data
    );

    return reply.status(201).send(response);
  });
};
