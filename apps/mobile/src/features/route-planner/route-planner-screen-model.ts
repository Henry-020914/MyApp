import {
  mockRouteCandidates,
  type RouteCandidate,
  type RoutePlanResponse
} from "@route5/shared";

export type RoutePlannerScreenState = {
  routes: RouteCandidate[];
  selectedRouteId?: string;
  warnings: string[];
  planId?: string;
  feedbackMessage?: string;
  feedbackError?: string;
};

export const createInitialRoutePlannerScreenState =
  (): RoutePlannerScreenState => ({
    routes: mockRouteCandidates,
    selectedRouteId: mockRouteCandidates[0]?.id,
    warnings: []
  });

export const applyRoutePlanResponse = (
  state: RoutePlannerScreenState,
  response: RoutePlanResponse
): RoutePlannerScreenState => ({
  ...state,
  routes: response.candidates,
  selectedRouteId: response.candidates[0]?.id,
  warnings: response.warnings,
  planId: response.planId,
  feedbackMessage: undefined,
  feedbackError: undefined
});

export const selectRouteCandidate = (
  state: RoutePlannerScreenState,
  routeId: string
): RoutePlannerScreenState => ({
  ...state,
  selectedRouteId: routeId,
  feedbackMessage: undefined,
  feedbackError: undefined
});

export const getSelectedRouteCandidate = (
  state: RoutePlannerScreenState
): RouteCandidate | undefined =>
  state.routes.find((route) => route.id === state.selectedRouteId) ??
  state.routes[0];
