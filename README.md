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

## Phase 8 Acceptance

- The API has `RouteScoringService` under `apps/api/src/services/scoring`.
- The service calculates distance fit, level fit, slope, surface, park and water, shade, safety proxy, quietness, and uniqueness signals.
- Beginner scoring strongly penalizes steep and unpaved routes.
- Hill training scoring rewards routes with enough ascent when requested.
- The service returns `RouteScores` compatible with shared route candidates plus a detailed scoring breakdown.
- Scoring behavior is covered by unit tests.

## Phase 9 Acceptance

- The API has `RouteExplanationService` under `apps/api/src/services/explanation`.
- The service creates Japanese descriptions, labels, and cautions from `RouteScores` and `RouteMetrics`.
- Explanation text is template-based and does not use an LLM.
- Route generation responses use the explanation service for candidate descriptions, labels, and cautions.
- The generated wording avoids expressions that look like safety guarantees.
- Explanation behavior is covered by unit tests.

## Phase 10 Acceptance

- `supabase/migrations` contains SQL for `route_plans`, `route_candidates`, `saved_routes`, and `route_feedback`.
- The migration enables PostGIS and uses geography columns for origins and route lines.
- The API has a route plan repository interface, an in-memory implementation for local development and tests, and a Supabase RPC implementation for configured environments.
- `POST /api/route-plans` saves the generated route plan through the repository.
- `GET /api/route-plans/:planId` returns a saved route plan or `404` when it is missing.
- Repository behavior, API retrieval, and migration coverage are covered by unit tests.
