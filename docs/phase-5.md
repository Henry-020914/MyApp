# Route5 Phase 5

## Goal

Add a condition input form to the mobile app and submit those conditions to `POST /api/route-plans`.

## In Scope

- origin label, latitude, and longitude inputs
- distance or time target selection
- distance and time presets plus free numeric input
- activity mode selection
- fitness level selection
- priority preference multi-select
- API client for `POST /api/route-plans`
- loading and error states
- replacing displayed route candidates with the API response
- tests for form-to-request conversion and API client behavior

## Out of Scope

- current location permission flow
- map pin selection
- search by station, address, or facility
- real route generation
- route detail screen
- saved routes and feedback

## Beginner Note

Phase 5 is where the app starts talking to the API from the mobile screen. The form collects what the user wants, turns it into `RoutePlanRequest`, sends it to the API, and then replaces the map and cards with the returned five route candidates.

For local development, set `EXPO_PUBLIC_ROUTE5_API_URL` to the API server URL. `http://127.0.0.1:3000` works for local checks on the same machine, but a physical phone usually needs the computer's LAN address.
