import { mockRouteCandidates } from "@route5/shared";
import { describe, expect, it } from "vitest";
import { toRouteListItems } from "../src/features/route-planner/route-list-model";

describe("toRouteListItems", () => {
  it("creates five visible route list items", () => {
    const items = toRouteListItems(mockRouteCandidates);

    expect(items).toHaveLength(5);
    expect(items.map((item) => item.title)).toEqual([
      "坂少なめの一周",
      "公園を通る気分転換",
      "水辺を感じる一周",
      "人通り推定多め",
      "軽く走る朝ルート"
    ]);
  });

  it("includes the Phase 4 comparison fields", () => {
    const [firstItem] = toRouteListItems(mockRouteCandidates);

    expect(firstItem).toMatchObject({
      distance: "3.1 km",
      duration: "38 min",
      slope: "少なめ",
      surface: "舗装路中心",
      features: "公園 18% / 水辺 4%",
      levelFit: "初心者向け",
      cautions: ["安全を保証するものではありません"]
    });
  });
});
