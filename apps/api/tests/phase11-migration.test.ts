import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "../../supabase/migrations/20260516000001_phase11_route_feedback.sql"
);

describe("Phase 11 migration", () => {
  const migrationSql = readFileSync(migrationPath, "utf8");

  it("defines the route feedback RPC function", () => {
    expect(migrationSql).toContain(
      "create or replace function public.save_route_feedback"
    );
    expect(migrationSql).toContain("returns jsonb");
  });

  it("stores feedback in the existing route_feedback table", () => {
    expect(migrationSql).toContain("insert into public.route_feedback");
    expect(migrationSql).toContain("route_candidate_id");
    expect(migrationSql).toContain("rating");
    expect(migrationSql).toContain("tags");
    expect(migrationSql).toContain("comment");
  });

  it("connects client candidate ids to stored route candidates", () => {
    expect(migrationSql).toContain("route_candidates.candidate_id");
    expect(migrationSql).toContain("input_feedback ->> 'routeCandidateId'");
  });
});
