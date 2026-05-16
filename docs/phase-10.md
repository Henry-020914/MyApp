# Route5 Phase 10

## Goal

Prepare route persistence for Supabase Postgres + PostGIS and make generated route plans retrievable by plan id.

## In Scope

- Supabase migration SQL for `route_plans`
- Supabase migration SQL for `route_candidates`
- Supabase migration SQL for `saved_routes`
- Supabase migration SQL for `route_feedback`
- route plan repository interface
- in-memory repository implementation for local development and tests
- Supabase RPC repository implementation for configured environments
- saving `POST /api/route-plans` responses
- `GET /api/route-plans/:planId`
- unit tests for repository behavior, API retrieval, and migration coverage

## Out of Scope

- connecting to a live Supabase project
- authentication
- saved route API implementation
- feedback API implementation
- account-based cloud sync

## Beginner Note

Phase 10 adds the app's first "storage shelf."

The migration SQL describes the real database tables that Supabase should have. It also defines database functions that the API can call when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.

Local tests use an in-memory repository. That means the data exists while the API process is running, but it is not permanent unless Supabase is configured.
