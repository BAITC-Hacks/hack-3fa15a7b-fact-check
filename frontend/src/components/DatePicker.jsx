import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react-native";
import { calendarDays, formatDate, months } from "../utils/calendar";
import { colors } from "../constants/theme";
import { Sheet, IconButton } from "./UI";

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(9);
  function show() {
    setMonth(Math.min(11, Math.max(8, Number(value.slice(5, 7)) - 1 || 9)));
    setOpen(true);
  }
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Дата мероприятия: ${formatDate(value)}. Изменить`}
        onPress={show}
        className="min-h-20 flex-row items-center gap-4 rounded-2xl border border-line bg-canvas p-4"
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
          <CalendarDays size={22} color={colors.brand} strokeWidth={1.5} />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-xs text-muted">Дата мероприятия</Text>
          <Text className="text-base font-semibold text-ink">
            {formatDate(value)}
          </Text>
        </View>
        <ArrowUpRight size={18} color={colors.muted} />
      </Pressable>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Когда встречаемся?"
      >
        <Text className="mb-6 text-sm leading-6 text-muted">
          Выберите дату. Календари подрядчиков доступны с 23 сентября по 31
          декабря 2026.
        </Text>
        <View className="mb-5 flex-row items-center justify-between">
          <IconButton
            icon={ChevronLeft}
            label="Предыдущий месяц"
            onPress={() => setMonth(month - 1)}
            disabled={month === 8}
          />
          <Text className="text-lg font-semibold capitalize text-ink">
            {months[month]} 2026
          </Text>
          <IconButton
            icon={ChevronRight}
            label="Следующий месяц"
            onPress={() => setMonth(month + 1)}
            disabled={month === 11}
          />
        </View>
        <View className="flex-row">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
            <Text
              key={day}
              style={{ width: "14.2857%" }}
              className="mb-2 text-center text-xs text-muted"
            >
              {day}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {calendarDays(month).map((cell, i) => (
            <View
              key={cell?.date || `empty-${i}`}
              style={{ width: "14.2857%", padding: 2 }}
            >
              {cell && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={formatDate(cell.date)}
                  aria-selected={cell.date === value}
                  accessibilityState={{
                    selected: cell.date === value,
                    disabled: cell.disabled,
                  }}
                  disabled={cell.disabled}
                  onPress={() => {
                    onChange(cell.date);
                    setOpen(false);
                  }}
                  className={`min-h-11 items-center justify-center rounded-xl ${cell.date === value ? "bg-brand" : "bg-white"} active:bg-soft`}
                >
                  <Text
                    className={`text-base ${cell.date === value ? "font-bold text-white" : cell.disabled ? "text-line" : "text-ink"}`}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
        <View className="mt-5 rounded-2xl bg-sage p-4">
          <Text className="text-xs leading-5 text-green">
            В декабре даты разбирают чаще. Если вариантов мало, попробуйте
            соседний день.
          </Text>
        </View>
      </Sheet>
    </>
  );
}
