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
