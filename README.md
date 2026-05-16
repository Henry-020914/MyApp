# Route5

Route5 is the foundation for a mobile app that will suggest five loop routes for walking, jogging, or running.

The current implementation still uses mock route data. Real map rendering, OpenRouteService integration, Supabase/PostGIS persistence, route generation, saved routes, and feedback submission are later phases.

## Workspace

- `apps/mobile`: Expo + React Native app
- `apps/api`: Fastify API server
- `packages/shared`: shared mock data and types
- `docs`: requirements notes for the implementation phases

## Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm dev:api
pnpm dev:mobile
```

Use `pnpm dev:mobile` to start Expo from the mobile package. Avoid using `pnpm exec expo` from the repository root because it can miss the package-local Expo command on Windows.

## Phase 1 Acceptance

- The mobile app has a Route5 home screen and shows five mock route candidates.
- The API exposes `GET /api/health`.
- Shared data is imported from `@route5/shared`.
- `lint`, `typecheck`, and `test` run from the repository root.

## Phase 2 Acceptance

- `packages/shared` exports `RoutePlanRequest`, `RoutePlanResponse`, `RouteCandidate`, `RouteMetrics`, and `RouteScores`.
- `packages/shared` exports a Zod schema for validating route plan requests.
- The API exposes `POST /api/route-plans`.
- A valid route plan request returns five mock `LineString` route candidates.
- Invalid route plan input returns a `400` response.

## Phase 3 Acceptance

- The mobile app includes MapLibre React Native.
- Expo config registers the MapLibre config plugin.
- The Route5 home screen draws the five mock `LineString` routes on a map.
- The selected route is highlighted above the muted route set.
- MapLibre requires an Expo development build; it does not run in Expo Go.

## Phase 4 Acceptance

- Route cards show distance, estimated duration, slope, surface, features, level fit, labels, and cautions.
- Tapping a route card updates the selected route.
- The selected route card has a visible selected state.
- Card display labels are covered by unit tests.

## Phase 5 Acceptance

- The mobile app has a route planner form for origin, distance/time, activity, level, and preferences.
- Form values are converted into `RoutePlanRequest`.
- Submitting the form calls `POST /api/route-plans`.
- The returned candidates replace the map and card list.
- Loading and error states are shown.
- Form conversion and API client behavior are covered by unit tests.

## Phase 6 Acceptance

- The API has `RouteGenerationService` under `apps/api/src/services/route-generation`.
- The service calculates `targetDistanceM` from distance or time input.
- The service generates deterministic temporary intermediate points around the origin.
- The service creates scored skeleton loop candidates without calling an external API.
- `POST /api/route-plans` returns five low-confidence skeleton candidates.
- Target distance, candidate generation, scoring, and response creation are covered by unit tests.

## Phase 7 Acceptance

- The API has `OpenRouteServiceProvider` under `apps/api/src/services/providers/openrouteservice`.
- The provider reads `ORS_API_KEY` and `ORS_BASE_URL` from backend environment variables.
- The provider sends `foot-walking` GeoJSON directions requests.
- Requests include `extra_info` for `steepness`, `surface`, `waytype`, `green`, and `noise`.
- The API key is sent only in the backend request header, not in the URL or request body.
- Provider request creation, response parsing, and error handling are covered by unit tests with mocked network calls.
