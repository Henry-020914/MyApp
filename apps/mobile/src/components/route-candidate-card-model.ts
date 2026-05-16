import type { RouteCandidate } from "@route5/shared";
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

const formatDurationFromSeconds = (durationSec: number) =>
  `約${Math.round(durationSec / 60)}分`;

export const getSlopeLabel = (route: RouteCandidate) => {
  const maxSlopePercent = route.metrics.maxSlopePercent ?? 0;

  if (route.metrics.ascentM <= 15 && maxSlopePercent <= 3.5) {
    return "少なめ";
  }

  if (route.metrics.ascentM <= 30 && maxSlopePercent <= 5) {
    return "ふつう";
  }

  return "多め";
};

export const getSurfaceLabel = (route: RouteCandidate) => {
  const pavedRatio = route.metrics.pavedRatio ?? 0;

  if (pavedRatio >= 0.9) {
    return "舗装路中心";
  }

  if (pavedRatio >= 0.75) {
    return "舗装路多め";
  }

  return "一部未舗装";
};

export const getLevelFitLabel = (route: RouteCandidate) => {
  if (route.scores.levelFit >= 90) {
    return "初心者向け";
  }

  if (route.scores.levelFit >= 75) {
    return "普通";
  }

  return "慣れている人向け";
};

export const toRouteCandidateCardDetails = (
  route: RouteCandidate
): RouteCandidateCardDetails => ({
  distance: formatDistanceKm(route.distanceM),
  duration: formatDurationFromSeconds(route.estimatedDurationSec),
  slope: getSlopeLabel(route),
  surface: getSurfaceLabel(route),
  features: `公園 ${formatPercent(route.metrics.parkRatio)} / 水辺 ${formatPercent(
    route.metrics.watersideRatio
  )}`,
  levelFit: getLevelFitLabel(route)
});
