import type {
  ActivityMode,
  GeoPoint,
  RouteCandidate,
  RouteMetrics,
  RoutePlanLevel,
  RoutePlanPreference,
  RoutePlanRequest,
  RoutePlanResponse,
  RouteScores
} from "@route5/shared";
import { randomBytes, randomUUID } from "node:crypto";
import { RouteExplanationService } from "../explanation";

type RouteGenerationTheme = RoutePlanPreference;

export type GeneratedIntermediatePoint = {
  id: string;
  bearingDeg: number;
  radiusM: number;
  point: GeoPoint;
};

export type RouteGenerationScore = {
  distanceFit: number;
  preferenceFit: number;
  levelFit: number;
  diversity: number;
  total: number;
};

export type RouteGenerationCandidate = {
  id: string;
  theme: RouteGenerationTheme;
  targetDistanceM: number;
  estimatedDistanceM: number;
  distanceDeltaRatio: number;
  firstPoint: GeneratedIntermediatePoint;
  secondPoint: GeneratedIntermediatePoint;
  geometry: RouteCandidate["geometry"];
  score: RouteGenerationScore;
};

export type RouteGenerationPlan = {
  targetDistanceM: number;
  searchRadiusM: number;
  intermediatePoints: GeneratedIntermediatePoint[];
  candidates: RouteGenerationCandidate[];
  warnings: string[];
};

export type RoutePlanResponseBuilder = {
  buildRoutePlanResponse(
    request: RoutePlanRequest,
    generatedAt?: Date
  ): RoutePlanResponse | Promise<RoutePlanResponse>;
};

export class RouteGenerationProviderUnavailableError extends Error {
  constructor(message = "外部ルーティングAPIへの接続に失敗しました。") {
    super(message);
    this.name = "RouteGenerationProviderUnavailableError";
  }
}

type ScoreCandidateInput = {
  theme: RouteGenerationTheme;
  estimatedDistanceM: number;
  targetDistanceM: number;
  bearingSeparationDeg: number;
};

const earthRadiusM = 6_371_000;

const activityPaceKmH: Record<ActivityMode, number> = {
  stroll: 4,
  walk: 5,
  jog: 7.5,
  run: 9
};

const levelDistanceFactor: Record<RoutePlanLevel, number> = {
  beginner: 0.9,
  normal: 1,
  experienced: 1.08,
  hill_ok: 1
};

const baseBearingsDeg = [0, 45, 90, 135, 180, 225, 270, 315] as const;

const routeThemes: RouteGenerationTheme[] = [
  "flat",
  "park",
  "waterside",
  "shade",
  "busy",
  "quiet",
  "hill_training",
  "scenic"
];

const routeExplanationService = new RouteExplanationService();

const searchRadiusBands = [
  { targetDistanceM: 1_000, radiusM: 300 },
  { targetDistanceM: 3_000, radiusM: 750 },
  { targetDistanceM: 5_000, radiusM: 1_250 },
  { targetDistanceM: 10_000, radiusM: 2_500 }
] as const;

const themeText: Record<
  RouteGenerationTheme,
  { name: string; description: string; labels: string[] }
> = {
  flat: {
    name: "坂少なめの仮ループ",
    description: "坂を控えめにする想定で作った、外部API連携前の仮ルートです。",
    labels: ["坂少なめ", "初心者向け", "仮候補"]
  },
  park: {
    name: "公園多めの仮ループ",
    description: "公園や緑地に寄せる想定で作った、外部API連携前の仮ルートです。",
    labels: ["公園多め", "気分転換", "仮候補"]
  },
  waterside: {
    name: "水辺寄りの仮ループ",
    description: "水辺に近い道を優先する想定で作った、外部API連携前の仮ルートです。",
    labels: ["水辺あり", "景色重視", "仮候補"]
  },
  shade: {
    name: "日陰推定の仮ループ",
    description: "日陰がありそうな道を優先する想定で作った、外部API連携前の仮ルートです。",
    labels: ["日陰推定", "歩きやすさ目安", "仮候補"]
  },
  busy: {
    name: "人通り推定多めの仮ループ",
    description: "駅周辺や大きめの道を含める想定で作った、外部API連携前の仮ルートです。",
    labels: ["人通り推定多め", "街なか", "仮候補"]
  },
  quiet: {
    name: "静かな道寄りの仮ループ",
    description: "幹線道路を避ける想定で作った、外部API連携前の仮ルートです。",
    labels: ["静かな道", "落ち着いた道", "仮候補"]
  },
  hill_training: {
    name: "坂トレ想定の仮ループ",
    description: "上り下りを含める想定で作った、外部API連携前の仮ルートです。",
    labels: ["坂トレ", "経験者向け", "仮候補"]
  },
  scenic: {
    name: "景色重視の仮ループ",
    description: "景色要素が多い道を優先する想定で作った、外部API連携前の仮ルートです。",
    labels: ["景色重視", "気分転換", "仮候補"]
  }
};

export class RouteGenerationService {
  calculateTargetDistanceM(request: RoutePlanRequest): number {
    if (request.target.type === "distance") {
      const meters =
        request.target.unit === "km"
          ? request.target.value * 1_000
          : request.target.value;

      return Math.round(meters);
    }

    const paceKmH =
      activityPaceKmH[request.activity] * levelDistanceFactor[request.level];
    const hours = request.target.value / 60;

    return Math.round(paceKmH * hours * 1_000);
  }

  calculateSearchRadiusM(targetDistanceM: number): number {
    if (targetDistanceM <= searchRadiusBands[0].targetDistanceM) {
      return searchRadiusBands[0].radiusM;
    }

    for (let index = 1; index < searchRadiusBands.length; index += 1) {
      const previous = searchRadiusBands[index - 1]!;
      const current = searchRadiusBands[index]!;

      if (targetDistanceM <= current.targetDistanceM) {
        const progress =
          (targetDistanceM - previous.targetDistanceM) /
          (current.targetDistanceM - previous.targetDistanceM);

        return Math.round(
          previous.radiusM + (current.radiusM - previous.radiusM) * progress
        );
      }
    }

    return searchRadiusBands[searchRadiusBands.length - 1]!.radiusM;
  }

  generateIntermediatePoints(
    origin: GeoPoint,
    targetDistanceM: number,
    seed = "route5"
  ): GeneratedIntermediatePoint[] {
    const radiusM = this.calculateSearchRadiusM(targetDistanceM);
    const seedValue = hashString(seed);

    return baseBearingsDeg.map((bearingDeg, index) => {
      const bearingWithJitter = normalizeBearing(
        bearingDeg + deterministicJitter(seedValue, index)
      );

      return {
        id: `midpoint-${index + 1}`,
        bearingDeg: bearingWithJitter,
        radiusM,
        point: destinationPoint(origin, bearingWithJitter, radiusM)
      };
    });
  }

  scoreCandidate(
    input: ScoreCandidateInput,
    request: RoutePlanRequest
  ): RouteGenerationScore {
    const distanceDeltaRatio =
      Math.abs(input.estimatedDistanceM - input.targetDistanceM) /
      input.targetDistanceM;
    const distanceFit = clampScore(100 - distanceDeltaRatio * 220);
    const preferenceFit = getPreferenceFit(input.theme, request.preferences);
    const levelFit = getLevelFit(input.theme, request.level);
    const diversity = getDiversityScore(input.bearingSeparationDeg);
    const total = clampScore(
      distanceFit * 0.45 +
        preferenceFit * 0.25 +
        levelFit * 0.15 +
        diversity * 0.15
    );

    return {
      distanceFit,
      preferenceFit,
      levelFit,
      diversity,
      total
    };
  }

  buildPlan(request: RoutePlanRequest): RouteGenerationPlan {
    const targetDistanceM = this.calculateTargetDistanceM(request);
    const searchRadiusM = this.calculateSearchRadiusM(targetDistanceM);
    const intermediatePoints = this.generateIntermediatePoints(
      request.origin,
      targetDistanceM,
      createRequestSeed(request)
    );
    const candidates = this.generateCandidates(
      request,
      targetDistanceM,
      intermediatePoints
    )
      .sort((left, right) => right.score.total - left.score.total)
      .slice(0, request.routeCount);

    return {
      targetDistanceM,
      searchRadiusM,
      intermediatePoints,
      candidates,
      warnings: [
        "Phase 6では外部ルーティングAPIをまだ呼ばず、仮の中間地点を直線で結んだ骨格候補です。",
        "安全や通行可否を保証するものではありません。現地状況を確認してください。"
      ]
    };
  }

  buildRoutePlanResponse(
    request: RoutePlanRequest,
    generatedAt = new Date()
  ): RoutePlanResponse {
    const plan = this.buildPlan(request);

    return {
      planId: randomUUID(),
      accessToken: randomBytes(32).toString("base64url"),
      origin: request.origin,
      candidates: plan.candidates.map((candidate) =>
        toRouteCandidate(candidate, request)
      ),
      warnings: plan.warnings,
      generatedAt: generatedAt.toISOString()
    };
  }

  private generateCandidates(
    request: RoutePlanRequest,
    targetDistanceM: number,
    intermediatePoints: GeneratedIntermediatePoint[]
  ): RouteGenerationCandidate[] {
    return routeThemes.map((theme, index) => {
      const firstPoint = intermediatePoints[index % intermediatePoints.length]!;
      const secondPoint =
        intermediatePoints[(index + 2) % intermediatePoints.length]!;
      const geometry = {
        type: "LineString" as const,
        coordinates: [
          toCoordinate(request.origin),
          toCoordinate(firstPoint.point),
          toCoordinate(secondPoint.point),
          toCoordinate(request.origin)
        ]
      };
      const estimatedDistanceM = calculateLineDistanceM(geometry.coordinates);
      const bearingSeparationDeg = getBearingSeparationDeg(
        firstPoint.bearingDeg,
        secondPoint.bearingDeg
      );
      const score = this.scoreCandidate(
        {
          theme,
          estimatedDistanceM,
          targetDistanceM,
          bearingSeparationDeg
        },
        request
      );

      return {
        id: `${theme}-skeleton-${index + 1}`,
        theme,
        targetDistanceM,
        estimatedDistanceM,
        distanceDeltaRatio:
          Math.abs(estimatedDistanceM - targetDistanceM) / targetDistanceM,
        firstPoint,
        secondPoint,
        geometry,
        score
      };
    });
  }
}

const toRouteCandidate = (
  candidate: RouteGenerationCandidate,
  request: RoutePlanRequest
): RouteCandidate => {
  const text = themeText[candidate.theme];
  const metrics = buildMetrics(candidate.theme);
  const scores = buildScores(candidate.theme, candidate.score);
  const explanation = routeExplanationService.explainRoute({
    scores,
    metrics,
    confidence: "low"
  });

  return {
    id: candidate.id,
    name: text.name,
    description: explanation.description,
    geometry: candidate.geometry,
    distanceM: Math.round(candidate.estimatedDistanceM),
    estimatedDurationSec: estimateDurationSec(
      candidate.estimatedDistanceM,
      request.activity,
      request.level
    ),
    metrics,
    scores,
    labels: explanation.labels,
    cautions: explanation.cautions,
    confidence: "low"
  };
};

const buildMetrics = (theme: RouteGenerationTheme): RouteMetrics => {
  const base: Record<RouteGenerationTheme, RouteMetrics> = {
    flat: {
      ascentM: 12,
      descentM: 12,
      maxSlopePercent: 3,
      pavedRatio: 0.92,
      unpavedRatio: 0.08,
      parkRatio: 0.16,
      watersideRatio: 0.04,
      shadeScore: 52,
      busyRoadScore: 58,
      quietScore: 60,
      scenicScore: 48
    },
    park: {
      ascentM: 20,
      descentM: 18,
      maxSlopePercent: 4,
      pavedRatio: 0.86,
      unpavedRatio: 0.14,
      parkRatio: 0.38,
      watersideRatio: 0.08,
      shadeScore: 68,
      busyRoadScore: 48,
      quietScore: 68,
      scenicScore: 72
    },
    waterside: {
      ascentM: 18,
      descentM: 18,
      maxSlopePercent: 3.8,
      pavedRatio: 0.88,
      unpavedRatio: 0.12,
      parkRatio: 0.22,
      watersideRatio: 0.34,
      shadeScore: 44,
      busyRoadScore: 54,
      quietScore: 56,
      scenicScore: 78
    },
    shade: {
      ascentM: 22,
      descentM: 20,
      maxSlopePercent: 4.3,
      pavedRatio: 0.84,
      unpavedRatio: 0.16,
      parkRatio: 0.28,
      watersideRatio: 0.12,
      shadeScore: 78,
      busyRoadScore: 50,
      quietScore: 62,
      scenicScore: 66
    },
    busy: {
      ascentM: 10,
      descentM: 10,
      maxSlopePercent: 2.8,
      pavedRatio: 0.96,
      unpavedRatio: 0.04,
      parkRatio: 0.08,
      watersideRatio: 0.02,
      shadeScore: 40,
      busyRoadScore: 86,
      quietScore: 34,
      scenicScore: 38
    },
    quiet: {
      ascentM: 18,
      descentM: 17,
      maxSlopePercent: 3.8,
      pavedRatio: 0.88,
      unpavedRatio: 0.12,
      parkRatio: 0.2,
      watersideRatio: 0.06,
      shadeScore: 58,
      busyRoadScore: 34,
      quietScore: 82,
      scenicScore: 56
    },
    hill_training: {
      ascentM: 72,
      descentM: 68,
      maxSlopePercent: 8.5,
      pavedRatio: 0.82,
      unpavedRatio: 0.18,
      parkRatio: 0.14,
      watersideRatio: 0.04,
      shadeScore: 48,
      busyRoadScore: 46,
      quietScore: 60,
      scenicScore: 62
    },
    scenic: {
      ascentM: 28,
      descentM: 25,
      maxSlopePercent: 5,
      pavedRatio: 0.86,
      unpavedRatio: 0.14,
      parkRatio: 0.3,
      watersideRatio: 0.22,
      shadeScore: 62,
      busyRoadScore: 48,
      quietScore: 66,
      scenicScore: 86
    }
  };

  return {
    ...base[theme],
    overlapGroupId: `skeleton-${theme}`
  };
};

const buildScores = (
  theme: RouteGenerationTheme,
  score: RouteGenerationScore
): RouteScores => {
  const metrics = buildMetrics(theme);

  return {
    total: score.total,
    levelFit: score.levelFit,
    flatness: clampScore(100 - metrics.ascentM),
    surfaceComfort: clampScore((metrics.pavedRatio ?? 0.8) * 100),
    parkAndWater: clampScore(
      ((metrics.parkRatio ?? 0) + (metrics.watersideRatio ?? 0)) * 150
    ),
    shade: metrics.shadeScore ?? 50,
    safetyProxy: metrics.busyRoadScore ?? 50,
    uniqueness: score.diversity
  };
};

const estimateDurationSec = (
  distanceM: number,
  activity: ActivityMode,
  level: RoutePlanLevel
) => {
  const metersPerSecond =
    (activityPaceKmH[activity] * levelDistanceFactor[level] * 1_000) / 3_600;

  return Math.round(distanceM / metersPerSecond);
};

const getPreferenceFit = (
  theme: RouteGenerationTheme,
  preferences: RoutePlanPreference[]
) => {
  if (preferences.includes(theme)) {
    return 100;
  }

  if (theme === "scenic" && (preferences.includes("park") || preferences.includes("waterside"))) {
    return 88;
  }

  if (theme === "shade" && preferences.includes("park")) {
    return 82;
  }

  return 68;
};

const getLevelFit = (theme: RouteGenerationTheme, level: RoutePlanLevel) => {
  if (theme === "hill_training") {
    return level === "hill_ok" || level === "experienced" ? 96 : 52;
  }

  if (theme === "flat" && level === "beginner") {
    return 96;
  }

  if (level === "beginner") {
    return 84;
  }

  return 88;
};

const getDiversityScore = (bearingSeparationDeg: number) => {
  const distanceFromRightAngle = Math.abs(90 - bearingSeparationDeg);

  return clampScore(100 - distanceFromRightAngle * 0.8);
};

const getBearingSeparationDeg = (firstBearingDeg: number, secondBearingDeg: number) => {
  const difference = Math.abs(firstBearingDeg - secondBearingDeg) % 360;

  return difference > 180 ? 360 - difference : difference;
};

const destinationPoint = (
  origin: GeoPoint,
  bearingDeg: number,
  distanceM: number
): GeoPoint => {
  const angularDistance = distanceM / earthRadiusM;
  const bearingRad = toRadians(bearingDeg);
  const lat1 = toRadians(origin.lat);
  const lng1 = toRadians(origin.lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: roundCoordinate(toDegrees(lat2)),
    lng: roundCoordinate(toDegrees(lng2))
  };
};

const calculateLineDistanceM = (coordinates: [number, number][]) =>
  coordinates.reduce((total, coordinate, index) => {
    const next = coordinates[index + 1];

    if (!next) {
      return total;
    }

    return total + haversineDistanceM(toGeoPoint(coordinate), toGeoPoint(next));
  }, 0);

const haversineDistanceM = (from: GeoPoint, to: GeoPoint) => {
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toCoordinate = (point: GeoPoint): [number, number] => [point.lng, point.lat];

const toGeoPoint = (coordinate: [number, number]): GeoPoint => ({
  lng: coordinate[0],
  lat: coordinate[1]
});

const createRequestSeed = (request: RoutePlanRequest) =>
  [
    request.origin.lat,
    request.origin.lng,
    request.origin.label ?? "",
    request.target.type,
    request.target.value,
    request.activity,
    request.level,
    request.preferences.join("-")
  ].join("|");

const deterministicJitter = (seedValue: number, index: number) => {
  const value = Math.sin(seedValue + index * 97.13) * 10_000;

  return (value - Math.floor(value) - 0.5) * 16;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const clampScore = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

const normalizeBearing = (bearingDeg: number) => (bearingDeg + 360) % 360;

const roundCoordinate = (value: number) => Number(value.toFixed(6));

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const toDegrees = (radians: number) => (radians * 180) / Math.PI;
