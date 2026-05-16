import type { FastifyInstance } from "fastify";
import { routeFeedbackRequestSchema } from "@route5/shared";
import {
  createRouteFeedbackRepositoryFromEnv,
  createRoutePlanRepositoryFromEnv,
  type RouteFeedbackRepository,
  type RoutePlanRepository
} from "../services/persistence";

export type RegisterRouteFeedbackRouteOptions = {
  routeFeedbackRepository?: RouteFeedbackRepository;
  routePlanRepository?: RoutePlanRepository;
};

export const registerRouteFeedbackRoute = async (
  app: FastifyInstance,
  options: RegisterRouteFeedbackRouteOptions = {}
) => {
  const routeFeedbackRepository =
    options.routeFeedbackRepository ?? createRouteFeedbackRepositoryFromEnv();
  const routePlanRepository =
    options.routePlanRepository ?? createRoutePlanRepositoryFromEnv();

  app.post("/api/route-feedback", async (request, reply) => {
    const validation = routeFeedbackRequestSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        error: "invalid_route_feedback_request",
        message: "Route feedback request is invalid.",
        issues: validation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const routePlan = await routePlanRepository.getRoutePlan(
      validation.data.planId,
      validation.data.accessToken
    );
    const routeCandidate = routePlan?.candidates.find(
      (candidate) => candidate.id === validation.data.routeCandidateId
    );

    if (!routeCandidate) {
      return reply.status(404).send({
        error: "route_feedback_target_not_found",
        message: "Route feedback target was not found."
      });
    }

    const response = await routeFeedbackRepository.saveFeedback(
      validation.data
    );

    return reply.status(201).send(response);
  });
};
