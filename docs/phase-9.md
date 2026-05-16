# Route5 Phase 9

## Goal

Add a backend explanation service that turns route scores and route metrics into Japanese text that users can understand.

## In Scope

- `RouteExplanationService` under `apps/api/src/services/explanation`
- Japanese route description text
- Japanese route labels
- practical route cautions
- template-based generation without an LLM
- route generation responses using the explanation service
- unit tests for explanation behavior

## Out of Scope

- LLM-generated copy
- personalized long-form coaching
- safety guarantees
- persistence
- feedback learning

## Beginner Note

Phase 8 created the route "score keeper." Phase 9 creates the route "explainer."

The service looks at numbers such as slope, paved road ratio, park ratio, water ratio, shade, quietness, and the total score. It then creates short Japanese text such as labels and cautions.

The app must not say that a route is definitely safe. It can only say that the result is based on map data and that the user should check the real-world situation.
