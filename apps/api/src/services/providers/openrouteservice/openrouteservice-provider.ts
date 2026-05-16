import type { RouteCandidate } from "@route5/shared";

export const openRouteServiceExtraInfo = [
  "steepness",
  "surface",
  "waytype",
  "green",
  "noise"
] as const;

export type OpenRouteServiceExtraInfo =
  (typeof openRouteServiceExtraInfo)[number];

export type OpenRouteServiceCoordinate = [number, number];

export type OpenRouteServiceExtraInfoSummary = {
  value: number;
  distance: number;
  amount: number;
};

export type OpenRouteServiceExtraInfoValue = [number, number, number];

export type OpenRouteServiceExtraInfoBlock = {
  values: OpenRouteServiceExtraInfoValue[];
  summary: OpenRouteServiceExtraInfoSummary[];
};

export type OpenRouteServiceDirectionsResult = {
  distanceM: number;
  durationSec: number;
  geometry: RouteCandidate["geometry"];
  extras: Partial<
    Record<OpenRouteServiceExtraInfo, OpenRouteServiceExtraInfoBlock>
  >;
  attribution?: string;
};

export type OpenRouteServiceDirectionsInput = {
  coordinates: OpenRouteServiceCoordinate[];
  signal?: AbortSignal;
};

type OpenRouteServiceProviderOptions = {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

type OpenRouteServiceDirectionsRequest = {
  coordinates: OpenRouteServiceCoordinate[];
  instructions: false;
  geometry: true;
  elevation: true;
  extra_info: OpenRouteServiceExtraInfo[];
  units: "m";
};

type OpenRouteServiceGeoJsonResponse = {
  features?: Array<{
    geometry?: {
      type?: string;
      coordinates?: OpenRouteServiceCoordinate[];
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
      extras?: Record<string, OpenRouteServiceExtraInfoBlock | undefined>;
    };
  }>;
  metadata?: {
    attribution?: string;
  };
  error?: {
    code?: number | string;
    message?: string;
  };
};

export class OpenRouteServiceProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string
  ) {
    super(message);
    this.name = "OpenRouteServiceProviderError";
  }
}

export class OpenRouteServiceProvider {
  readonly profile = "foot-walking";

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor({
    apiKey,
    baseUrl = "https://api.openrouteservice.org",
    fetchImpl = fetch
  }: OpenRouteServiceProviderOptions) {
    if (!apiKey.trim()) {
      throw new OpenRouteServiceProviderError(
        "ORS_API_KEY が設定されていません。",
        undefined,
        "MISSING_ORS_API_KEY"
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.fetchImpl = fetchImpl;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env) {
    return new OpenRouteServiceProvider({
      apiKey: env.ORS_API_KEY ?? "",
      baseUrl: env.ORS_BASE_URL || undefined
    });
  }

  buildDirectionsUrl() {
    return `${this.baseUrl}/v2/directions/${this.profile}/geojson`;
  }

  buildDirectionsRequest(
    coordinates: OpenRouteServiceCoordinate[]
  ): OpenRouteServiceDirectionsRequest {
    this.assertCoordinateCount(coordinates);

    return {
      coordinates,
      instructions: false,
      geometry: true,
      elevation: true,
      extra_info: [...openRouteServiceExtraInfo],
      units: "m"
    };
  }

  async getWalkingDirections({
    coordinates,
    signal
  }: OpenRouteServiceDirectionsInput): Promise<OpenRouteServiceDirectionsResult> {
    const requestBody = this.buildDirectionsRequest(coordinates);
    const response = await this.fetchImpl(this.buildDirectionsUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: this.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal
    });
    const body = (await response.json().catch(() => null)) as
      | OpenRouteServiceGeoJsonResponse
      | null;

    if (!response.ok) {
      throw new OpenRouteServiceProviderError(
        body?.error?.message ?? "OpenRouteService への経路取得に失敗しました。",
        response.status,
        body?.error?.code ? String(body.error.code) : undefined
      );
    }

    return parseDirectionsResponse(body);
  }

  private assertCoordinateCount(coordinates: OpenRouteServiceCoordinate[]) {
    if (coordinates.length < 2) {
      throw new OpenRouteServiceProviderError(
        "OpenRouteService へ送る座標は2点以上必要です。",
        undefined,
        "INVALID_COORDINATES"
      );
    }
  }
}

const parseDirectionsResponse = (
  body: OpenRouteServiceGeoJsonResponse | null
): OpenRouteServiceDirectionsResult => {
  const feature = body?.features?.[0];
  const geometry = feature?.geometry;
  const summary = feature?.properties?.summary;

  if (
    geometry?.type !== "LineString" ||
    !geometry.coordinates ||
    !summary?.distance ||
    !summary.duration
  ) {
    throw new OpenRouteServiceProviderError(
      "OpenRouteService の応答形式が想定と異なります。",
      undefined,
      "INVALID_ORS_RESPONSE"
    );
  }

  return {
    distanceM: summary.distance,
    durationSec: summary.duration,
    geometry: {
      type: "LineString",
      coordinates: geometry.coordinates
    },
    extras: normalizeExtraInfo(feature?.properties?.extras ?? {}),
    attribution: body?.metadata?.attribution
  };
};

const normalizeExtraInfo = (
  extras: Record<string, OpenRouteServiceExtraInfoBlock | undefined>
): Partial<Record<OpenRouteServiceExtraInfo, OpenRouteServiceExtraInfoBlock>> => ({
  steepness: extras.steepness,
  surface: extras.surface,
  waytype: extras.waytype ?? extras.waytypes,
  green: extras.green,
  noise: extras.noise
});

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");
