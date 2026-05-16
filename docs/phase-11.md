# Route5 Phase 11

## Goal

Collect simple feedback for a route candidate so future phases can improve route quality.

## In Scope

- shared feedback request and response types
- shared feedback request validation schema
- `POST /api/route-feedback`
- in-memory feedback repository for local development and tests
- Supabase RPC repository implementation for configured environments
- Supabase migration SQL for `save_route_feedback`
- simple mobile feedback panel for the selected route candidate
- unit tests for validation, API behavior, repository behavior, API client behavior, and mobile feedback request creation

## Out of Scope

- user authentication
- feedback analytics dashboard
- editing or deleting feedback
- showing aggregated feedback on route cards
- using feedback to change route generation

## Beginner Note

Phase 11 adds a "comment box" for each route candidate.

The mobile app lets the user choose a simple rating, tap small reason tags, and add an optional note. The API checks that the data has the expected shape, then stores it through a repository.

In tests and local development, feedback is saved only while the API process is running. When Supabase settings are provided, the API calls the `save_route_feedback` database function instead.
