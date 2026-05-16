import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "../../supabase/migrations/20260516000000_phase10_route_persistence.sql"
);

describe("Phase 10 migration", () => {
  const migrationSql = readFileSync(migrationPath, "utf8");

  it("creates the required route persistence tables", () => {
    expect(migrationSql).toContain("create extension if not exists postgis");
    expect(migrationSql).toContain(
      "create table if not exists public.route_plans"
    );
    expect(migrationSql).toContain(
      "create table if not exists public.route_candidates"
    );
    expect(migrationSql).toContain(
      "create table if not exists public.saved_routes"
    );
    expect(migrationSql).toContain(
      "create table if not exists public.route_feedback"
    );
  });

  it("uses PostGIS geography columns for route geometry", () => {
    expect(migrationSql).toContain("origin geography(point, 4326)");
    expect(migrationSql).toContain("geometry geography(linestring, 4326)");
    expect(migrationSql).toContain("using gist (origin)");
    expect(migrationSql).toContain("using gist (geometry)");
  });

  it("defines RPC functions used by the Supabase repository", () => {
    expect(migrationSql).toContain(
      "create or replace function public.save_route_plan"
    );
    expect(migrationSql).toContain(
      "create or replace function public.get_route_plan"
    );
    expect(migrationSql).toContain("st_geomfromgeojson");
  });

  it("stores and checks route plan access tokens", () => {
    expect(migrationSql).toContain("access_token text not null");
    expect(migrationSql).toContain("input_response ->> 'accessToken'");
    expect(migrationSql).toContain("input_access_token text");
    expect(migrationSql).toContain(
      "route_plans.access_token = input_access_token"
    );
  });
});
