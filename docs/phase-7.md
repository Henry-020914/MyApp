# Route5 Phase 7

## Goal

Add an OpenRouteService provider on the API side. This provider is the first backend-only integration point for real road-following routes.

## In Scope

- `OpenRouteServiceProvider` under `apps/api/src/services/providers/openrouteservice`
- backend-only configuration from `ORS_API_KEY` and `ORS_BASE_URL`
- `foot-walking` directions requests
- GeoJSON response handling
- `extra_info` request values: `steepness`, `surface`, `waytype`, `green`, `noise`
- API key kept out of request URL and request body
- readable provider errors for missing API keys and ORS failures
- unit tests with mocked `fetch`

## Out of Scope

- live OpenRouteService calls in automated tests
- replacing all skeleton candidates with real ORS routes
- retry and rate-limit handling
- full scoring based on ORS extras
- persistence

## Beginner Note

Phase 7 adds the part that knows how to talk to OpenRouteService. It does not put the API key in the mobile app. The key stays in the API server, and the mobile app only talks to our own backend.

The automated tests do not call the real OpenRouteService server. They use a fake response so we can confirm the request shape and response parsing without spending API quota or needing a real key.
