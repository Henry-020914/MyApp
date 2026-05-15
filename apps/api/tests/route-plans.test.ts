import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import type { RoutePlanRequest, RoutePlanResponse } from "@route5/shared";
import { buildServer } from "../src/server";

const validRoutePlanRequest: RoutePlanRequest = {
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
  preferences: ["flat", "park", "waterside"],
  routeCount: 5,
  locale: "ja-JP"
};

describe("POST /api/route-plans", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns five mock route candidates for a valid request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: validRoutePlanRequest
    });

    const body = response.json<RoutePlanResponse>();

    expect(response.statusCode).toBe(200);
    expect(body.origin).toEqual(validRoutePlanRequest.origin);
    expect(body.candidates).toHaveLength(5);
    expect(body.candidates[0]?.geometry.type).toBe("LineString");
    expect(body.warnings.length).toBeGreaterThan(0);
  });

  it("returns a 400 response when the request is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: {
        ...validRoutePlanRequest,
        routeCount: 3
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "invalid_route_plan_request"
    });
  });
});
