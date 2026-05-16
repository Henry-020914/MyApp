import { buildMockRoutePlanResponse } from "@route5/shared";
import { describe, expect, it } from "vitest";
import { toRouteDetailDisplay } from "../src/features/route-detail/route-detail-model";
import {
  applyRoutePlanResponse,
  createInitialRoutePlannerScreenState,
  getSelectedRouteCandidate,
  selectRouteCandidate
} from "../src/features/route-planner/route-planner-screen-model";
import {
  defaultRoutePlannerFormValues,
  toRoutePlanRequest
} from "../src/features/route-planner/route-planner-form-model";

describe("route planner mobile flow", () => {
  it("covers condition input, route generation, card selection, and detail display", () => {
    const formResult = toRoutePlanRequest(defaultRoutePlannerFormValues);

    expect(formResult.success).toBe(true);
    if (!formResult.success) {
      throw new Error(formResult.message);
    }

    const response = buildMockRoutePlanResponse(
      formResult.request,
      new Date("2026-05-16T00:00:00.000Z")
    );
    const initialState = createInitialRoutePlannerScreenState();
    const generatedState = applyRoutePlanResponse(initialState, response);

    expect(generatedState.planId).toBe("mock-route-plan-1778889600000");
    expect(generatedState.routes).toHaveLength(5);
    expect(generatedState.selectedRouteId).toBe(response.candidates[0]?.id);

    const thirdRoute = response.candidates[2]!;
    const selectedState = selectRouteCandidate(generatedState, thirdRoute.id);
    const selectedRoute = getSelectedRouteCandidate(selectedState);
    const detail = toRouteDetailDisplay(selectedRoute!);

    expect(selectedRoute?.id).toBe(thirdRoute.id);
    expect(detail).toMatchObject({
      title: thirdRoute.name,
      distance: "5.0 km",
      duration: "約42分",
      slope: "ふつう",
      surface: "舗装路多め"
    });
    expect(detail.cautions).toContain("雨上がりは足元を確認してください");
  });

  it("clears old feedback messages when selecting another route", () => {
    const state = selectRouteCandidate(
      {
        ...createInitialRoutePlannerScreenState(),
        feedbackMessage: "送信しました ID route-feedback-1",
        feedbackError: "前回のエラー"
      },
      "park-loop"
    );

    expect(state.selectedRouteId).toBe("park-loop");
    expect(state.feedbackMessage).toBeUndefined();
    expect(state.feedbackError).toBeUndefined();
  });
});
