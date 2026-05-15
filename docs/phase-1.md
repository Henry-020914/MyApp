# Route5 Phase 1

## Goal

Create the first working foundation for Route5: a pnpm monorepo with a mobile app, API app, and shared package.

## In Scope

- Expo + React Native + TypeScript mobile app scaffold
- Fastify + TypeScript API scaffold
- `packages/shared` with minimal route candidate types and mock route data
- Five mock route candidates displayed in the mobile app
- `GET /api/health` endpoint
- root scripts for lint, typecheck, and test

## Out of Scope

- MapLibre map rendering
- OpenRouteService integration
- Supabase or PostGIS persistence
- real route generation
- route saving
- route feedback submission

## Beginner Note

Phase 1 is the foundation. It proves the app, API, and shared code can live together and be checked by the same commands before real route logic is added.
