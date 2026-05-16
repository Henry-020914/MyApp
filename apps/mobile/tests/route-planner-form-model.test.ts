import { describe, expect, it } from "vitest";
import {
  defaultRoutePlannerFormValues,
  setTargetPreset,
  toRoutePlanRequest,
  toggleRoutePreference
} from "../src/features/route-planner/route-planner-form-model";

describe("route planner form model", () => {
  it("creates a valid time-based route plan request", () => {
    const result = toRoutePlanRequest(defaultRoutePlannerFormValues);

    expect(result).toMatchObject({
      success: true,
      request: {
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
      }
    });
  });

  it("creates a valid distance-based route plan request", () => {
    const result = toRoutePlanRequest(
      setTargetPreset(defaultRoutePlannerFormValues, "distance", 5)
    );

    expect(result).toMatchObject({
      success: true,
      request: {
        target: {
          type: "distance",
          value: 5,
          unit: "km"
        }
      }
    });
  });

  it("reports invalid coordinates before sending the request", () => {
    const result = toRoutePlanRequest({
      ...defaultRoutePlannerFormValues,
      originLat: "not-a-number"
    });

    expect(result).toEqual({
      success: false,
      message: "起点の緯度と経度は数字で入力してください。"
    });
  });

  it("toggles priority preferences", () => {
    const removed = toggleRoutePreference(defaultRoutePlannerFormValues, "flat");
    const added = toggleRoutePreference(removed, "waterside");

    expect(removed.preferences).toEqual(["park"]);
    expect(added.preferences).toEqual(["park", "waterside"]);
  });
});
