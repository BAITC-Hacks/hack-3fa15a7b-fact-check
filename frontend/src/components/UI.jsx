import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { X, ArrowRight, Check } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";

export const serif = {
  fontFamily:
    Platform.OS === "ios"
      ? "Georgia"
      : Platform.OS === "web"
        ? "Georgia, serif"
        : "serif",
};
export function Eyebrow({ children, light = false }) {
  return (
    <Text
      className={`text-[10px] font-bold uppercase tracking-[2px] ${light ? "text-white/70" : "text-muted"}`}
    >
      {children}
    </Text>
  );
}
export function IconButton({
  icon: Icon,
  label,
  onPress,
  disabled = false,
  dark = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-11 w-11 items-center justify-center rounded-full ${dark ? "bg-ink" : "border border-line bg-white"} ${disabled ? "opacity-30" : "active:opacity-60"}`}
    >
      <Icon size={19} color={dark ? "white" : colors.ink} strokeWidth={1.7} />
    </Pressable>
  );
}
export function ActionButton({
  children,
  onPress,
  icon: Icon = ArrowRight,
  disabled = false,
  dark = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-14 flex-row items-center justify-between gap-3 rounded-2xl px-5 py-4 ${dark ? "bg-ink" : "bg-brand"} ${disabled ? "opacity-40" : "active:opacity-80"}`}
    >
      <Text className="flex-shrink text-base font-semibold text-white">
        {children}
      </Text>
      <Icon size={20} color="white" />
    </Pressable>
  );
}
export function SectionTitle({ number, title, subtitle }) {
  return (
    <View className="mb-5 flex-row items-start gap-3">
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-canvas">
        <Text className="text-[11px] font-semibold text-muted">{number}</Text>
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm leading-5 text-muted">{subtitle}</Text>
        )}
      </View>
    </View>
  );
}
export function Reveal({ children }) {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let live = true;
    let animation;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (!live || reduced) return;
        opacity.setValue(0);
        animation = Animated.timing(opacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: Platform.OS !== "web",
        });
        animation.start();
      })
      .catch(() => opacity.setValue(1));
    return () => {
      live = false;
      animation?.stop();
    };
  }, [opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
export function Sheet({ visible, onClose, title, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40 sm:items-center sm:justify-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Закрыть окно"
          onPress={onClose}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <SafeAreaView
          edges={["bottom"]}
          style={{ maxHeight: "92%" }}
          className="w-full max-w-lg rounded-t-[32px] bg-white sm:rounded-[32px]"
          accessibilityViewIsModal
        >
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-line" />
          </View>
          <View className="flex-row items-center justify-between gap-3 px-6 pb-3 pt-4">
            <Text
              accessibilityRole="header"
              className="flex-1 text-2xl font-semibold tracking-tight text-ink"
            >
              {title}
            </Text>
            <IconButton icon={X} label="Закрыть" onPress={onClose} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, paddingTop: 12 }}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
export function SelectionMark({ selected }) {
  return (
    <View
      className={`h-5 w-5 items-center justify-center rounded-full ${selected ? "bg-brand" : "border border-line"}`}
    >
      {selected && <Check size={12} color="white" strokeWidth={3} />}
    </View>
  );
}
