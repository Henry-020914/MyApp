import type { MockRouteCandidate } from "@route5/shared";
import { formatDistanceKm } from "@route5/shared";

export type RouteCandidateCardDetails = {
  distance: string;
  duration: string;
  slope: string;
  surface: string;
  features: string;
  levelFit: string;
};

const formatPercent = (value = 0) => `${Math.round(value * 100)}%`;

export const getSlopeLabel = (route: MockRouteCandidate) => {
  const maxSlopePercent = route.metrics.maxSlopePercent ?? 0;

  if (route.metrics.ascentM <= 15 && maxSlopePercent <= 3.5) {
    return "少なめ";
  }

  if (route.metrics.ascentM <= 30 && maxSlopePercent <= 5) {
    return "ふつう";
  }

  return "多め";
};

export const getSurfaceLabel = (route: MockRouteCandidate) => {
  const pavedRatio = route.metrics.pavedRatio ?? 0;

  if (pavedRatio >= 0.9) {
    return "舗装路中心";
  }

  if (pavedRatio >= 0.75) {
    return "舗装路多め";
  }

  return "一部未舗装";
};

export const getLevelFitLabel = (route: MockRouteCandidate) => {
  if (route.scores.levelFit >= 90) {
    return "初心者向け";
  }

  if (route.scores.levelFit >= 75) {
    return "普通";
  }

  return "慣れている人向け";
};

export const toRouteCandidateCardDetails = (
  route: MockRouteCandidate
): RouteCandidateCardDetails => ({
  distance: formatDistanceKm(route.distanceM),
  duration: `約${route.estimatedDurationMin}分`,
  slope: getSlopeLabel(route),
  surface: getSurfaceLabel(route),
  features: `公園 ${formatPercent(route.metrics.parkRatio)} / 水辺 ${formatPercent(
    route.metrics.watersideRatio
  )}`,
  levelFit: getLevelFitLabel(route)
});
