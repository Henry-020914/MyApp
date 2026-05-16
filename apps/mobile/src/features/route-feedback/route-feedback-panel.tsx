import type {
  RouteCandidate,
  RouteFeedbackRating,
  RouteFeedbackRequest,
  RouteFeedbackTag
} from "@route5/shared";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  buildRouteFeedbackRequest,
  feedbackRatingOptions,
  feedbackTagOptions,
  toggleFeedbackTag
} from "./route-feedback-model";

type RouteFeedbackPanelProps = {
  route?: RouteCandidate;
  planId?: string;
  accessToken?: string;
  submitting: boolean;
  message?: string;
  error?: string;
  onSubmit: (feedback: RouteFeedbackRequest) => void;
};

export function RouteFeedbackPanel({
  route,
  planId,
  accessToken,
  submitting,
  message,
  error,
  onSubmit
}: RouteFeedbackPanelProps) {
  const [rating, setRating] = useState<RouteFeedbackRating>("neutral");
  const [tags, setTags] = useState<RouteFeedbackTag[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setRating("neutral");
    setTags([]);
    setComment("");
  }, [route?.id, planId]);

  if (!route || !planId || !accessToken) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D7DDD9",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        gap: 14,
        padding: 14
      }}
    >
      <View style={{ gap: 4 }}>
        <Text
          selectable
          style={{ color: "#1F2A24", fontSize: 16, fontWeight: "700" }}
        >
          ルートの感想
        </Text>
        <Text selectable style={{ color: "#526058", fontSize: 13 }}>
          {route.name}
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {feedbackRatingOptions.map((option) => (
          <ChoiceButton
            key={option.value}
            label={option.label}
            selected={rating === option.value}
            onPress={() => setRating(option.value)}
          />
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <Text selectable style={sectionLabelStyle}>
          気づいたこと
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {feedbackTagOptions.map((option) => (
            <ChoiceButton
              key={option.value}
              label={option.label}
              selected={tags.includes(option.value)}
              onPress={() => setTags(toggleFeedbackTag(tags, option.value))}
            />
          ))}
        </View>
      </View>

      <TextInput
        accessibilityLabel="感想メモ"
        multiline
        onChangeText={setComment}
        placeholder="ひとことメモ"
        style={inputStyle}
        value={comment}
      />

      {message ? (
        <Text selectable style={{ color: "#247A6B", fontSize: 13 }}>
          {message}
        </Text>
      ) : null}

      {error ? (
        <Text selectable style={{ color: "#B3261E", fontSize: 13 }}>
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={submitting}
        onPress={() =>
          onSubmit(
            buildRouteFeedbackRequest(
              planId,
              accessToken,
              route.id,
              rating,
              tags,
              comment
            )
          )
        }
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: submitting ? "#7D8C86" : "#247A6B",
          borderCurve: "continuous",
          borderRadius: 8,
          opacity: pressed ? 0.88 : 1,
          paddingVertical: 12
        })}
      >
        <Text
          selectable
          style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}
        >
          {submitting ? "送信しています" : "感想を送る"}
        </Text>
      </Pressable>
    </View>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? "#E8F4F0" : "#F2F4F1",
        borderColor: selected ? "#247A6B" : "#D7DDD9",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        opacity: pressed ? 0.85 : 1,
        paddingHorizontal: 10,
        paddingVertical: 7
      })}
    >
      <Text
        selectable
        style={{
          color: selected ? "#174F45" : "#34433B",
          fontSize: 13,
          fontWeight: selected ? "700" : "500"
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const sectionLabelStyle = {
  color: "#1F2A24",
  fontSize: 14,
  fontWeight: "700"
} as const;

const inputStyle = {
  backgroundColor: "#F7F8F5",
  borderColor: "#D7DDD9",
  borderCurve: "continuous",
  borderRadius: 8,
  borderWidth: 1,
  color: "#17231D",
  fontSize: 14,
  minHeight: 72,
  paddingHorizontal: 10,
  paddingVertical: 9,
  textAlignVertical: "top"
} as const;
