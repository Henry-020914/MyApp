# Route5 Phase 12

## Goal

Improve confidence in the MVP flow by adding integration-style tests for route generation and mobile route selection behavior.

## In Scope

- route generation API integration tests for valid input
- route generation API integration tests for invalid input
- route generation API integration tests for external provider failure
- route generation API integration tests for fewer than five generated candidates
- injectable route generation service for tests
- mobile flow tests for condition input, route generation response handling, route card selection, and selected route detail display
- selected route detail panel in the mobile route planner screen

## Out of Scope

- full native E2E automation with a simulator
- Detox or Playwright mobile automation
- live OpenRouteService network tests
- live Supabase database tests
- CI workflow setup

## Beginner Note

Phase 12 adds a stronger "practice run" for the app.

Instead of only checking tiny functions one by one, the new tests check longer flows. For example, the API test sends a route request, receives candidates, and confirms the saved plan can be read back. The mobile test starts from form values, applies a route response, selects another card, and checks the detail text that should be shown.

The tests still avoid real paid or external services. External API failure is simulated, so the app's error message can be checked safely and repeatedly.
