import type { RouteMetrics, RouteScores } from "@route5/shared";
import { describe, expect, it } from "vitest";
import { RouteExplanationService } from "../src/services/explanation";

const easyMetrics: RouteMetrics = {
  ascentM: 14,
  descentM: 12,
  maxSlopePercent: 3,
  pavedRatio: 0.93,
  unpavedRatio: 0.07,
  parkRatio: 0.3,
  watersideRatio: 0.22,
  shadeScore: 70,
  busyRoadScore: 52,
  quietScore: 76,
  scenicScore: 72
};

const easyScores: RouteScores = {
  total: 88,
  levelFit: 90,
  flatness: 90,
  surfaceComfort: 92,
  parkAndWater: 78,
  shade: 70,
  safetyProxy: 52,
  uniqueness: 84
};

const toughMetrics: RouteMetrics = {
  ascentM: 92,
  descentM: 80,
  maxSlopePercent: 9,
  pavedRatio: 0.58,
  unpavedRatio: 0.34,
  parkRatio: 0.06,
  watersideRatio: 0.02,
  shadeScore: 38,
  busyRoadScore: 82,
  quietScore: 34,
  scenicScore: 44
};

const toughScores: RouteScores = {
  total: 52,
  levelFit: 44,
  flatness: 34,
  surfaceComfort: 42,
  parkAndWater: 16,
  shade: 38,
  safetyProxy: 82,
  uniqueness: 62
};

describe("RouteExplanationService", () => {
  const service = new RouteExplanationService();

  it("creates Japanese description, labels, and cautions from route signals", () => {
    const explanation = service.explainRoute({
      scores: easyScores,
      metrics: easyMetrics,
      confidence: "medium"
    });

    expect(explanation.description).toContain("坂が少なめ");
    expect(explanation.description).toContain("舗装路中心");
    expect(explanation.labels).toEqual(
      expect.arrayContaining(["条件に合いやすい", "坂少なめ", "舗装路中心"])
    );
    expect(explanation.cautions[0]).toContain("地図データに基づく推定");
  });

  it("adds practical cautions for steep, unpaved, sunny, and busier routes", () => {
    const explanation = service.explainRoute({
      scores: toughScores,
      metrics: toughMetrics,
      confidence: "low"
    });

    expect(explanation.labels).toEqual(
      expect.arrayContaining(["坂トレ向き", "未舗装あり", "人通り多めの目安"])
    );
    expect(explanation.cautions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("実際の道の状態と異なる場合があります"),
        expect.stringContaining("坂がきつく感じる可能性があります"),
        expect.stringContaining("未舗装区間が多い可能性があります"),
        expect.stringContaining("日陰が少ない可能性があります"),
        expect.stringContaining("横断時は信号や車の流れを確認してください")
      ])
    );
  });

  it("does not produce wording that looks like a safety guarantee", () => {
    const explanation = service.explainRoute({
      scores: easyScores,
      metrics: easyMetrics,
      confidence: "high"
    });
    const allText = [
      explanation.description,
      ...explanation.labels,
      ...explanation.cautions
    ].join("\n");

    expect(allText).not.toMatch(/安全です|安心です|必ず安全|保証|危険はありません/);
  });
});
