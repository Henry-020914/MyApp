import { mockRouteCandidates, type RouteCandidate } from "@route5/shared";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { RouteCandidateCard } from "../../components/route-candidate-card";
import { createRoutePlan } from "../../lib/route5-api";
import { RouteMap } from "../route-map/route-map";
import { RoutePlannerForm } from "./route-planner-form";
import {
  defaultRoutePlannerFormValues,
  toRoutePlanRequest
} from "./route-planner-form-model";

export function RoutePlannerScreen() {
  const [formValues, setFormValues] = useState(defaultRoutePlannerFormValues);
  const [routes, setRoutes] = useState<RouteCandidate[]>(mockRouteCandidates);
  const [selectedRouteId, setSelectedRouteId] = useState(
    mockRouteCandidates[0]?.id
  );
  const [formError, setFormError] = useState<string>();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [planId, setPlanId] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const formResult = toRoutePlanRequest(formValues);

    if (!formResult.success) {
      setFormError(formResult.message);
      return;
    }

    setSubmitting(true);
    setFormError(undefined);

    try {
      const response = await createRoutePlan(formResult.request);

      setRoutes(response.candidates);
      setSelectedRouteId(response.candidates[0]?.id);
      setWarnings(response.warnings);
      setPlanId(response.planId);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "ルート生成に失敗しました。"
      );
    } finally {
      setSubmitting(false);
    }
  };

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

      <RoutePlannerForm
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={formError}
      />

      {planId ? (
        <Text selectable style={{ color: "#526058", fontSize: 13 }}>
          生成ID {planId}
        </Text>
      ) : null}

      <RouteMap
        routes={routes}
        selectedRouteId={selectedRouteId}
      />

      <View style={{ gap: 12 }}>
        {routes.map((route) => (
          <RouteCandidateCard
            key={route.id}
            route={route}
            selected={route.id === selectedRouteId}
            onPress={() => setSelectedRouteId(route.id)}
          />
        ))}
      </View>

      {warnings.length > 0 ? (
        <View style={{ gap: 4 }}>
          {warnings.map((warning) => (
            <Text selectable key={warning} style={{ color: "#66736B", fontSize: 13 }}>
              {warning}
            </Text>
          ))}
        </View>
      ) : null}

      <Text selectable style={{ color: "#66736B", fontSize: 13 }}>
        表示内容は地図データに基づく推定の練習表示です。安全を保証するものではありません。
      </Text>
    </ScrollView>
  );
}
