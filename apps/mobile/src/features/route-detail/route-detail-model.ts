import type { RouteCandidate } from "@route5/shared";
import { toRouteCandidateCardDetails } from "../../components/route-candidate-card-model";

export type RouteDetailDisplay = {
  title: string;
  description: string;
  distance: string;
  duration: string;
  slope: string;
  surface: string;
  ascent: string;
  descent: string;
  maxSlope: string;
  featureScores: string[];
  labels: string[];
  cautions: string[];
};

export const toRouteDetailDisplay = (
  route: RouteCandidate
): RouteDetailDisplay => {
  const details = toRouteCandidateCardDetails(route);

  return {
    title: route.name,
    description: route.description,
    distance: details.distance,
    duration: details.duration,
    slope: details.slope,
    surface: details.surface,
    ascent: `${route.metrics.ascentM}m`,
    descent: `${route.metrics.descentM}m`,
    maxSlope:
      route.metrics.maxSlopePercent === undefined
        ? "推定なし"
        : `${route.metrics.maxSlopePercent}%`,
    featureScores: [
      `公園・水辺 ${route.scores.parkAndWater}`,
      `日陰推定 ${route.scores.shade}`,
      `人通り推定 ${route.scores.safetyProxy}`,
      `重複の少なさ ${route.scores.uniqueness}`
    ],
    labels: route.labels,
    cautions: route.cautions
  };
};
