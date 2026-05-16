import { describe, expect, it } from "vitest";
import {
  routeFeedbackRequestSchema,
  type RouteFeedbackRequest
} from "../src";

const validFeedback: RouteFeedbackRequest = {
  routeCandidateId: "candidate-1",
  rating: "good",
  tags: ["nice_view", "want_again"],
  comment: "また使いたいルートでした。"
};

describe("routeFeedbackRequestSchema", () => {
  it("accepts a valid route feedback request", () => {
    const parsed = routeFeedbackRequestSchema.parse(validFeedback);

    expect(parsed).toEqual(validFeedback);
  });

  it("rejects an unknown rating", () => {
    const result = routeFeedbackRequestSchema.safeParse({
      ...validFeedback,
      rating: "great"
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown tag", () => {
    const result = routeFeedbackRequestSchema.safeParse({
      ...validFeedback,
      tags: ["nice_view", "unknown_tag"]
    });

    expect(result.success).toBe(false);
  });

  it("keeps comment optional", () => {
    const result = routeFeedbackRequestSchema.safeParse({
      routeCandidateId: "candidate-1",
      rating: "neutral",
      tags: []
    });

    expect(result.success).toBe(true);
  });
});
