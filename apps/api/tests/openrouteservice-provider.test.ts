import { describe, expect, it, vi } from "vitest";
import {
  OpenRouteServiceProvider,
  OpenRouteServiceProviderError,
  openRouteServiceExtraInfo
} from "../src/services/providers/openrouteservice";

const coordinates: [number, number][] = [
  [139.7671, 35.6812],
  [139.771, 35.682],
  [139.7671, 35.6812]
];

const geoJsonResponse = {
  type: "FeatureCollection",
  metadata: {
    attribution: "openrouteservice.org | OpenStreetMap contributors"
  },
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates
      },
      properties: {
        summary: {
          distance: 1320.5,
          duration: 960.2
        },
        extras: {
          steepness: {
            values: [[0, 2, 0]],
            summary: [{ value: 0, distance: 1320.5, amount: 100 }]
          },
          surface: {
            values: [[0, 2, 3]],
            summary: [{ value: 3, distance: 1320.5, amount: 100 }]
          },
          waytype: {
            values: [[0, 2, 7]],
            summary: [{ value: 7, distance: 1320.5, amount: 100 }]
          },
          green: {
            values: [[0, 2, 6]],
            summary: [{ value: 6, distance: 1320.5, amount: 100 }]
          },
          noise: {
            values: [[0, 2, 2]],
            summary: [{ value: 2, distance: 1320.5, amount: 100 }]
          }
        }
      }
    }
  ]
};

describe("OpenRouteServiceProvider", () => {
  it("builds a foot-walking GeoJSON directions request with required extra info", () => {
    const provider = new OpenRouteServiceProvider({
      apiKey: "test-key",
      baseUrl: "https://ors.example.com/"
    });

    expect(provider.profile).toBe("foot-walking");
    expect(provider.buildDirectionsUrl()).toBe(
      "https://ors.example.com/v2/directions/foot-walking/geojson"
    );
    expect(provider.buildDirectionsRequest(coordinates)).toEqual({
      coordinates,
      instructions: false,
      geometry: true,
      elevation: true,
      extra_info: openRouteServiceExtraInfo,
      units: "m"
    });
  });

  it("reads backend-only configuration from ORS environment variables", () => {
    const provider = OpenRouteServiceProvider.fromEnv({
      ORS_API_KEY: "env-key",
      ORS_BASE_URL: "https://ors.local/"
    });

    expect(provider.buildDirectionsUrl()).toBe(
      "https://ors.local/v2/directions/foot-walking/geojson"
    );
  });

  it("posts to OpenRouteService without putting the API key in the URL or body", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify(geoJsonResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });
    });
    const provider = new OpenRouteServiceProvider({
      apiKey: "secret-api-key",
      baseUrl: "https://ors.example.com",
      fetchImpl: fetchMock
    });

    const result = await provider.getWalkingDirections({ coordinates });

    expect(result).toMatchObject({
      distanceM: 1320.5,
      durationSec: 960.2,
      geometry: {
        type: "LineString",
        coordinates
      },
      attribution: "openrouteservice.org | OpenStreetMap contributors"
    });
    expect(result.extras.steepness?.summary[0]?.amount).toBe(100);
    expect(result.extras.waytype?.summary[0]?.value).toBe(7);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://ors.example.com/v2/directions/foot-walking/geojson",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "secret-api-key"
        })
      })
    );

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit
    ];
    expect(String(init.body)).not.toContain("secret-api-key");
    expect(url).not.toContain("secret-api-key");
  });

  it("normalizes legacy waytypes extra info response keys", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          ...geoJsonResponse,
          features: [
            {
              ...geoJsonResponse.features[0],
              properties: {
                ...geoJsonResponse.features[0].properties,
                extras: {
                  waytypes: {
                    values: [[0, 2, 3]],
                    summary: [{ value: 3, distance: 1320.5, amount: 100 }]
                  }
                }
              }
            }
          ]
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    });
    const provider = new OpenRouteServiceProvider({
      apiKey: "test-key",
      fetchImpl: fetchMock
    });

    const result = await provider.getWalkingDirections({ coordinates });

    expect(result.extras.waytype?.summary[0]?.value).toBe(3);
  });

  it("throws a readable error when ORS_API_KEY is missing", () => {
    expect(() => OpenRouteServiceProvider.fromEnv({})).toThrow(
      OpenRouteServiceProviderError
    );
  });

  it("throws a readable error for OpenRouteService failures", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 2010,
            message: "Route could not be found"
          }
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    });
    const provider = new OpenRouteServiceProvider({
      apiKey: "test-key",
      fetchImpl: fetchMock
    });

    await expect(provider.getWalkingDirections({ coordinates })).rejects.toMatchObject({
      message: "Route could not be found",
      status: 400,
      code: "2010"
    });
  });
});
