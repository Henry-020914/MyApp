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

  it("returns five skeleton route candidates for a valid request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: validRoutePlanRequest
    });

    const body = response.json<RoutePlanResponse>();

    expect(response.statusCode).toBe(200);
    expect(body.origin).toEqual(validRoutePlanRequest.origin);
    expect(body.planId).toContain("route-plan-skeleton");
    expect(body.candidates).toHaveLength(5);
    expect(body.candidates[0]?.geometry.type).toBe("LineString");
    expect(body.candidates[0]?.confidence).toBe("low");
    expect(body.warnings.length).toBeGreaterThan(0);
  });

  it("saves the generated route plan and returns it by plan id", async () => {
    const postResponse = await app.inject({
      method: "POST",
      url: "/api/route-plans",
      payload: validRoutePlanRequest
    });
    const created = postResponse.json<RoutePlanResponse>();

    const getResponse = await app.inject({
      method: "GET",
      url: `/api/route-plans/${created.planId}`
    });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json<RoutePlanResponse>()).toEqual(created);
  });

  it("returns a 404 response when a saved route plan does not exist", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/route-plans/missing-plan"
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: "route_plan_not_found"
    });
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
