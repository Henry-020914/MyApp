import {
  buildMockRoutePlanResponse,
  type RoutePlanRequest,
  type RoutePlanResponse
} from "@route5/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildServer } from "../src/server";
import { RouteGenerationProviderUnavailableError } from "../src/services/route-generation";

const validRoutePlanRequest: RoutePlanRequest = {
  origin: {
    lat: 35.6812,
    lng: 139.7671,
    label: "東京駅"
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

describe("Route plan API integration behavior", () => {
  describe("default route generation", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
      app = await buildServer();
    });

    afterAll(async () => {
      await app.close();
    });

    it("returns and saves a generated route plan for valid input", async () => {
      const postResponse = await app.inject({
        method: "POST",
        url: "/api/route-plans",
        payload: validRoutePlanRequest
      });
      const created = postResponse.json<RoutePlanResponse>();

      expect(postResponse.statusCode).toBe(200);
      expect(created.candidates).toHaveLength(5);
      expect(created.warnings.length).toBeGreaterThan(0);

      const getResponse = await app.inject({
        method: "GET",
        url: `/api/route-plans/${created.planId}`,
        headers: {
          "x-route5-plan-token": created.accessToken
        }
      });

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.json<RoutePlanResponse>()).toEqual(created);
    });

    it("returns a validation error before route generation for invalid input", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/route-plans",
        payload: {
          ...validRoutePlanRequest,
          routeCount: 4
        }
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        error: "invalid_route_plan_request"
      });
    });
  });

  it("returns a friendly 503 response when the external provider fails", async () => {
    const app = await buildServer({
      routeGenerationService: {
        buildRoutePlanResponse() {
          throw new RouteGenerationProviderUnavailableError(
            "OpenRouteService is unavailable."
          );
        }
      }
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: validRoutePlanRequest
    });

    await app.close();

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      error: "route_provider_unavailable",
      message:
        "現在ルート生成が混み合っています。少し時間をおいて再試行してください。"
    });
  });

  it("returns generated candidates even when fewer than five are available", async () => {
    const partialResponse = {
      ...buildMockRoutePlanResponse(
        validRoutePlanRequest,
        new Date("2026-05-16T00:00:00.000Z")
      ),
      planId: "partial-route-plan",
      candidates: buildMockRoutePlanResponse(
        validRoutePlanRequest,
        new Date("2026-05-16T00:00:00.000Z")
      ).candidates.slice(0, 3),
      warnings: [
        "条件に合う候補が少なかったため、生成できた3件を表示します。"
      ]
    };
    const app = await buildServer({
      routeGenerationService: {
        buildRoutePlanResponse: () => partialResponse
      }
    });

    const postResponse = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: validRoutePlanRequest
    });
    const created = postResponse.json<RoutePlanResponse>();

    const getResponse = await app.inject({
      method: "GET",
      url: "/api/route-plans/partial-route-plan",
      headers: {
        "x-route5-plan-token": created.accessToken
      }
    });

    await app.close();

    expect(postResponse.statusCode).toBe(200);
    expect(created.candidates).toHaveLength(3);
    expect(created.warnings[0]).toContain("生成できた3件");
    expect(getResponse.json<RoutePlanResponse>()).toEqual(created);
  });
});
