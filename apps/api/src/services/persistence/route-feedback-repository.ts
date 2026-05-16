import type {
  RouteFeedbackRequest,
  RouteFeedbackResponse
} from "@route5/shared";
import type { FetchLike } from "./route-plan-repository";

export type StoredRouteFeedback = {
  feedbackId: string;
  feedback: RouteFeedbackRequest;
  receivedAt: string;
};

export type RouteFeedbackRepository = {
  saveFeedback(
    feedback: RouteFeedbackRequest,
    receivedAt?: Date
  ): Promise<RouteFeedbackResponse>;
};

export class InMemoryRouteFeedbackRepository
  implements RouteFeedbackRepository
{
  private readonly routeFeedback = new Map<string, StoredRouteFeedback>();
  private nextId = 1;

  async saveFeedback(
    feedback: RouteFeedbackRequest,
    receivedAt = new Date()
  ) {
    const response: RouteFeedbackResponse = {
      feedbackId: `route-feedback-${this.nextId}`,
      receivedAt: receivedAt.toISOString()
    };

    this.nextId += 1;
    this.routeFeedback.set(response.feedbackId, {
      feedbackId: response.feedbackId,
      feedback: clone(feedback),
      receivedAt: response.receivedAt
    });

    return clone(response);
  }

  getSavedFeedback(feedbackId: string) {
    const savedFeedback = this.routeFeedback.get(feedbackId);

    return savedFeedback ? clone(savedFeedback) : null;
  }
}

export type SupabaseRouteFeedbackRepositoryConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  fetchFn?: FetchLike;
};

export class SupabaseRouteFeedbackRepository
  implements RouteFeedbackRepository
{
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly fetchFn: FetchLike;

  constructor({
    supabaseUrl,
    serviceRoleKey,
    fetchFn = fetch
  }: SupabaseRouteFeedbackRepositoryConfig) {
    this.supabaseUrl = supabaseUrl.replace(/\/+$/, "");
    this.serviceRoleKey = serviceRoleKey;
    this.fetchFn = fetchFn;
  }

  async saveFeedback(feedback: RouteFeedbackRequest) {
    const response = await this.fetchFn(
      `${this.supabaseUrl}/rest/v1/rpc/save_route_feedback`,
      {
        method: "POST",
        headers: {
          apikey: this.serviceRoleKey,
          authorization: `Bearer ${this.serviceRoleKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          input_feedback: feedback
        })
      }
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Supabase RPC save_route_feedback failed with ${response.status}: ${body}`
      );
    }

    return (await response.json()) as RouteFeedbackResponse;
  }
}

export const createRouteFeedbackRepositoryFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): RouteFeedbackRepository => {
  if (env.NODE_ENV === "test") {
    return new InMemoryRouteFeedbackRepository();
  }

  const supabaseUrl = env.SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (supabaseUrl && serviceRoleKey) {
    return new SupabaseRouteFeedbackRepository({
      supabaseUrl,
      serviceRoleKey
    });
  }

  return new InMemoryRouteFeedbackRepository();
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
