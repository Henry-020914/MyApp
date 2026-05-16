# Route5 Phase 6

## Goal

Add the first backend route generation engine skeleton. This phase does not call OpenRouteService yet.

## In Scope

- `RouteGenerationService` under `apps/api/src/services/route-generation`
- target distance calculation from distance or time input
- activity pace defaults for stroll, walk, jog, and run
- simple level adjustment for target distance and duration estimates
- search radius calculation from target distance
- deterministic temporary intermediate point generation around the origin
- skeleton loop candidate generation using origin -> midpoint A -> midpoint B -> origin
- simple candidate scoring for distance fit, requested preference fit, level fit, and diversity
- API response creation from skeleton candidates
- unit tests for target distance, intermediate points, scoring, and response creation

## Out of Scope

- OpenRouteService HTTP calls
- real road-following geometry
- steepness, surface, waytype, green, or noise from external providers
- PostGIS persistence
- route overlap calculation from real road segments

## Beginner Note

Phase 6 is the first step from fixed mock routes toward real route generation. The API now creates temporary points around the selected origin and connects them into simple loop shapes.

These loops are still not real walking roads. They are a safe development scaffold: the app can now practice the flow of "conditions in, route-like candidates out" before Phase 7 adds an external routing provider.
