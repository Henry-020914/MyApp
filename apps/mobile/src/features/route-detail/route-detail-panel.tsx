import type { RouteCandidate } from "@route5/shared";
import { Text, View } from "react-native";
import { toRouteDetailDisplay } from "./route-detail-model";

type RouteDetailPanelProps = {
  route?: RouteCandidate;
};

export function RouteDetailPanel({ route }: RouteDetailPanelProps) {
  if (!route) {
    return null;
  }

  const detail = toRouteDetailDisplay(route);

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D7DDD9",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        padding: 14
      }}
    >
      <View style={{ gap: 4 }}>
        <Text
          selectable
          style={{ color: "#1F2A24", fontSize: 16, fontWeight: "700" }}
        >
          選択中の詳細
        </Text>
        <Text selectable style={{ color: "#17231D", fontSize: 18, fontWeight: "700" }}>
          {detail.title}
        </Text>
        <Text selectable style={{ color: "#526058", fontSize: 13 }}>
          {detail.description}
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
        <DetailMetric label="距離" value={detail.distance} />
        <DetailMetric label="推定時間" value={detail.duration} />
        <DetailMetric label="坂" value={detail.slope} />
        <DetailMetric label="路面" value={detail.surface} />
        <DetailMetric label="上り" value={detail.ascent} />
        <DetailMetric label="下り" value={detail.descent} />
        <DetailMetric label="最大勾配" value={detail.maxSlope} />
      </View>

      <View style={{ gap: 5 }}>
        {detail.featureScores.map((score) => (
          <Text selectable key={score} style={{ color: "#314238", fontSize: 13 }}>
            {score}
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
        {detail.cautions.map((caution) => (
          <Text
            selectable
            key={caution}
            style={{ color: "#5A665F", fontSize: 12 }}
          >
            {caution}
          </Text>
        ))}
      </View>
    </View>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
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
