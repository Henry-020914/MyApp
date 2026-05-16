import {
  routePlanRequestSchema,
  type ActivityMode,
  type RoutePlanLevel,
  type RoutePlanPreference,
  type RoutePlanRequest
} from "@route5/shared";

export type TargetType = "distance" | "time";

export type RoutePlannerFormValues = {
  originLabel: string;
  originLat: string;
  originLng: string;
  targetType: TargetType;
  targetValue: string;
  activity: ActivityMode;
  level: RoutePlanLevel;
  preferences: RoutePlanPreference[];
};

export type RoutePlannerFormResult =
  | {
      success: true;
      request: RoutePlanRequest;
    }
  | {
      success: false;
      message: string;
    };

export const defaultRoutePlannerFormValues: RoutePlannerFormValues = {
  originLabel: "東京駅",
  originLat: "35.6812",
  originLng: "139.7671",
  targetType: "time",
  targetValue: "30",
  activity: "walk",
  level: "beginner",
  preferences: ["flat", "park"]
};

export const targetTypeOptions: Array<{ value: TargetType; label: string }> = [
  { value: "time", label: "時間" },
  { value: "distance", label: "距離" }
];

export const targetPresets: Record<TargetType, number[]> = {
  time: [10, 20, 30, 45, 60],
  distance: [1, 3, 5, 10]
};

export const activityOptions: Array<{ value: ActivityMode; label: string }> = [
  { value: "stroll", label: "散歩" },
  { value: "walk", label: "ウォーキング" },
  { value: "jog", label: "ジョギング" },
  { value: "run", label: "ランニング" }
];

export const levelOptions: Array<{ value: RoutePlanLevel; label: string }> = [
  { value: "beginner", label: "初心者" },
  { value: "normal", label: "普通" },
  { value: "experienced", label: "慣れている" },
  { value: "hill_ok", label: "坂OK" }
];

export const preferenceOptions: Array<{
  value: RoutePlanPreference;
  label: string;
}> = [
  { value: "flat", label: "平坦" },
  { value: "park", label: "公園多め" },
  { value: "waterside", label: "水辺あり" },
  { value: "shade", label: "日陰多め" },
  { value: "busy", label: "人通り推定多め" },
  { value: "quiet", label: "静かな道" },
  { value: "hill_training", label: "坂トレ" },
  { value: "scenic", label: "景色重視" }
];

export const getTargetUnitLabel = (targetType: TargetType) =>
  targetType === "distance" ? "km" : "分";

export const setTargetPreset = (
  values: RoutePlannerFormValues,
  targetType: TargetType,
  value: number
): RoutePlannerFormValues => ({
  ...values,
  targetType,
  targetValue: String(value)
});

export const toggleRoutePreference = (
  values: RoutePlannerFormValues,
  preference: RoutePlanPreference
): RoutePlannerFormValues => {
  const preferences = values.preferences.includes(preference)
    ? values.preferences.filter((current) => current !== preference)
    : [...values.preferences, preference];

  return {
    ...values,
    preferences
  };
};

export const toRoutePlanRequest = (
  values: RoutePlannerFormValues
): RoutePlannerFormResult => {
  const lat = Number(values.originLat);
  const lng = Number(values.originLng);
  const targetValue = Number(values.targetValue);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      success: false,
      message: "起点の緯度と経度は数字で入力してください。"
    };
  }

  if (!Number.isFinite(targetValue) || targetValue <= 0) {
    return {
      success: false,
      message: "距離または時間は0より大きい数字で入力してください。"
    };
  }

  const request: RoutePlanRequest = {
    origin: {
      lat,
      lng,
      label: values.originLabel.trim() || undefined
    },
    target:
      values.targetType === "distance"
        ? {
            type: "distance",
            value: targetValue,
            unit: "km"
          }
        : {
            type: "time",
            value: targetValue,
            unit: "min"
          },
    activity: values.activity,
    level: values.level,
    preferences: values.preferences,
    routeCount: 5,
    locale: "ja-JP"
  };

  const validation = routePlanRequestSchema.safeParse(request);

  if (!validation.success) {
    return {
      success: false,
      message: "入力内容を確認してください。"
    };
  }

  return {
    success: true,
    request: validation.data
  };
};
