import { mockRouteCandidates } from "@route5/shared";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { RouteCandidateCard } from "../../components/route-candidate-card";
import { RouteMap } from "../route-map/route-map";

export function RoutePlannerScreen() {
  const [selectedRouteId, setSelectedRouteId] = useState(
    mockRouteCandidates[0]?.id
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: "#F7F8F5" }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: 32,
        gap: 18
      }}
    >
      <View style={{ gap: 6 }}>
        <Text
          selectable
          style={{
            color: "#17231D",
            fontSize: 28,
            fontWeight: "800"
          }}
        >
          今日の道を選ぶ
        </Text>
        <Text selectable style={{ color: "#526058", fontSize: 15 }}>
          気分や歩きやすさで、今日の候補を比べます。
        </Text>
      </View>

      <RouteMap
        routes={mockRouteCandidates}
        selectedRouteId={selectedRouteId}
      />

      <View style={{ gap: 12 }}>
        {mockRouteCandidates.map((route) => (
          <RouteCandidateCard
            key={route.id}
            route={route}
            selected={route.id === selectedRouteId}
            onPress={() => setSelectedRouteId(route.id)}
          />
        ))}
      </View>

      <Text selectable style={{ color: "#66736B", fontSize: 13 }}>
        表示内容は地図データに基づく推定の練習表示です。安全を保証するものではありません。
      </Text>
    </ScrollView>
  );
}
