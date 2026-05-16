import {
  buildMockRoutePlanResponse,
  type RouteFeedbackRequest,
  type RoutePlanRequest
} from "@route5/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRoutePlan,
  getRoutePlan,
  getRoute5ApiBaseUrl,
  submitRouteFeedback
} from "../src/lib/route5-api";

const routePlanRequest: RoutePlanRequest = {
  origin: {
    lat: 35.6812,
    lng: 139.7671,
    label: "東京駅"
  },
  target: {
    type: "time",
    value: 30,
    unit: "min"
  },
  activity: "walk",
  level: "beginner",
  preferences: ["flat", "park"],
  routeCount: 5,
  locale: "ja-JP"
};

const routeFeedbackRequest: RouteFeedbackRequest = {
  planId: "route-plan-1",
  accessToken: "route-plan-access-token-1",
  routeCandidateId: "candidate-1",
  rating: "good",
  tags: ["nice_view"],
  comment: "気持ちよく歩けました。"
};

describe("route5 api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the Expo public API URL when provided", () => {
    vi.stubEnv("EXPO_PUBLIC_ROUTE5_API_URL", "http://localhost:3000/");

    expect(getRoute5ApiBaseUrl()).toBe("http://localhost:3000");
  });

  it("posts a route plan request and returns the response", async () => {
    const responseBody = buildMockRoutePlanResponse(
      routePlanRequest,
      new Date("2026-05-16T00:00:00.000Z")
    );
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await createRoutePlan(
      routePlanRequest,
      "http://127.0.0.1:3000"
    );

    expect(response.candidates).toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3000/api/route-plans",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(routePlanRequest)
      })
    );
  });

  it("throws a readable error for invalid API responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            error: "invalid_route_plan_request",
            message: "入力内容を確認してください。"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      })
    );

    await expect(
      createRoutePlan(routePlanRequest, "http://127.0.0.1:3000")
    ).rejects.toMatchObject({
      message: "入力内容を確認してください。",
      status: 400,
      code: "invalid_route_plan_request"
    });
  });

  it("gets a route plan with its access token", async () => {
    const responseBody = buildMockRoutePlanResponse(
      routePlanRequest,
      new Date("2026-05-16T00:00:00.000Z")
    );
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await getRoutePlan(
      responseBody.planId,
      responseBody.accessToken,
      "http://127.0.0.1:3000"
    );

    expect(response).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://127.0.0.1:3000/api/route-plans/${responseBody.planId}`,
      expect.objectContaining({
        headers: {
          "x-route5-plan-token": responseBody.accessToken
        }
      })
    );
  });

  it("posts route feedback and returns the receipt", async () => {
    const responseBody = {
      feedbackId: "route-feedback-1",
      receivedAt: "2026-05-16T00:00:00.000Z"
    };
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify(responseBody), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await submitRouteFeedback(
      routeFeedbackRequest,
      "http://127.0.0.1:3000"
    );

    expect(response).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3000/api/route-feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(routeFeedbackRequest)
      })
    );
  });

  it("throws a readable error for invalid feedback responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            error: "invalid_route_feedback_request",
            message: "感想の入力内容を確認してください。"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      })
    );

    await expect(
      submitRouteFeedback(routeFeedbackRequest, "http://127.0.0.1:3000")
    ).rejects.toMatchObject({
      message: "感想の入力内容を確認してください。",
      status: 400,
      code: "invalid_route_feedback_request"
    });
  });
});
