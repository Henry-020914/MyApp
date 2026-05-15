# Route5 Phase 2

## Goal

Add the shared API contract for route planning and make the API return five mock route candidates from `POST /api/route-plans`.

## In Scope

- `RoutePlanRequest`
- `RoutePlanResponse`
- `RouteCandidate`
- `RouteMetrics`
- `RouteScores`
- Zod validation for route plan requests
- Fastify route for `POST /api/route-plans`
- tests for valid and invalid API input

## Out of Scope

- real route generation
- OpenRouteService calls
- MapLibre rendering
- Supabase or PostGIS persistence
- route detail, saved route, and feedback APIs

## Beginner Note

Phase 2 defines the shape of the conversation between the mobile app and the API. The app says, "I want five routes from this place with these conditions." The API checks that the request has the right shape, then returns five mock routes in the same shape that real route generation will use later.
