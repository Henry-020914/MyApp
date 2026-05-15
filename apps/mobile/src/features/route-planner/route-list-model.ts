import type { MockRouteCandidate } from "@route5/shared";
import { formatDistanceKm, formatDuration } from "@route5/shared";

export type RouteListItem = {
  id: string;
  title: string;
  summary: string;
  distance: string;
  duration: string;
  labels: string[];
};

export const toRouteListItems = (
  routes: MockRouteCandidate[]
): RouteListItem[] =>
  routes.map((route) => ({
    id: route.id,
    title: route.name,
    summary: route.summary,
    distance: formatDistanceKm(route.distanceM),
    duration: formatDuration(route.estimatedDurationMin),
    labels: route.labels
  }));
