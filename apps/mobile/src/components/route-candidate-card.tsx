import type { MockRouteCandidate } from "@route5/shared";
import { Pressable, Text, View } from "react-native";
import { toRouteCandidateCardDetails } from "./route-candidate-card-model";

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
  const details = toRouteCandidateCardDetails(route);

  return (
    <Pressable
      accessibilityLabel={`${route.name} ${selected ? "選択中" : "選択する"}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        borderColor: selected ? "#247A6B" : "#D7DDD9",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: selected ? "#E8F4F0" : "#FFFFFF",
        padding: 14,
        gap: 12,
        opacity: pressed ? 0.88 : 1
      })}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
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

        {selected ? (
          <Text
            selectable
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#247A6B",
              borderRadius: 6,
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "700",
              paddingHorizontal: 8,
              paddingVertical: 4
            }}
          >
            選択中
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        <CardMetric label="距離" value={details.distance} />
        <CardMetric label="推定時間" value={details.duration} />
        <CardMetric label="坂" value={details.slope} />
        <CardMetric label="路面" value={details.surface} />
      </View>

      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: "#314238", fontSize: 13 }}>
          特徴 {details.features}
        </Text>
        <Text selectable style={{ color: "#314238", fontSize: 13 }}>
          レベル適合 {details.levelFit}
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

      <View style={{ gap: 4 }}>
        <Text
          selectable
          style={{ color: "#66736B", fontSize: 12, fontWeight: "700" }}
        >
          注意
        </Text>
        {route.cautions.map((caution) => (
          <Text
            selectable
            key={caution}
            style={{ color: "#5A665F", fontSize: 12 }}
          >
            {caution}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

function CardMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 68, gap: 2 }}>
      <Text selectable style={{ color: "#6A766F", fontSize: 11 }}>
        {label}
      </Text>
      <Text
        selectable
        style={{
          color: "#1F2A24",
          fontSize: 14,
          fontVariant: ["tabular-nums"],
          fontWeight: "700"
        }}
      >
        {value}
      </Text>
    </View>
  );
}
