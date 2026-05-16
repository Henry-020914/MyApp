import type { MockRouteCandidate } from "@route5/shared";
import { formatDistanceKm, formatDuration } from "@route5/shared";
import { toRouteCandidateCardDetails } from "../../components/route-candidate-card-model";

export type RouteListItem = {
  id: string;
  title: string;
  summary: string;
  distance: string;
  duration: string;
  slope: string;
  surface: string;
  features: string;
  levelFit: string;
  labels: string[];
  cautions: string[];
};

export const toRouteListItems = (
  routes: MockRouteCandidate[]
): RouteListItem[] =>
  routes.map((route) => {
    const details = toRouteCandidateCardDetails(route);

    return {
      id: route.id,
      title: route.name,
      summary: route.summary,
      distance: formatDistanceKm(route.distanceM),
      duration: formatDuration(route.estimatedDurationMin),
      slope: details.slope,
      surface: details.surface,
      features: details.features,
      levelFit: details.levelFit,
      labels: route.labels,
      cautions: route.cautions
    };
  });
