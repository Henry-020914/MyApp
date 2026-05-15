# Route5

Route5 is the Phase 1 foundation for a mobile app that will suggest five loop routes for walking, jogging, or running.

This first phase intentionally uses mock route data. Real map rendering, OpenRouteService integration, Supabase/PostGIS persistence, route generation, saved routes, and feedback submission are later phases.

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

## Phase 1 Acceptance

- The mobile app has a Route5 home screen and shows five mock route candidates.
- The API exposes `GET /api/health`.
- Shared data is imported from `@route5/shared`.
- `lint`, `typecheck`, and `test` run from the repository root.
