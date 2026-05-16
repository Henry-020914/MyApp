# Route5 Phase 4

## Goal

Improve the route candidate cards so users can compare the five route choices from the list and switch the selected route by tapping a card.

## In Scope

- richer `RouteCandidateCard` display
- distance and estimated duration
- slope label
- surface label
- park and waterside feature summary
- level-fit label
- feature labels
- caution text
- selected card state
- tests for card display data

## Out of Scope

- route detail screen
- route generation form
- real route generation
- saved routes
- feedback submission

## Beginner Note

Phase 4 makes the cards useful for comparison. The route data already has numbers such as ascent, paved ratio, park ratio, and scores. The new card model turns those numbers into short labels like "坂 少なめ" and "舗装路中心" so the screen is easier to read.
