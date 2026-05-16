import type { RouteMetrics } from "@route5/shared";
import { describe, expect, it } from "vitest";
import { RouteScoringService } from "../src/services/scoring";

const comfortableMetrics: RouteMetrics = {
  ascentM: 14,
  descentM: 12,
  maxSlopePercent: 3,
  pavedRatio: 0.93,
  unpavedRatio: 0.07,
  parkRatio: 0.26,
  watersideRatio: 0.08,
  shadeScore: 60,
  busyRoadScore: 58,
  quietScore: 66
};

const toughMetrics: RouteMetrics = {
  ascentM: 90,
  descentM: 80,
  maxSlopePercent: 9,
  pavedRatio: 0.62,
  unpavedRatio: 0.38,
  parkRatio: 0.06,
  watersideRatio: 0.02,
  shadeScore: 42,
  busyRoadScore: 38,
  quietScore: 58
};

describe("RouteScoringService", () => {
  const service = new RouteScoringService();

  it("scores distance fit highest near the target distance", () => {
    const exact = service.scoreDistanceFit(5000, 5000);
    const far = service.scoreDistanceFit(6500, 5000);

    expect(exact).toBe(100);
    expect(far).toBeLessThan(50);
  });

  it("strongly penalizes steep and unpaved routes for beginners", () => {
    const easy = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: comfortableMetrics,
      level: "beginner",
      preferences: ["flat"],
      overlapRatio: 0.1
    });
    const tough = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: toughMetrics,
      level: "beginner",
      preferences: ["flat"],
      overlapRatio: 0.1
    });

    expect(easy.scores.levelFit).toBeGreaterThan(tough.scores.levelFit);
    expect(easy.scores.flatness).toBeGreaterThan(tough.scores.flatness);
    expect(easy.scores.surfaceComfort).toBeGreaterThan(
      tough.scores.surfaceComfort
    );
  });

  it("rewards ascent when hill training is requested", () => {
    const beginner = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: toughMetrics,
      level: "beginner",
      preferences: ["flat"],
      overlapRatio: 0.1
    });
    const hillTraining = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: toughMetrics,
      level: "hill_ok",
      preferences: ["hill_training"],
      overlapRatio: 0.1
    });

    expect(hillTraining.scores.levelFit).toBeGreaterThan(
      beginner.scores.levelFit
    );
    expect(hillTraining.scores.flatness).toBeGreaterThan(
      beginner.scores.flatness
    );
  });

  it("raises park and water score when matching preferences are requested", () => {
    const neutral = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: comfortableMetrics,
      level: "normal",
      preferences: [],
      overlapRatio: 0.1
    });
    const preferred = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: comfortableMetrics,
      level: "normal",
      preferences: ["park", "waterside", "scenic"],
      overlapRatio: 0.1
    });

    expect(preferred.scores.parkAndWater).toBeGreaterThan(
      neutral.scores.parkAndWater
    );
  });

  it("calculates quietness and uniqueness in the detailed breakdown", () => {
    const result = service.scoreRoute({
      distanceM: 5000,
      targetDistanceM: 5000,
      metrics: comfortableMetrics,
      level: "normal",
      preferences: ["quiet"],
      overlapRatio: 0.72
    });

    expect(result.breakdown.quietness).toBe(78);
    expect(result.scores.uniqueness).toBe(28);
    expect(result.breakdown.distanceFit).toBe(100);
  });

  it("returns RouteScores compatible with shared route candidates", () => {
    const result = service.scoreRoute({
      distanceM: 4900,
      targetDistanceM: 5000,
      metrics: comfortableMetrics,
      level: "normal",
      preferences: ["park"],
      overlapRatio: 0
    });

    expect(result.scores).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        levelFit: expect.any(Number),
        flatness: expect.any(Number),
        surfaceComfort: expect.any(Number),
        parkAndWater: expect.any(Number),
        shade: expect.any(Number),
        safetyProxy: expect.any(Number),
        uniqueness: expect.any(Number)
      })
    );
  });
});
