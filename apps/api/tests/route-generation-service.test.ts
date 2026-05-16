import type { RoutePlanRequest } from "@route5/shared";
import { describe, expect, it } from "vitest";
import { RouteGenerationService } from "../src/services/route-generation";

const baseRequest: RoutePlanRequest = {
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

describe("RouteGenerationService", () => {
  const service = new RouteGenerationService();

  it("calculates target distance from distance input", () => {
    expect(service.calculateTargetDistanceM(baseRequest)).toBe(5000);
  });

  it("calculates target distance from time, activity, and level", () => {
    const request: RoutePlanRequest = {
      ...baseRequest,
      target: {
        type: "time",
        value: 30,
        unit: "min"
      },
      activity: "walk",
      level: "beginner"
    };

    expect(service.calculateTargetDistanceM(request)).toBe(2250);
  });

  it("generates eight deterministic intermediate points around the origin", () => {
    const points = service.generateIntermediatePoints(
      baseRequest.origin,
      5000,
      "stable-seed"
    );

    expect(points).toHaveLength(8);
    expect(points[0]).toMatchObject({
      id: "midpoint-1",
      radiusM: 1250
    });
    expect(points[0]?.point).not.toEqual(baseRequest.origin);
    expect(new Set(points.map((point) => point.id)).size).toBe(8);
  });

  it("builds scored skeleton candidates without calling an external route API", () => {
    const plan = service.buildPlan(baseRequest);

    expect(plan.targetDistanceM).toBe(5000);
    expect(plan.searchRadiusM).toBe(1250);
    expect(plan.intermediatePoints).toHaveLength(8);
    expect(plan.candidates).toHaveLength(5);
    expect(plan.warnings[0]).toContain("外部ルーティングAPIをまだ呼ばず");

    const scores = plan.candidates.map((candidate) => candidate.score.total);
    expect(scores).toEqual([...scores].sort((left, right) => right - left));
    expect(plan.candidates[0]?.geometry.coordinates[0]).toEqual([
      baseRequest.origin.lng,
      baseRequest.origin.lat
    ]);
    expect(plan.candidates[0]?.geometry.coordinates.at(-1)).toEqual([
      baseRequest.origin.lng,
      baseRequest.origin.lat
    ]);
  });

  it("scores a candidate higher when it matches a requested preference", () => {
    const matching = service.scoreCandidate(
      {
        theme: "park",
        estimatedDistanceM: 5000,
        targetDistanceM: 5000,
        bearingSeparationDeg: 90
      },
      baseRequest
    );
    const nonMatching = service.scoreCandidate(
      {
        theme: "busy",
        estimatedDistanceM: 5000,
        targetDistanceM: 5000,
        bearingSeparationDeg: 90
      },
      baseRequest
    );

    expect(matching.total).toBeGreaterThan(nonMatching.total);
  });

  it("converts the skeleton plan into a route plan response", () => {
    const response = service.buildRoutePlanResponse(
      baseRequest,
      new Date("2026-05-16T00:00:00.000Z")
    );

    expect(response.planId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
    expect(response.accessToken).toHaveLength(43);
    expect(response.origin).toEqual(baseRequest.origin);
    expect(response.candidates).toHaveLength(5);
    expect(response.candidates[0]).toMatchObject({
      geometry: {
        type: "LineString"
      },
      confidence: "low"
    });
    expect(response.generatedAt).toBe("2026-05-16T00:00:00.000Z");
  });
});
