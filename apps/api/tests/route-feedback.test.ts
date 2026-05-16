import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type {
  RouteFeedbackRequest,
  RouteFeedbackResponse,
  RoutePlanRequest,
  RoutePlanResponse
} from "@route5/shared";
import { buildServer } from "../src/server";

const validRoutePlanRequest: RoutePlanRequest = {
  origin: {
    lat: 35.6812,
    lng: 139.7671,
    label: "Tokyo Station"
  },
  target: {
    type: "distance",
    value: 5,
    unit: "km"
  },
  activity: "jog",
  level: "beginner",
  preferences: ["flat", "park", "waterside"],
  routeCount: 5,
  locale: "ja-JP"
};

const buildFeedback = (
  overrides: Partial<RouteFeedbackRequest> = {}
): RouteFeedbackRequest => ({
  planId: "route-plan-1",
  accessToken: "route-plan-access-token-1",
  routeCandidateId: "candidate-1",
  rating: "good",
  tags: ["nice_view", "want_again"],
  comment: "Good route.",
  ...overrides
});

describe("POST /api/route-feedback", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("saves valid feedback and returns a receipt", async () => {
    const routePlanResponse = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: validRoutePlanRequest
    });
    const routePlan = routePlanResponse.json<RoutePlanResponse>();
    const validFeedback = buildFeedback({
      planId: routePlan.planId,
      accessToken: routePlan.accessToken,
      routeCandidateId: routePlan.candidates[0]!.id
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/route-feedback",
      payload: validFeedback
    });

    const body = response.json<RouteFeedbackResponse>();

    expect(response.statusCode).toBe(201);
    expect(body.feedbackId).toBe("route-feedback-1");
    expect(body.receivedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns a 400 response when the rating is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/route-feedback",
      payload: {
        ...buildFeedback(),
        rating: "great"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "invalid_route_feedback_request"
    });
  });

  it("returns a 400 response when tags are invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/route-feedback",
      payload: {
        ...buildFeedback(),
        tags: ["nice_view", "unknown_tag"]
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "invalid_route_feedback_request"
    });
  });

  it("returns a 404 response when plan access does not match", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/route-feedback",
      payload: buildFeedback({
        planId: "missing-plan"
      })
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: "route_feedback_target_not_found"
    });
  });
});
