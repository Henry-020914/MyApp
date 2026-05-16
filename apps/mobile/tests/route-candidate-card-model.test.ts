import { mockRouteCandidates } from "@route5/shared";
import { describe, expect, it } from "vitest";
import {
  getLevelFitLabel,
  getSlopeLabel,
  getSurfaceLabel,
  toRouteCandidateCardDetails
} from "../src/components/route-candidate-card-model";

describe("route candidate card model", () => {
  it("builds the comparison details shown on a route card", () => {
    const details = toRouteCandidateCardDetails(mockRouteCandidates[0]!);

    expect(details).toEqual({
      distance: "3.1 km",
      duration: "約38分",
      slope: "少なめ",
      surface: "舗装路中心",
      features: "公園 18% / 水辺 4%",
      levelFit: "初心者向け"
    });
  });

  it("labels slope and surface in beginner-friendly words", () => {
    expect(getSlopeLabel(mockRouteCandidates[4]!)).toBe("多め");
    expect(getSurfaceLabel(mockRouteCandidates[1]!)).toBe("舗装路多め");
  });

  it("labels route fit from the score value", () => {
    expect(getLevelFitLabel(mockRouteCandidates[2]!)).toBe("普通");
    expect(getLevelFitLabel(mockRouteCandidates[4]!)).toBe("慣れている人向け");
  });
});
