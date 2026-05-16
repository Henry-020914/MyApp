import type { RoutePlanRequest, RoutePlanResponse } from "@route5/shared";

export type StoredRoutePlan = {
  request: RoutePlanRequest;
  response: RoutePlanResponse;
  savedAt: string;
};

export type RoutePlanRepository = {
  saveRoutePlan(routePlan: StoredRoutePlan): Promise<void>;
  getRoutePlan(planId: string): Promise<RoutePlanResponse | null>;
};

export class InMemoryRoutePlanRepository implements RoutePlanRepository {
  private readonly routePlans = new Map<string, StoredRoutePlan>();

  async saveRoutePlan(routePlan: StoredRoutePlan) {
    this.routePlans.set(routePlan.response.planId, clone(routePlan));
  }

  async getRoutePlan(planId: string) {
    const routePlan = this.routePlans.get(planId);

    return routePlan ? clone(routePlan.response) : null;
  }
}

export type FetchLike = (
  input: string,
  init: RequestInit
) => Promise<Response>;

export type SupabaseRoutePlanRepositoryConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchFn?: FetchLike;
};

export class SupabaseRoutePlanRepository implements RoutePlanRepository {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly fetchFn: FetchLike;

  constructor({
    supabaseUrl,
    serviceRoleKey,
    fetchFn = fetch
  }: SupabaseRoutePlanRepositoryConfig) {
    this.supabaseUrl = supabaseUrl.replace(/\/+$/, "");
    this.serviceRoleKey = serviceRoleKey;
    this.fetchFn = fetchFn;
  }

  async saveRoutePlan(routePlan: StoredRoutePlan) {
    await this.callRpc("save_route_plan", {
      input_request: routePlan.request,
      input_response: routePlan.response
    });
  }

  async getRoutePlan(planId: string) {
    return this.callRpc<RoutePlanResponse | null>("get_route_plan", {
      input_plan_id: planId
    });
  }

  private async callRpc<T = null>(functionName: string, payload: unknown) {
    const response = await this.fetchFn(
      `${this.supabaseUrl}/rest/v1/rpc/${functionName}`,
      {
        method: "POST",
        headers: {
          apikey: this.serviceRoleKey,
          authorization: `Bearer ${this.serviceRoleKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Supabase RPC ${functionName} failed with ${response.status}: ${body}`
      );
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }
}

export const createRoutePlanRepositoryFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): RoutePlanRepository => {
  if (env.NODE_ENV === "test") {
    return new InMemoryRoutePlanRepository();
  }

  const supabaseUrl = env.SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (supabaseUrl && serviceRoleKey) {
    return new SupabaseRoutePlanRepository({
      supabaseUrl,
      serviceRoleKey
    });
  }

  return new InMemoryRoutePlanRepository();
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
