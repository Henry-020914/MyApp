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
const routePlanAccessTokenHeader = "x-route5-plan-token";

export const getRoute5ApiBaseUrl = () =>
  (process.env.EXPO_PUBLIC_ROUTE5_API_URL ?? defaultApiBaseUrl).replace(
    /\/$/,
    ""
  );

const toRoute5ApiError = (
  error: unknown,
  fallbackMessage: string,
  fallbackCode: string
) => {
  if (error instanceof Route5ApiError) {
    return error;
  }

  return new Route5ApiError(fallbackMessage, 0, fallbackCode);
};

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
        body?.message ?? "Route plan creation failed.",
        response.status,
        body?.error
      );
    }

    return body as RoutePlanResponse;
  } catch (error) {
    throw toRoute5ApiError(
      error,
      "Could not connect to the Route5 API.",
      "NETWORK_ERROR"
    );
  }
};

export const getRoutePlan = async (
  planId: string,
  accessToken: string,
  baseUrl = getRoute5ApiBaseUrl()
): Promise<RoutePlanResponse> => {
  try {
    const response = await fetch(`${baseUrl}/api/route-plans/${planId}`, {
      headers: {
        [routePlanAccessTokenHeader]: accessToken
      }
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Route5ApiError(
        body?.message ?? "Route plan retrieval failed.",
        response.status,
        body?.error
      );
    }

    return body as RoutePlanResponse;
  } catch (error) {
    throw toRoute5ApiError(
      error,
      "Could not connect to the Route5 API.",
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
        body?.message ?? "Route feedback submission failed.",
        response.status,
        body?.error
      );
    }

    return body as RouteFeedbackResponse;
  } catch (error) {
    throw toRoute5ApiError(
      error,
      "Could not connect to the Route5 API.",
      "NETWORK_ERROR"
    );
  }
};
