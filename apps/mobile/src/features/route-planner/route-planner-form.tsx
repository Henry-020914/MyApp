import { Pressable, Text, TextInput, View } from "react-native";
import {
  activityOptions,
  getTargetUnitLabel,
  levelOptions,
  preferenceOptions,
  setTargetPreset,
  targetPresets,
  targetTypeOptions,
  toggleRoutePreference,
  type RoutePlannerFormValues
} from "./route-planner-form-model";

type RoutePlannerFormProps = {
  values: RoutePlannerFormValues;
  onChange: (values: RoutePlannerFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  error?: string;
};

export function RoutePlannerForm({
  values,
  onChange,
  onSubmit,
  submitting,
  error
}: RoutePlannerFormProps) {
  const updateValues = (patch: Partial<RoutePlannerFormValues>) =>
    onChange({
      ...values,
      ...patch
    });

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
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: "#1F2A24", fontSize: 16, fontWeight: "700" }}>
          起点
        </Text>
        <TextInput
          accessibilityLabel="起点名"
          onChangeText={(originLabel) => updateValues({ originLabel })}
          placeholder="場所名"
          style={inputStyle}
          value={values.originLabel}
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            accessibilityLabel="緯度"
            keyboardType="decimal-pad"
            onChangeText={(originLat) => updateValues({ originLat })}
            placeholder="緯度"
            style={[inputStyle, { flex: 1 }]}
            value={values.originLat}
          />
          <TextInput
            accessibilityLabel="経度"
            keyboardType="decimal-pad"
            onChangeText={(originLng) => updateValues({ originLng })}
            placeholder="経度"
            style={[inputStyle, { flex: 1 }]}
            value={values.originLng}
          />
        </View>
      </View>

      <ChoiceGroup
        label="距離 / 時間"
        options={targetTypeOptions}
        selectedValue={values.targetType}
        onSelect={(targetType) =>
          onChange(
            setTargetPreset(
              values,
              targetType,
              targetPresets[targetType][0] ?? 30
            )
          )
        }
      />

      <View style={{ gap: 8 }}>
        <Text selectable style={sectionLabelStyle}>
          {values.targetType === "distance" ? "距離" : "時間"}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {targetPresets[values.targetType].map((preset) => (
            <ChoiceButton
              key={`${values.targetType}-${preset}`}
              label={`${preset}${getTargetUnitLabel(values.targetType)}`}
              selected={values.targetValue === String(preset)}
              onPress={() =>
                onChange(setTargetPreset(values, values.targetType, preset))
              }
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            accessibilityLabel="距離または時間"
            keyboardType="decimal-pad"
            onChangeText={(targetValue) => updateValues({ targetValue })}
            placeholder="自由入力"
            style={[inputStyle, { flex: 1 }]}
            value={values.targetValue}
          />
          <View style={{ justifyContent: "center", minWidth: 36 }}>
            <Text selectable style={{ color: "#526058", fontSize: 14 }}>
              {getTargetUnitLabel(values.targetType)}
            </Text>
          </View>
        </View>
      </View>

      <ChoiceGroup
        label="運動モード"
        options={activityOptions}
        selectedValue={values.activity}
        onSelect={(activity) => updateValues({ activity })}
      />

      <ChoiceGroup
        label="体力レベル"
        options={levelOptions}
        selectedValue={values.level}
        onSelect={(level) => updateValues({ level })}
      />

      <View style={{ gap: 8 }}>
        <Text selectable style={sectionLabelStyle}>
          優先条件
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {preferenceOptions.map((option) => (
            <ChoiceButton
              key={option.value}
              label={option.label}
              selected={values.preferences.includes(option.value)}
              onPress={() => onChange(toggleRoutePreference(values, option.value))}
            />
          ))}
        </View>
      </View>

      {error ? (
        <Text selectable style={{ color: "#B3261E", fontSize: 13 }}>
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={submitting}
        onPress={onSubmit}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: submitting ? "#7D8C86" : "#247A6B",
          borderCurve: "continuous",
          borderRadius: 8,
          opacity: pressed ? 0.88 : 1,
          paddingVertical: 12
        })}
      >
        <Text selectable style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
          {submitting ? "探しています" : "ルートを探す"}
        </Text>
      </Pressable>
    </View>
  );
}

function ChoiceGroup<TValue extends string>({
  label,
  options,
  selectedValue,
  onSelect
}: {
  label: string;
  options: Array<{ value: TValue; label: string }>;
  selectedValue: TValue;
  onSelect: (value: TValue) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text selectable style={sectionLabelStyle}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => (
          <ChoiceButton
            key={option.value}
            label={option.label}
            selected={option.value === selectedValue}
            onPress={() => onSelect(option.value)}
          />
        ))}
      </View>
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
  paddingHorizontal: 10,
  paddingVertical: 9
} as const;
