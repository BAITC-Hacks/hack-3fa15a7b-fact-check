import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "../constants/theme";
import { SelectionMark } from "./UI";

export function Choices({
  label,
  options,
  value,
  onChange,
  disabled,
  tiles = false,
}) {
  return (
    <View className="gap-3">
      {label && <Text className="text-sm font-medium text-ink">{label}</Text>}
      <View
        className="flex-row flex-wrap gap-2"
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
      >
        {options.map((option) => {
          const key = option.value ?? option;
          const selected = value === key;
          const Icon = option.icon;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              aria-checked={selected}
              accessibilityLabel={option.label ?? key}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(key)}
              style={tiles ? { width: "48%", flexGrow: 1 } : undefined}
              className={`${tiles ? "min-h-[84px] gap-3 rounded-2xl p-4" : "min-h-11 flex-row items-center gap-2 rounded-full px-4 py-2.5"} border ${selected ? "border-brand bg-soft" : "border-line bg-white"} active:opacity-70`}
            >
              {tiles ? (
                <>
                  <View className="flex-row items-center justify-between">
                    {Icon && (
                      <Icon
                        size={21}
                        color={selected ? colors.brand : colors.muted}
                        strokeWidth={1.5}
                      />
                    )}
                    <SelectionMark selected={selected} />
                  </View>
                  <Text
                    className={`text-sm font-medium ${selected ? "text-brand" : "text-ink"}`}
                  >
                    {option.label ?? key}
                  </Text>
                </>
              ) : (
                <>
                  {selected && (
                    <Check size={13} color={colors.brand} strokeWidth={2.5} />
                  )}
                  <Text
                    className={`text-sm ${selected ? "font-semibold text-brand" : "text-muted"}`}
                  >
                    {option.label ?? key}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
export function Field({ label, hint, suffix, large = false, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-2">
      {label && <Text className="text-sm font-medium text-ink">{label}</Text>}
      <View
        className={`min-h-14 flex-row items-center rounded-2xl border px-4 ${focused ? "border-brand bg-white" : "border-line bg-canvas"}`}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#93968D"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`min-h-14 flex-1 py-3 text-ink ${large ? "text-3xl font-semibold tracking-tight" : "text-base"}`}
          style={Platform.OS === "web" ? { outlineStyle: "none" } : undefined}
          {...props}
        />
        {suffix && <Text className="pl-2 text-xl text-muted">{suffix}</Text>}
      </View>
      {hint && <Text className="text-xs leading-5 text-muted">{hint}</Text>}
    </View>
  );
}
