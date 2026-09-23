import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  MapPin,
  SearchX,
  Sparkles,
  WifiOff,
} from "lucide-react-native";
import { colors } from "../constants/theme";
import { formatDate, money } from "../utils/calendar";
import { ActionButton, Eyebrow, Reveal, serif } from "./UI";

function ContractorCard({ item, index, budget }) {
  const [details, setDetails] = useState(false);
  const initials = item.anon_name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  const palette = [
    ["#F3DBC9", "#80513C"],
    ["#DCE5D2", "#526747"],
    ["#E8E1EF", "#6D5879"],
  ];
  const [backgroundColor, color] = palette[index % 3];
  const remainder = Number(budget) - item.price_from_kzt;
  return (
    <View className="overflow-hidden rounded-3xl border border-line bg-white">
      <View className="flex-row items-center justify-between border-b border-line px-5 py-3">
        <Eyebrow>Вариант 0{index + 1}</Eyebrow>
        <View className="flex-row items-center gap-1.5">
          <Check size={12} color={colors.green} />
          <Text className="text-xs text-green">По вашим условиям</Text>
        </View>
      </View>
      <View className="gap-5 p-5">
        <View className="flex-row items-center gap-3">
          <View
            style={{ backgroundColor }}
            className="h-16 w-16 items-center justify-center rounded-2xl"
          >
            <Text style={[serif, { color }]} className="text-2xl">
              {initials}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-lg font-semibold tracking-tight text-ink">
              {item.anon_name}
            </Text>
            <Text className="text-xs leading-5 text-muted">
              {item.categories.join(" · ")}
            </Text>
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color={colors.muted} />
              <Text className="text-xs text-muted">{item.city}</Text>
            </View>
          </View>
        </View>
        <View className="flex-row flex-wrap items-baseline gap-2">
          <Text className="text-xs text-muted">от</Text>
          <Text className="text-[28px] font-semibold tracking-tight text-ink">
            {money(item.price_from_kzt)} ₸
          </Text>
          <Text className="text-xs text-muted">/ мероприятие</Text>
        </View>
        <View className="gap-2 rounded-2xl bg-canvas p-4">
          <View className="flex-row items-center gap-2">
            <Sparkles size={14} color={colors.brand} />
            <Text className="text-xs font-semibold text-brand">
              Почему в подборке
            </Text>
          </View>
          <Text className="text-sm leading-6 text-ink">{item.explanation}</Text>
        </View>
        {item.synthetic && (
          <Text className="text-xs font-medium text-muted">
            Синтетический профиль · учебный датасет
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          aria-expanded={details}
          accessibilityState={{ expanded: details }}
          onPress={() => setDetails(!details)}
          className="min-h-11 flex-row items-center justify-between border-t border-line pt-3"
        >
          <Text className="text-sm font-medium text-ink">
            {details ? "Скрыть детали" : "Цена и данные профиля"}
          </Text>
          {details ? (
            <ChevronUp size={17} color={colors.ink} />
          ) : (
            <ChevronDown size={17} color={colors.ink} />
          )}
        </Pressable>
        {details && (
          <View className="gap-3">
            <Text className="text-sm leading-6 text-muted">
              {remainder >= 0
                ? `Стартовая цена на ${money(remainder)} ₸ ниже вашего лимита.`
                : `Стартовая цена превышает лимит на ${money(-remainder)} ₸.`}{" "}
              Цена «от» — ориентир, а не окончательная смета.
            </Text>
            {item.price_imputed && (
              <Text className="text-xs leading-5 text-muted">
                Цена дополнена при подготовке датасета.
              </Text>
            )}
            {item.city_imputed && (
              <Text className="text-xs leading-5 text-muted">
                Город дополнен при подготовке датасета.
              </Text>
            )}
            <Text className="text-xs text-muted">Профиль {item.id}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
export default function Results({
  result,
  loading,
  error,
  order,
  onEdit,
  onRetry,
}) {
  if (loading)
    return (
      <Reveal>
        <View className="items-center gap-6 rounded-[28px] border border-line bg-white px-6 py-14">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-soft">
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
          <Eyebrow>Подбираем с вниманием к деталям</Eyebrow>
          <Text className="text-center text-3xl font-semibold tracking-tight text-ink">
            Ищем ваших людей
          </Text>
          <Text className="max-w-sm text-center text-sm leading-6 text-muted">
            Отправили ваши условия на подбор. Дождёмся ответа и покажем, почему
            подходит каждый кандидат.
          </Text>
          <View className="rounded-full bg-canvas px-4 py-2">
            <Text className="text-xs text-muted">
              {order.city} · {formatDate(order.date, true)}
            </Text>
          </View>
        </View>
      </Reveal>
    );
  if (error)
    return (
      <Reveal>
        <View className="gap-5 rounded-[28px] border border-line bg-white p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-soft">
            <WifiOff size={25} color={colors.brand} />
          </View>
          <Eyebrow>Не удалось завершить подбор</Eyebrow>
          <Text className="text-3xl font-semibold tracking-tight text-ink">
            Попробуем ещё раз?
          </Text>
          <Text
            accessibilityRole="alert"
            className="text-sm leading-6 text-muted"
          >
            {error}
          </Text>
          <ActionButton onPress={onRetry}>Повторить запрос</ActionButton>
          <Pressable
            accessibilityRole="button"
            onPress={() => onEdit(0)}
            className="min-h-11 flex-row items-center justify-center gap-2"
          >
            <ArrowLeft size={16} color={colors.ink} />
            <Text className="text-sm text-ink">Вернуться к условиям</Text>
          </Pressable>
        </View>
      </Reveal>
    );
  if (!result) return null;
  const empty = result.status !== "matched";
  return (
    <Reveal>
      <View className="gap-5">
        <View className="gap-3">
          <Eyebrow>
            {empty
              ? "Результат подбора"
              : `Подборка · ${result.recommendations.length} из 3 возможных`}
          </Eyebrow>
          <Text className="text-4xl font-semibold tracking-tight text-ink">
            {result.status === "matched"
              ? "Знакомьтесь,"
              : result.status === "category_unavailable"
                ? "Здесь пока никого"
                : "Условия не совпали"}
          </Text>
          {!empty && (
            <Text style={serif} className="-mt-2 text-4xl italic text-brand">
              ваши кандидаты.
            </Text>
          )}
          <Text className="text-sm leading-6 text-muted">{result.message}</Text>
        </View>
        {empty ? (
          <View className="gap-5 rounded-3xl border border-line bg-white p-6">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-sage">
              <SearchX size={28} color={colors.green} />
            </View>
            <Text className="text-xl font-semibold text-ink">
              {result.status === "category_unavailable"
                ? "Попробуйте другой город или категорию"
                : "Небольшое изменение — новые варианты"}
            </Text>
            <Text className="text-sm leading-6 text-muted">
              {result.status === "category_unavailable"
                ? "В каталоге нет этой категории для выбранного города. Другие условия запроса не повлияют на её наличие."
                : "Попробуйте другую дату, больший бюджет или менее строгие пожелания."}
            </Text>
            <ActionButton
              dark
              onPress={() =>
                onEdit(result.status === "category_unavailable" ? 1 : 0)
              }
            >
              Изменить условия
            </ActionButton>
          </View>
        ) : (
          <>
            {result.recommendations.map((item, index) => (
              <ContractorCard
                key={item.id}
                item={item}
                index={index}
                budget={order.budget}
              />
            ))}
            <View className="flex-row items-start gap-2 px-2">
              <CircleHelp size={16} color={colors.muted} />
              <Text className="flex-1 text-xs leading-5 text-muted">
                Подборка помогает выбрать. Дата и стоимость не фиксируются:
                сервис не бронирует подрядчиков.
              </Text>
            </View>
            <ActionButton dark icon={ArrowUpRight} onPress={() => onEdit(0)}>
              Скорректировать подбор
            </ActionButton>
          </>
        )}
      </View>
    </Reveal>
  );
}
