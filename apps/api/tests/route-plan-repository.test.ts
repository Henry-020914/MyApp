import type { RoutePlanRequest, RoutePlanResponse } from "@route5/shared";
import { describe, expect, it } from "vitest";
import {
  createRoutePlanRepositoryFromEnv,
  InMemoryRoutePlanRepository,
  SupabaseRoutePlanRepository,
  type FetchLike
} from "../src/services/persistence";

const request: RoutePlanRequest = {
  origin: {
    lat: 35.6812,
    lng: 139.7671,
    label: "Tokyo Station"
  },
  target: {
    type: "distance",
    value: 5,
    unit: "km"
  },
  activity: "jog",
  level: "beginner",
  preferences: ["flat", "park"],
  routeCount: 5,
  locale: "ja-JP"
};

const response: RoutePlanResponse = {
  planId: "route-plan-skeleton-test",
  accessToken: "route-plan-access-token-test",
  origin: request.origin,
  candidates: [
    {
      id: "candidate-1",
      name: "Test route",
      description: "Test route description.",
      geometry: {
        type: "LineString",
        coordinates: [
          [139.7671, 35.6812],
          [139.768, 35.682],
          [139.7671, 35.6812]
        ]
      },
      distanceM: 1000,
      estimatedDurationSec: 600,
      metrics: {
        ascentM: 10,
        descentM: 9
      },
      scores: {
        total: 80,
        levelFit: 85,
        flatness: 90,
        surfaceComfort: 88,
        parkAndWater: 60,
        shade: 50,
        safetyProxy: 55,
        uniqueness: 75
      },
      labels: ["Test label"],
      cautions: ["Test caution"],
      confidence: "low"
    }
  ],
  warnings: ["Test warning"],
  generatedAt: "2026-05-16T00:00:00.000Z"
};

describe("InMemoryRoutePlanRepository", () => {
  it("saves and returns a route plan response by id", async () => {
    const repository = new InMemoryRoutePlanRepository();

    await repository.saveRoutePlan({
      request,
      response,
      savedAt: "2026-05-16T00:00:01.000Z"
    });

    await expect(
      repository.getRoutePlan(response.planId, response.accessToken)
    ).resolves.toEqual(response);
  });

  it("returns null when a route plan is missing", async () => {
    const repository = new InMemoryRoutePlanRepository();

    await expect(
      repository.getRoutePlan("missing-plan", response.accessToken)
    ).resolves.toBeNull();
  });

  it("returns null when the access token is wrong", async () => {
    const repository = new InMemoryRoutePlanRepository();
    await repository.saveRoutePlan({
      request,
      response,
      savedAt: "2026-05-16T00:00:01.000Z"
    });

    await expect(
      repository.getRoutePlan(response.planId, "wrong-route-plan-access-token")
    ).resolves.toBeNull();
  });

  it("returns a defensive copy so callers cannot mutate saved data", async () => {
    const repository = new InMemoryRoutePlanRepository();
    await repository.saveRoutePlan({
      request,
      response,
      savedAt: "2026-05-16T00:00:01.000Z"
    });

    const firstRead = await repository.getRoutePlan(
      response.planId,
      response.accessToken
    );
    firstRead?.candidates[0]?.labels.push("Mutated label");

    const secondRead = await repository.getRoutePlan(
      response.planId,
      response.accessToken
    );

    expect(secondRead?.candidates[0]?.labels).toEqual(["Test label"]);
  });
});

describe("SupabaseRoutePlanRepository", () => {
  it("calls save and get RPC functions with service role headers", async () => {
    const requests: Array<{ input: string; init: RequestInit }> = [];
    const fetchFn: FetchLike = async (input, init) => {
      requests.push({ input, init });

      if (input.endsWith("/get_route_plan")) {
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        });
      }

      return new Response("null", {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      });
    };
    const repository = new SupabaseRoutePlanRepository({
      supabaseUrl: "https://example.supabase.co/",
      serviceRoleKey: "service-role-key",
      fetchFn
    });

    await repository.saveRoutePlan({
      request,
      response,
      savedAt: "2026-05-16T00:00:01.000Z"
    });
    await expect(
      repository.getRoutePlan(response.planId, response.accessToken)
    ).resolves.toEqual(response);

    expect(requests[0]?.input).toBe(
      "https://example.supabase.co/rest/v1/rpc/save_route_plan"
    );
    expect(requests[1]?.input).toBe(
      "https://example.supabase.co/rest/v1/rpc/get_route_plan"
    );
    expect(requests[0]?.init.headers).toMatchObject({
      apikey: "service-role-key",
      authorization: "Bearer service-role-key"
    });
    expect(JSON.parse(String(requests[0]?.init.body))).toMatchObject({
      input_response: {
        planId: response.planId
      }
    });
    expect(JSON.parse(String(requests[1]?.init.body))).toEqual({
      input_plan_id: response.planId,
      input_access_token: response.accessToken
    });
  });

  it("uses memory storage in tests even when Supabase env vars exist", () => {
    const repository = createRoutePlanRepositoryFromEnv({
      NODE_ENV: "test",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key"
    });

    expect(repository).toBeInstanceOf(InMemoryRoutePlanRepository);
  });
});
