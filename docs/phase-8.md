# Route5 Phase 8

## Goal

Add a backend scoring service that turns route metrics into comparable scores.

## In Scope

- `RouteScoringService` under `apps/api/src/services/scoring`
- distance fit score
- level fit score
- slope and flatness score
- surface comfort score
- park and water score
- shade score
- safety proxy score
- quietness score in the detailed breakdown
- uniqueness score from overlap ratio
- stronger penalties for beginner routes with steep or unpaved sections
- hill training bonus when hill routes are requested
- unit tests for scoring behavior

## Out of Scope

- AI-generated explanation text
- full OpenRouteService extra info conversion into metrics
- replacing every route generation score with the new service
- persistence

## Beginner Note

Phase 8 adds the "judge" that compares route candidates. It does not decide by feeling. It takes numbers such as slope, paved road ratio, park ratio, water ratio, and overlap, then converts them into scores from 0 to 100.

This makes the later explanation screen easier to build because the app can say why a route is good or weak.
