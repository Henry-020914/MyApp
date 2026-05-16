import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type {
  RouteFeedbackRequest,
  RouteFeedbackResponse
} from "@route5/shared";
import { buildServer } from "../src/server";

const validFeedback: RouteFeedbackRequest = {
  routeCandidateId: "candidate-1",
  rating: "good",
  tags: ["nice_view", "want_again"],
  comment: "景色がよくて使いやすかったです。"
};

describe("POST /api/route-feedback", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("saves valid feedback and returns a receipt", async () => {
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
        ...validFeedback,
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
        ...validFeedback,
        tags: ["nice_view", "unknown_tag"]
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "invalid_route_feedback_request"
    });
  });
});
