import type {
  RouteMetrics,
  RoutePlanLevel,
  RoutePlanPreference,
  RouteScores
} from "@route5/shared";

export type RouteScoringInput = {
  distanceM: number;
  targetDistanceM: number;
  metrics: RouteMetrics;
  level: RoutePlanLevel;
  preferences: RoutePlanPreference[];
  overlapRatio?: number;
};

export type RouteScoringBreakdown = {
  distanceFit: number;
  levelFit: number;
  slope: number;
  surface: number;
  parkAndWater: number;
  shade: number;
  safetyProxy: number;
  quietness: number;
  uniqueness: number;
  total: number;
};

export type RouteScoringResult = {
  scores: RouteScores;
  breakdown: RouteScoringBreakdown;
};

const weights = {
  distanceFit: 0.2,
  levelFit: 0.15,
  slope: 0.15,
  surface: 0.15,
  parkAndWater: 0.12,
  shade: 0.07,
  safetyProxy: 0.06,
  quietness: 0.04,
  uniqueness: 0.06
} as const;

export class RouteScoringService {
  scoreRoute(input: RouteScoringInput): RouteScoringResult {
    const distanceFit = this.scoreDistanceFit(
      input.distanceM,
      input.targetDistanceM
    );
    const slope = this.scoreSlope(input.metrics, input.level, input.preferences);
    const surface = this.scoreSurface(input.metrics, input.level);
    const parkAndWater = this.scoreParkAndWater(
      input.metrics,
      input.preferences
    );
    const shade = this.scoreShade(input.metrics, input.preferences);
    const safetyProxy = this.scoreSafetyProxy(input.metrics, input.preferences);
    const quietness = this.scoreQuietness(input.metrics, input.preferences);
    const uniqueness = this.scoreUniqueness(input.overlapRatio ?? 0);
    const levelFit = this.scoreLevelFit({
      metrics: input.metrics,
      level: input.level,
      preferences: input.preferences,
      slope,
      surface
    });
    const total = roundScore(
      distanceFit * weights.distanceFit +
        levelFit * weights.levelFit +
        slope * weights.slope +
        surface * weights.surface +
        parkAndWater * weights.parkAndWater +
        shade * weights.shade +
        safetyProxy * weights.safetyProxy +
        quietness * weights.quietness +
        uniqueness * weights.uniqueness
    );

    return {
      scores: {
        total,
        levelFit,
        flatness: slope,
        surfaceComfort: surface,
        parkAndWater,
        shade,
        safetyProxy,
        uniqueness
      },
      breakdown: {
        distanceFit,
        levelFit,
        slope,
        surface,
        parkAndWater,
        shade,
        safetyProxy,
        quietness,
        uniqueness,
        total
      }
    };
  }

  scoreDistanceFit(distanceM: number, targetDistanceM: number) {
    if (targetDistanceM <= 0) {
      return 0;
    }

    const deltaRatio = Math.abs(distanceM - targetDistanceM) / targetDistanceM;

    if (deltaRatio <= 0.1) {
      return roundScore(100 - deltaRatio * 120);
    }

    if (deltaRatio <= 0.2) {
      return roundScore(88 - (deltaRatio - 0.1) * 380);
    }

    return roundScore(50 - (deltaRatio - 0.2) * 170);
  }

  scoreSlope(
    metrics: RouteMetrics,
    level: RoutePlanLevel,
    preferences: RoutePlanPreference[]
  ) {
    const ascentPenalty = (metrics.ascentM / 10) * (level === "beginner" ? 2.2 : 1);
    const slopePenalty =
      (metrics.maxSlopePercent ?? 0) * (level === "beginner" ? 5 : 3);
    const hillTrainingBonus =
      preferences.includes("hill_training") || level === "hill_ok"
        ? Math.min(24, metrics.ascentM / 4)
        : 0;

    return roundScore(100 - ascentPenalty - slopePenalty + hillTrainingBonus);
  }

  scoreSurface(metrics: RouteMetrics, level: RoutePlanLevel) {
    const pavedRatio = metrics.pavedRatio ?? 0.75;
    const unpavedRatio = metrics.unpavedRatio ?? 1 - pavedRatio;
    const beginnerPenalty = level === "beginner" ? unpavedRatio * 45 : 0;

    return roundScore(pavedRatio * 100 - unpavedRatio * 18 - beginnerPenalty);
  }

  scoreParkAndWater(
    metrics: RouteMetrics,
    preferences: RoutePlanPreference[]
  ) {
    const parkScore = (metrics.parkRatio ?? 0) * 100;
    const watersideScore = (metrics.watersideRatio ?? 0) * 100;
    const preferenceBonus =
      (preferences.includes("park") ? parkScore * 0.35 : 0) +
      (preferences.includes("waterside") ? watersideScore * 0.35 : 0) +
      (preferences.includes("scenic") ? (parkScore + watersideScore) * 0.18 : 0);

    return roundScore(parkScore * 0.65 + watersideScore * 0.65 + preferenceBonus);
  }

  scoreShade(metrics: RouteMetrics, preferences: RoutePlanPreference[]) {
    const base = metrics.shadeScore ?? 50;

    return roundScore(base + (preferences.includes("shade") ? 10 : 0));
  }

  scoreSafetyProxy(
    metrics: RouteMetrics,
    preferences: RoutePlanPreference[]
  ) {
    const busyRoadScore = metrics.busyRoadScore ?? 50;

    if (preferences.includes("busy")) {
      return roundScore(busyRoadScore + 10);
    }

    return roundScore(busyRoadScore);
  }

  scoreQuietness(metrics: RouteMetrics, preferences: RoutePlanPreference[]) {
    const quietScore = metrics.quietScore ?? 50;

    return roundScore(quietScore + (preferences.includes("quiet") ? 12 : 0));
  }

  scoreUniqueness(overlapRatio: number) {
    return roundScore(100 - clampRatio(overlapRatio) * 100);
  }

  private scoreLevelFit({
    metrics,
    level,
    preferences,
    slope,
    surface
  }: {
    metrics: RouteMetrics;
    level: RoutePlanLevel;
    preferences: RoutePlanPreference[];
    slope: number;
    surface: number;
  }) {
    if (level === "beginner") {
      const unpavedRatio = metrics.unpavedRatio ?? 0;
      const beginnerPenalty =
        Math.max(0, metrics.ascentM - 25) * 0.8 +
        (metrics.maxSlopePercent ?? 0) * 3 +
        unpavedRatio * 55;

      return roundScore((slope + surface) / 2 - beginnerPenalty);
    }

    if (preferences.includes("hill_training") || level === "hill_ok") {
      const ascentBonus = Math.min(26, metrics.ascentM / 3);

      return roundScore((slope + surface) / 2 + ascentBonus);
    }

    return roundScore((slope + surface) / 2);
  }
}

const roundScore = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

const clampRatio = (value: number) => Math.max(0, Math.min(1, value));
