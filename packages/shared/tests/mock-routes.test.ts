import { describe, expect, it } from "vitest";
import { mockRouteCandidates } from "../src";

describe("mockRouteCandidates", () => {
  it("contains five route candidates for Phase 1", () => {
    expect(mockRouteCandidates).toHaveLength(5);
  });

  it("keeps every route user-readable", () => {
    for (const route of mockRouteCandidates) {
      expect(route.name.length).toBeGreaterThan(0);
      expect(route.summary.length).toBeGreaterThan(0);
      expect(route.labels.length).toBeGreaterThan(0);
    }
  });
});
