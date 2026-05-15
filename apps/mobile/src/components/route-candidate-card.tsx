import type { MockRouteCandidate } from "@route5/shared";
import { formatDistanceKm, formatDuration } from "@route5/shared";
import { Pressable, Text, View } from "react-native";

type RouteCandidateCardProps = {
  route: MockRouteCandidate;
  selected: boolean;
  onPress: () => void;
};

export function RouteCandidateCard({
  route,
  selected,
  onPress
}: RouteCandidateCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderColor: selected ? "#247A6B" : "#D7DDD9",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: selected ? "#E8F4F0" : "#FFFFFF",
        padding: 14,
        gap: 10
      }}
    >
      <View style={{ gap: 4 }}>
        <Text
          selectable
          style={{
            color: "#1F2A24",
            fontSize: 18,
            fontWeight: "700"
          }}
        >
          {route.name}
        </Text>
        <Text selectable style={{ color: "#526058", fontSize: 14 }}>
          {route.summary}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 14 }}>
        <Text
          selectable
          style={{ color: "#1F2A24", fontVariant: ["tabular-nums"] }}
        >
          {formatDistanceKm(route.distanceM)}
        </Text>
        <Text
          selectable
          style={{ color: "#1F2A24", fontVariant: ["tabular-nums"] }}
        >
          {formatDuration(route.estimatedDurationMin)}
        </Text>
        <Text selectable style={{ color: "#1F2A24" }}>
          ascent {route.metrics.ascentM} m
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {route.labels.map((label) => (
          <Text
            selectable
            key={label}
            style={{
              backgroundColor: "#EEF1ED",
              borderRadius: 6,
              color: "#2E3B34",
              fontSize: 12,
              paddingHorizontal: 8,
              paddingVertical: 4
            }}
          >
            {label}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}
