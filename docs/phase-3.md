# Route5 Phase 3

## Goal

Introduce MapLibre React Native to the Expo mobile app and draw the five mock route `LineString` candidates on a map.

## In Scope

- `@maplibre/maplibre-react-native` dependency
- Expo config plugin registration
- `RouteMap` component
- conversion from route candidates to GeoJSON line features
- muted display for all five routes
- highlighted display for the selected route
- unit tests for the map data model

## Out of Scope

- real route generation
- paid or production map tile provider setup
- current location permission flow
- map search, route details, saved routes, and feedback

## Beginner Note

Phase 3 connects the route data to a real map component. The route candidates already contain `LineString` coordinates. The new map model turns those coordinates into GeoJSON, which is the common data format MapLibre understands for drawing lines.

MapLibre React Native is native code. That means it cannot run inside Expo Go. To see the map on a phone or simulator, use an Expo development build.
