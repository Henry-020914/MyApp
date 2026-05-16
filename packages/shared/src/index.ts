import { z } from "zod";

export const activityModes = ["stroll", "walk", "jog", "run"] as const;
export type ActivityMode = "stroll" | "walk" | "jog" | "run";

export const routePlanLevels = [
  "beginner",
  "normal",
  "experienced",
  "hill_ok"
] as const;

export type RoutePlanLevel = (typeof routePlanLevels)[number];

export const routePlanPreferences = [
  "flat",
  "park",
  "waterside",
  "shade",
  "busy",
  "quiet",
  "hill_training",
  "scenic"
] as const;

export type RoutePlanPreference = (typeof routePlanPreferences)[number];

export type GeoPoint = {
  lat: number;
  lng: number;
  label?: string;
};

export type RoutePlanTarget =
  | {
      type: "distance";
      value: number;
      unit: "m" | "km";
    }
  | {
      type: "time";
      value: number;
      unit: "min";
    };

export type RoutePlanRequest = {
  origin: GeoPoint;
  target: RoutePlanTarget;
  activity: ActivityMode;
  level: RoutePlanLevel;
  preferences: RoutePlanPreference[];
  routeCount: 5;
  locale: "ja-JP";
};

export type RoutePlanResponse = {
  planId: string;
  accessToken: string;
  origin: GeoPoint;
  candidates: RouteCandidate[];
  warnings: string[];
  generatedAt: string;
};

export const routeFeedbackRatings = ["good", "bad", "neutral"] as const;
export type RouteFeedbackRating = (typeof routeFeedbackRatings)[number];

export const routeFeedbackTags = [
  "distance_wrong",
  "too_hilly",
  "blocked",
  "felt_unsafe",
  "nice_view",
  "good_for_beginner",
  "want_again"
] as const;
export type RouteFeedbackTag = (typeof routeFeedbackTags)[number];

export type RouteFeedbackRequest = {
  planId: string;
  accessToken: string;
  routeCandidateId: string;
  rating: RouteFeedbackRating;
  tags: RouteFeedbackTag[];
  comment?: string;
};

export type RouteFeedbackResponse = {
  feedbackId: string;
  receivedAt: string;
};

export type RouteCandidate = {
  id: string;
  name: string;
  description: string;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  distanceM: number;
  estimatedDurationSec: number;
  metrics: RouteMetrics;
  scores: RouteScores;
  labels: string[];
  cautions: string[];
  confidence: "high" | "medium" | "low";
};

export type RouteMetrics = {
  ascentM: number;
  descentM: number;
  maxSlopePercent?: number;
  pavedRatio?: number;
  unpavedRatio?: number;
  parkRatio?: number;
  watersideRatio?: number;
  shadeScore?: number;
  busyRoadScore?: number;
  quietScore?: number;
  scenicScore?: number;
  overlapGroupId?: string;
};

export type RouteScores = {
  total: number;
  levelFit: number;
  flatness: number;
  surfaceComfort: number;
  parkAndWater: number;
  shade: number;
  safetyProxy: number;
  uniqueness: number;
};

export type MockRouteCandidate = RouteCandidate & {
  theme: string;
  activity: ActivityMode;
  summary: string;
  estimatedDurationMin: number;
};

export const geoPointSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    label: z.string().trim().min(1).max(120).optional()
  })
  .strict();

export const routePlanTargetSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("distance"),
      value: z.number().positive().max(100),
      unit: z.enum(["m", "km"])
    })
    .strict(),
  z
    .object({
      type: z.literal("time"),
      value: z.number().positive().max(240),
      unit: z.literal("min")
    })
    .strict()
]);

export const routePlanRequestSchema = z
  .object({
    origin: geoPointSchema,
    target: routePlanTargetSchema,
    activity: z.enum(activityModes),
    level: z.enum(routePlanLevels),
    preferences: z.array(z.enum(routePlanPreferences)).max(8),
    routeCount: z.literal(5),
    locale: z.literal("ja-JP")
  })
  .strict();

export const routeFeedbackRequestSchema = z
  .object({
    planId: z.string().trim().min(1).max(120),
    accessToken: z.string().trim().min(20).max(256),
    routeCandidateId: z.string().trim().min(1).max(120),
    rating: z.enum(routeFeedbackRatings),
    tags: z.array(z.enum(routeFeedbackTags)).max(routeFeedbackTags.length),
    comment: z.string().trim().min(1).max(500).optional()
  })
  .strict();

export const mockRouteCandidates: MockRouteCandidate[] = [
  {
    id: "flat-loop",
    name: "坂少なめの一周",
    theme: "flat",
    description: "坂を控えめにした、はじめての散歩向けルートです。",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.7671, 35.6812],
        [139.7688, 35.6821],
        [139.7702, 35.6807],
        [139.7681, 35.6795],
        [139.7671, 35.6812]
      ]
    },
    distanceM: 3100,
    estimatedDurationSec: 2280,
    estimatedDurationMin: 38,
    activity: "walk",
    summary: "坂を控えめにした、はじめての散歩向けルートです。",
    labels: ["坂少なめ", "初心者向け", "舗装路中心"],
    cautions: ["安全を保証するものではありません"],
    metrics: {
      ascentM: 12,
      descentM: 10,
      maxSlopePercent: 3.2,
      pavedRatio: 0.92,
      unpavedRatio: 0.08,
      parkRatio: 0.18,
      watersideRatio: 0.04,
      shadeScore: 52,
      busyRoadScore: 62,
      quietScore: 58,
      scenicScore: 46,
      overlapGroupId: "central-flat"
    },
    scores: {
      total: 86,
      levelFit: 94,
      flatness: 92,
      surfaceComfort: 90,
      parkAndWater: 48,
      shade: 52,
      safetyProxy: 62,
      uniqueness: 74
    },
    confidence: "medium"
  },
  {
    id: "park-loop",
    name: "公園を通る気分転換",
    theme: "park",
    description: "公園や緑地の近くを多めに通る想定のルートです。",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.7671, 35.6812],
        [139.7648, 35.6825],
        [139.7639, 35.6842],
        [139.7665, 35.684],
        [139.7671, 35.6812]
      ]
    },
    distanceM: 4200,
    estimatedDurationSec: 3000,
    estimatedDurationMin: 50,
    activity: "walk",
    summary: "公園や緑地の近くを多めに通る想定のルートです。",
    labels: ["公園多め", "景色よい", "歩きやすい"],
    cautions: ["夜は周囲の明るさを確認してください"],
    metrics: {
      ascentM: 20,
      descentM: 18,
      maxSlopePercent: 4.1,
      pavedRatio: 0.86,
      unpavedRatio: 0.14,
      parkRatio: 0.34,
      watersideRatio: 0.08,
      shadeScore: 68,
      busyRoadScore: 48,
      quietScore: 70,
      scenicScore: 72,
      overlapGroupId: "central-park"
    },
    scores: {
      total: 84,
      levelFit: 88,
      flatness: 78,
      surfaceComfort: 83,
      parkAndWater: 76,
      shade: 68,
      safetyProxy: 54,
      uniqueness: 80
    },
    confidence: "medium"
  },
  {
    id: "waterside-loop",
    name: "水辺を感じる一周",
    theme: "waterside",
    description: "川沿いや運河沿いを含む想定の軽いジョギング向けルートです。",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.7671, 35.6812],
        [139.7695, 35.6828],
        [139.7722, 35.682],
        [139.771, 35.6798],
        [139.7671, 35.6812]
      ]
    },
    distanceM: 5000,
    estimatedDurationSec: 2520,
    estimatedDurationMin: 42,
    activity: "jog",
    summary: "川沿いや運河沿いを含む想定の軽いジョギング向けルートです。",
    labels: ["水辺あり", "軽く走る", "気分転換"],
    cautions: ["雨上がりは足元を確認してください"],
    metrics: {
      ascentM: 18,
      descentM: 16,
      maxSlopePercent: 3.8,
      pavedRatio: 0.88,
      unpavedRatio: 0.12,
      parkRatio: 0.22,
      watersideRatio: 0.31,
      shadeScore: 44,
      busyRoadScore: 56,
      quietScore: 54,
      scenicScore: 78,
      overlapGroupId: "central-water"
    },
    scores: {
      total: 82,
      levelFit: 80,
      flatness: 82,
      surfaceComfort: 85,
      parkAndWater: 84,
      shade: 44,
      safetyProxy: 56,
      uniqueness: 82
    },
    confidence: "medium"
  },
  {
    id: "busy-loop",
    name: "人通り推定多め",
    theme: "busy",
    description: "駅周辺や大きめの通りをほどよく含む想定のルートです。",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.7671, 35.6812],
        [139.7682, 35.6802],
        [139.7694, 35.6789],
        [139.7669, 35.6785],
        [139.7671, 35.6812]
      ]
    },
    distanceM: 2800,
    estimatedDurationSec: 2040,
    estimatedDurationMin: 34,
    activity: "stroll",
    summary: "駅周辺や大きめの通りをほどよく含む想定のルートです。",
    labels: ["人通り推定多め", "短め", "街なか"],
    cautions: ["交通量の多い場所では横断に注意してください"],
    metrics: {
      ascentM: 10,
      descentM: 9,
      maxSlopePercent: 2.7,
      pavedRatio: 0.96,
      unpavedRatio: 0.04,
      parkRatio: 0.08,
      watersideRatio: 0.02,
      shadeScore: 40,
      busyRoadScore: 86,
      quietScore: 36,
      scenicScore: 38,
      overlapGroupId: "central-busy"
    },
    scores: {
      total: 78,
      levelFit: 90,
      flatness: 94,
      surfaceComfort: 92,
      parkAndWater: 22,
      shade: 40,
      safetyProxy: 78,
      uniqueness: 68
    },
    confidence: "low"
  },
  {
    id: "gentle-run-loop",
    name: "軽く走る朝ルート",
    theme: "light-run",
    description: "走り慣れてきた人が軽く走る想定の、少し長めのルートです。",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.7671, 35.6812],
        [139.7652, 35.6796],
        [139.766, 35.6772],
        [139.7697, 35.6775],
        [139.7671, 35.6812]
      ]
    },
    distanceM: 6200,
    estimatedDurationSec: 2760,
    estimatedDurationMin: 46,
    activity: "run",
    summary: "走り慣れてきた人が軽く走る想定の、少し長めのルートです。",
    labels: ["軽く走る", "少し長め", "舗装路中心"],
    cautions: ["体調に合わせて無理せず調整してください"],
    metrics: {
      ascentM: 32,
      descentM: 30,
      maxSlopePercent: 5.5,
      pavedRatio: 0.9,
      unpavedRatio: 0.1,
      parkRatio: 0.16,
      watersideRatio: 0.12,
      shadeScore: 50,
      busyRoadScore: 52,
      quietScore: 60,
      scenicScore: 58,
      overlapGroupId: "central-run"
    },
    scores: {
      total: 80,
      levelFit: 72,
      flatness: 68,
      surfaceComfort: 88,
      parkAndWater: 56,
      shade: 50,
      safetyProxy: 52,
      uniqueness: 84
    },
    confidence: "medium"
  }
];

export const mockRoutePlanCandidates: RouteCandidate[] = mockRouteCandidates.map(
  (route) => ({
    id: route.id,
    name: route.name,
    description: route.description,
    geometry: route.geometry,
    distanceM: route.distanceM,
    estimatedDurationSec: route.estimatedDurationSec,
    metrics: route.metrics,
    scores: route.scores,
    labels: route.labels,
    cautions: route.cautions,
    confidence: route.confidence
  })
);

export const buildMockRoutePlanResponse = (
  request: RoutePlanRequest,
  generatedAt = new Date()
): RoutePlanResponse => ({
  planId: "mock-route-plan",
  accessToken: "mock-route-access-token",
  origin: request.origin,
  candidates: mockRoutePlanCandidates.slice(0, request.routeCount),
  warnings: [
    "Phase 2では実ルート生成をまだ行わず、検証用のモック5件を返します。",
    "安全や通行可否を保証するものではありません。現地状況を確認してください。"
  ],
  generatedAt: generatedAt.toISOString()
});

export const formatDistanceKm = (distanceM: number) =>
  `${(distanceM / 1000).toFixed(1)} km`;

export const formatDuration = (durationMin: number) => `${durationMin} min`;
