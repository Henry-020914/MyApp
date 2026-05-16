import type {
  RouteFeedbackRequest,
  RouteFeedbackResponse,
  RoutePlanRequest,
  RoutePlanResponse
} from "@route5/shared";

export class Route5ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "Route5ApiError";
  }
}

const defaultApiBaseUrl = "http://127.0.0.1:3000";

export const getRoute5ApiBaseUrl = () =>
  (process.env.EXPO_PUBLIC_ROUTE5_API_URL ?? defaultApiBaseUrl).replace(
    /\/$/,
    ""
  );

export const createRoutePlan = async (
  request: RoutePlanRequest,
  baseUrl = getRoute5ApiBaseUrl()
): Promise<RoutePlanResponse> => {
  try {
    const response = await fetch(`${baseUrl}/api/route-plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Route5ApiError(
        body?.message ?? "ルート生成に失敗しました。",
        response.status,
        body?.error
      );
    }

    return body as RoutePlanResponse;
  } catch (error) {
    if (error instanceof Route5ApiError) {
      throw error;
    }

    throw new Route5ApiError(
      "APIに接続できません。APIサーバーが起動しているか確認してください。",
      0,
      "NETWORK_ERROR"
    );
  }
};

export const submitRouteFeedback = async (
  request: RouteFeedbackRequest,
  baseUrl = getRoute5ApiBaseUrl()
): Promise<RouteFeedbackResponse> => {
  try {
    const response = await fetch(`${baseUrl}/api/route-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Route5ApiError(
        body?.message ?? "フィードバック送信に失敗しました。",
        response.status,
        body?.error
      );
    }

    return body as RouteFeedbackResponse;
  } catch (error) {
    if (error instanceof Route5ApiError) {
      throw error;
    }

    throw new Route5ApiError(
      "APIに接続できません。APIサーバーが起動しているか確認してください。",
      0,
      "NETWORK_ERROR"
    );
  }
};
