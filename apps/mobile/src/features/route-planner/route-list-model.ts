import type { RouteCandidate } from "@route5/shared";
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
  routes: RouteCandidate[]
): RouteListItem[] =>
  routes.map((route) => {
    const details = toRouteCandidateCardDetails(route);

    return {
      id: route.id,
      title: route.name,
      summary: route.description,
      distance: details.distance,
      duration: details.duration,
      slope: details.slope,
      surface: details.surface,
      features: details.features,
      levelFit: details.levelFit,
      labels: route.labels,
      cautions: route.cautions
    };
  });
