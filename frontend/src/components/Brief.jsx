import { Pressable, Text, View } from "react-native";
import {
  MapPin,
  CalendarDays,
  Mic2,
  Wallet,
  ArrowUpRight,
  Globe2,
  Clock3,
} from "lucide-react-native";
import { formatDate, money } from "../utils/calendar";
import { colors } from "../constants/theme";
import { Eyebrow } from "./UI";

export default function Brief({ order, onEdit, compact = false }) {
  const rows = [
    {
      icon: MapPin,
      label: "Событие",
      value: `${order.event_type[0].toUpperCase()}${order.event_type.slice(1)} · ${order.city}`,
      step: 0,
    },
    {
      icon: CalendarDays,
      label: "Дата",
      value: formatDate(order.date),
      step: 0,
    },
    { icon: Mic2, label: "Подрядчик", value: order.category, step: 1 },
    {
      icon: Wallet,
      label: "Бюджет до",
      value: `${money(order.budget)} ₸`,
      step: 1,
    },
    ...(compact
      ? []
      : [
          {
            icon: Globe2,
            label: "Язык",
            value: order.language || "Любой",
            step: 2,
          },
          {
            icon: Clock3,
            label: "Длительность",
            value: order.duration_hours
              ? `${order.duration_hours} ч`
              : "Без ограничений",
            step: 2,
          },
        ]),
  ];
  return (
    <View className="overflow-hidden rounded-3xl bg-sage">
      <View className="gap-2 px-5 pb-2 pt-5">
        <Eyebrow>Всё складывается</Eyebrow>
        <Text className="text-xl font-semibold tracking-tight text-ink">
          Ваш бриф
        </Text>
      </View>
      <View className="px-5">
        {rows.map(({ icon: Icon, label, value, step }) => (
          <Pressable
            key={label}
            accessibilityRole={onEdit ? "button" : undefined}
            accessibilityLabel={`${label}: ${value}${onEdit ? ". Изменить" : ""}`}
            disabled={!onEdit}
            onPress={() => onEdit?.(step)}
            className="min-h-16 flex-row items-center gap-3 border-b border-black/5 py-3"
          >
            <Icon size={18} color={colors.green} strokeWidth={1.5} />
            <View className="flex-1 gap-1">
              <Text className="text-[11px] text-muted">{label}</Text>
              <Text className="text-sm font-medium text-ink">{value}</Text>
            </View>
            {onEdit && <ArrowUpRight size={15} color={colors.green} />}
          </Pressable>
        ))}
      </View>
      <View className="px-5 py-4">
        <Text className="text-xs leading-5 text-green">
          Меньше вариантов.{"\n"}Больше уверенности в выборе.
        </Text>
      </View>
    </View>
  );
}
