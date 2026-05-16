import type {
  RouteFeedbackRequest,
  RouteFeedbackResponse
} from "@route5/shared";
import { describe, expect, it } from "vitest";
import {
  createRouteFeedbackRepositoryFromEnv,
  InMemoryRouteFeedbackRepository,
  SupabaseRouteFeedbackRepository,
  type FetchLike
} from "../src/services/persistence";

const feedback: RouteFeedbackRequest = {
  planId: "route-plan-1",
  accessToken: "route-plan-access-token-1",
  routeCandidateId: "candidate-1",
  rating: "good",
  tags: ["nice_view", "want_again"],
  comment: "また使いたいです。"
};

describe("InMemoryRouteFeedbackRepository", () => {
  it("saves feedback and returns a receipt", async () => {
    const repository = new InMemoryRouteFeedbackRepository();

    const response = await repository.saveFeedback(
      feedback,
      new Date("2026-05-16T00:00:00.000Z")
    );

    expect(response).toEqual({
      feedbackId: "route-feedback-1",
      receivedAt: "2026-05-16T00:00:00.000Z"
    });
    expect(repository.getSavedFeedback(response.feedbackId)).toMatchObject({
      feedback
    });
  });

  it("returns a defensive copy so saved feedback cannot be mutated", async () => {
    const repository = new InMemoryRouteFeedbackRepository();
    const response = await repository.saveFeedback(feedback);

    const savedFeedback = repository.getSavedFeedback(response.feedbackId);
    savedFeedback?.feedback.tags.push("blocked");

    expect(
      repository.getSavedFeedback(response.feedbackId)?.feedback.tags
    ).toEqual(["nice_view", "want_again"]);
  });
});

describe("SupabaseRouteFeedbackRepository", () => {
  it("calls the save feedback RPC function with service role headers", async () => {
    const responseBody: RouteFeedbackResponse = {
      feedbackId: "feedback-uuid",
      receivedAt: "2026-05-16T00:00:01.000Z"
    };
    const requests: Array<{ input: string; init: RequestInit }> = [];
    const fetchFn: FetchLike = async (input, init) => {
      requests.push({ input, init });

      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    };
    const repository = new SupabaseRouteFeedbackRepository({
      supabaseUrl: "https://example.supabase.co/",
      serviceRoleKey: "service-role-key",
      fetchFn
    });

    await expect(repository.saveFeedback(feedback)).resolves.toEqual(
      responseBody
    );

    expect(requests[0]?.input).toBe(
      "https://example.supabase.co/rest/v1/rpc/save_route_feedback"
    );
    expect(requests[0]?.init.headers).toMatchObject({
      apikey: "service-role-key",
      authorization: "Bearer service-role-key"
    });
    expect(JSON.parse(String(requests[0]?.init.body))).toEqual({
      input_feedback: feedback
    });
  });

  it("uses memory storage in tests even when Supabase env vars exist", () => {
    const repository = createRouteFeedbackRepositoryFromEnv({
      NODE_ENV: "test",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key"
    });

    expect(repository).toBeInstanceOf(InMemoryRouteFeedbackRepository);
  });
});
