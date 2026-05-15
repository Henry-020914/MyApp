import { describe, expect, it } from "vitest";
import {
  buildMockRoutePlanResponse,
  routePlanRequestSchema,
  type RoutePlanRequest
} from "../src";

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
  preferences: ["flat", "park"],
  routeCount: 5,
  locale: "ja-JP"
};

describe("routePlanRequestSchema", () => {
  it("accepts a valid Phase 2 route plan request", () => {
    const parsed = routePlanRequestSchema.parse(validRoutePlanRequest);

    expect(parsed).toEqual(validRoutePlanRequest);
  });

  it("rejects coordinates outside the earth", () => {
    const result = routePlanRequestSchema.safeParse({
      ...validRoutePlanRequest,
      origin: {
        lat: 91,
        lng: 139.7671
      }
    });

    expect(result.success).toBe(false);
  });

  it("requires exactly five route candidates for this MVP flow", () => {
    const result = routePlanRequestSchema.safeParse({
      ...validRoutePlanRequest,
      routeCount: 4
    });

    expect(result.success).toBe(false);
  });
});

describe("buildMockRoutePlanResponse", () => {
  it("returns five LineString route candidates", () => {
    const response = buildMockRoutePlanResponse(
      validRoutePlanRequest,
      new Date("2026-05-15T00:00:00.000Z")
    );

    expect(response.candidates).toHaveLength(5);
    expect(response.candidates[0]?.geometry.type).toBe("LineString");
    expect(response.generatedAt).toBe("2026-05-15T00:00:00.000Z");
  });
});
