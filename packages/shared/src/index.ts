export type ActivityMode = "stroll" | "walk" | "jog" | "run";

export type MockRouteCandidate = {
  id: string;
  name: string;
  theme: string;
  distanceM: number;
  estimatedDurationMin: number;
  activity: ActivityMode;
  summary: string;
  labels: string[];
  cautions: string[];
  metrics: {
    ascentM: number;
    pavedRatio: number;
    parkRatio: number;
    watersideRatio: number;
  };
};

export const mockRouteCandidates: MockRouteCandidate[] = [
  {
    id: "flat-loop",
    name: "坂少なめの一周",
    theme: "flat",
    distanceM: 3100,
    estimatedDurationMin: 38,
    activity: "walk",
    summary: "坂を控えめにした、はじめての散歩向けルートです。",
    labels: ["坂少なめ", "初心者向け", "舗装路中心"],
    cautions: ["安全を保証するものではありません"],
    metrics: {
      ascentM: 12,
      pavedRatio: 0.92,
      parkRatio: 0.18,
      watersideRatio: 0.04
    }
  },
  {
    id: "park-loop",
    name: "公園を通る気分転換",
    theme: "park",
    distanceM: 4200,
    estimatedDurationMin: 50,
    activity: "walk",
    summary: "公園や緑地の近くを多めに通る想定のルートです。",
    labels: ["公園多め", "景色よい", "歩きやすい"],
    cautions: ["夜は周囲の明るさを確認してください"],
    metrics: {
      ascentM: 20,
      pavedRatio: 0.86,
      parkRatio: 0.34,
      watersideRatio: 0.08
    }
  },
  {
    id: "waterside-loop",
    name: "水辺を感じる一周",
    theme: "waterside",
    distanceM: 5000,
    estimatedDurationMin: 42,
    activity: "jog",
    summary: "川沿いや運河沿いを含む想定の軽いジョギング向けルートです。",
    labels: ["水辺あり", "軽く走る", "気分転換"],
    cautions: ["雨上がりは足元を確認してください"],
    metrics: {
      ascentM: 18,
      pavedRatio: 0.88,
      parkRatio: 0.22,
      watersideRatio: 0.31
    }
  },
  {
    id: "busy-loop",
    name: "人通り推定多め",
    theme: "busy",
    distanceM: 2800,
    estimatedDurationMin: 34,
    activity: "stroll",
    summary: "駅周辺や大きめの通りをほどよく含む想定のルートです。",
    labels: ["人通り推定多め", "短め", "街なか"],
    cautions: ["交通量の多い場所では横断に注意してください"],
    metrics: {
      ascentM: 10,
      pavedRatio: 0.96,
      parkRatio: 0.08,
      watersideRatio: 0.02
    }
  },
  {
    id: "gentle-run-loop",
    name: "軽く走る朝ルート",
    theme: "light-run",
    distanceM: 6200,
    estimatedDurationMin: 46,
    activity: "run",
    summary: "走り慣れてきた人が軽く走る想定の、少し長めのルートです。",
    labels: ["軽く走る", "少し長め", "舗装路中心"],
    cautions: ["体調に合わせて無理せず調整してください"],
    metrics: {
      ascentM: 32,
      pavedRatio: 0.9,
      parkRatio: 0.16,
      watersideRatio: 0.12
    }
  }
];

export const formatDistanceKm = (distanceM: number) =>
  `${(distanceM / 1000).toFixed(1)} km`;

export const formatDuration = (durationMin: number) => `${durationMin} min`;
