import { describe, expect, it } from "vitest";
import {
  buildRouteFeedbackRequest,
  toggleFeedbackTag
} from "../src/features/route-feedback/route-feedback-model";

describe("route feedback model", () => {
  it("adds and removes feedback tags", () => {
    expect(toggleFeedbackTag(["nice_view"], "want_again")).toEqual([
      "nice_view",
      "want_again"
    ]);
    expect(toggleFeedbackTag(["nice_view", "want_again"], "nice_view")).toEqual(
      ["want_again"]
    );
  });

  it("builds a feedback request with a trimmed comment", () => {
    expect(
      buildRouteFeedbackRequest(
        "candidate-1",
        "good",
        ["nice_view"],
        "  よかったです。  "
      )
    ).toEqual({
      routeCandidateId: "candidate-1",
      rating: "good",
      tags: ["nice_view"],
      comment: "よかったです。"
    });
  });

  it("omits an empty comment", () => {
    expect(
      buildRouteFeedbackRequest("candidate-1", "neutral", [], "   ")
    ).toEqual({
      routeCandidateId: "candidate-1",
      rating: "neutral",
      tags: []
    });
  });
});
