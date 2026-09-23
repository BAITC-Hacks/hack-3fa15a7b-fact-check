import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  MapPin,
  Sparkles,
} from "lucide-react-native";
import { Choices, Field } from "../components/FormControls";
import {
  ActionButton,
  Eyebrow,
  IconButton,
  Reveal,
  SectionTitle,
  SelectionMark,
  serif,
} from "../components/UI";
import EventArtwork from "../components/EventArtwork";
import DatePicker from "../components/DatePicker";
import Brief from "../components/Brief";
import Results from "../components/Results";
import AboutSheet from "../components/AboutSheet";
import { useOrderStore } from "../store/useOrderStore";
import { isApiConfigured } from "../services/api";
import {
  categoryOptions,
  eventOptions,
  languages,
  steps,
} from "../constants/options";
import { colors } from "../constants/theme";
import { formatDate, money } from "../utils/calendar";
import { validateOrder } from "../utils/order";

export default function Home() {
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const { order, update, submit, loading, error, result } = useOrderStore();
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [view, setView] = useState("form");
  const [about, setAbout] = useState(false);
  const [allCategories, setAllCategories] = useState(false);
  const [formError, setFormError] = useState(null);
  const scroll = useRef(null);
  const edit = (next) => {
    if (loading) return;
    scroll.current?.scrollTo({ y: 0, animated: false });
    setStep(next);
    setFurthest((n) => Math.max(n, next));
    setView("form");
    setFormError(null);
  };
  const change = (field, value) => {
    setFormError(null);
    update(field, value);
  };
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [step, view]);
  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (loading) return true;
      if (view === "results") {
        setView("form");
        return true;
      }
      if (step > 0) {
        setStep(step - 1);
        return true;
      }
      return false;
    });
    return () => listener.remove();
  }, [loading, step, view]);
  function next() {
    const validation = validateOrder({ ...order, duration_hours: "" });
    if (step >= 1 && validation) {
      setFormError(validation);
      scroll.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    setFormError(null);
    setStep(step + 1);
    setFurthest(Math.max(furthest, step + 1));
  }
  async function search() {
    const validation = validateOrder(order);
    if (validation) {
      setFormError(validation);
      scroll.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    setView("results");
    await submit();
  }
  const cardClass = "rounded-[24px] border border-line bg-white p-5 sm:p-7";
  const selectedCategory = categoryOptions.find(
    (item) => item.value === order.category,
  );
  const visibleCategories = allCategories
    ? categoryOptions
    : [
        ...categoryOptions.slice(0, 4),
        ...(categoryOptions.indexOf(selectedCategory) > 3
          ? [selectedCategory]
          : []),
      ];

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="border-b border-line">
          <View className="mx-auto w-full max-w-6xl flex-row items-center justify-between px-5 py-4 sm:px-8">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand">
                <Check size={23} color="white" strokeWidth={3} />
              </View>
              <Text className="text-xl font-bold tracking-tight text-ink">
                Trust<Text className="text-brand"> ME</Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              {wide && (
                <Text className="text-xs tracking-wide text-muted">
                  HACKALEM AI · КРЕАТИВНЫЕ ИНДУСТРИИ
                </Text>
              )}
              <IconButton
                icon={CircleHelp}
                label="Как работает Trust ME"
                onPress={() => setAbout(true)}
              />
            </View>
          </View>
        </View>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          <View className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            {view === "form" && step === 0 ? (
              <View
                className={`py-7 ${wide ? "flex-row items-center justify-between pb-8 pt-10" : ""}`}
              >
                <View style={wide ? { flex: 1 } : undefined} className="gap-3">
                  <View className="flex-row items-center gap-2">
                    <View className="h-1.5 w-1.5 rounded-full bg-brand" />
                    <Eyebrow>Хорошие события начинаются с людей</Eyebrow>
                  </View>
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: wide ? 58 : width < 370 ? 35 : 42,
                          lineHeight: wide ? 64 : width < 370 ? 41 : 47,
                        }}
                        className="font-semibold tracking-tight text-ink"
                      >
                        Ваше событие.
                      </Text>
                      <Text
                        style={[
                          serif,
                          {
                            fontSize: wide ? 60 : width < 370 ? 38 : 45,
                            lineHeight: wide ? 66 : 52,
                          },
                        ]}
                        className="italic text-brand"
                      >
                        Ваши люди.
                      </Text>
                    </View>
                    {!wide && width >= 370 && (
                      <View
                        style={{ width: 95, height: 125, marginRight: -10 }}
                      >
                        <EventArtwork />
                      </View>
                    )}
                  </View>
                  <Text className="max-w-md text-sm leading-6 text-muted">
                    Найдите тех, кто подходит именно вам.{"\n"}До трёх
                    кандидатов — и объяснение каждого выбора.
                  </Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    <View className="rounded-full bg-sage px-3 py-1.5">
                      <Text className="text-[10px] font-semibold text-green">
                        По вашим условиям
                      </Text>
                    </View>
                    <Text className="text-[11px] text-muted">
                      Без бесконечного скролла
                    </Text>
                  </View>
                </View>
                {wide && (
                  <View style={{ width: 320, height: 265, marginRight: 28 }}>
                    <EventArtwork />
                  </View>
                )}
              </View>
            ) : (
              <View className="gap-2 py-7">
                <Eyebrow>
                  {view === "results"
                    ? "От условий — к выбору"
                    : `Шаг 0${step + 1} / 03`}
                </Eyebrow>
                <Text className="text-3xl font-semibold tracking-tight text-ink">
                  {view === "results"
                    ? "Ваш подбор"
                    : step === 1
                      ? "Кто сделает событие?"
                      : "Добавим ваши пожелания"}
                </Text>
                <Text className="text-sm leading-6 text-muted">
                  {view === "results"
                    ? `${order.city} · ${formatDate(order.date)} · ${order.category}`
                    : step === 1
                      ? "Один запрос — одна категория подрядчиков."
                      : "Необязательно, но поможет сделать выбор точнее."}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: wide ? "row" : "column",
                gap: 28,
                alignItems: wide ? "flex-start" : undefined,
              }}
            >
              <View style={{ flex: 1, width: wide ? undefined : "100%" }}>
                {view === "form" ? (
                  <>
                    <View className="mb-5 flex-row items-center gap-2">
                      {steps.map((label, index) => (
                        <Pressable
                          key={label}
                          disabled={index > furthest}
                          accessibilityRole="button"
                          accessibilityLabel={`Шаг ${index + 1}: ${label}`}
                          accessibilityState={{
                            selected: step === index,
                            disabled: index > furthest,
                          }}
                          onPress={() => edit(index)}
                          className={`min-h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl ${step === index ? "bg-ink" : "bg-white"}`}
                        >
                          <View
                            className={`h-5 w-5 items-center justify-center rounded-full ${step === index ? "bg-white/15" : "bg-canvas"}`}
                          >
                            {index < step ? (
                              <Check size={11} color={colors.green} />
                            ) : (
                              <Text
                                className={`text-[10px] ${step === index ? "text-white" : "text-muted"}`}
                              >
                                {index + 1}
                              </Text>
                            )}
                          </View>
                          <Text
                            className={`text-[11px] font-medium ${step === index ? "text-white" : "text-muted"}`}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                        {formError && (
                          <Text
                            accessibilityRole="alert"
                            className="mb-4 rounded-xl bg-soft p-4 text-sm leading-6 text-brand"
                          >
                            {formError}
                          </Text>
                        )}
                    <Reveal key={step}>
                      <View className="gap-4">
                        {step === 0 && (
                          <>
                            <View className={cardClass}>
                              <SectionTitle
                                number="01"
                                title="Что отмечаем?"
                                subtitle="Подберём людей, знакомых с вашим форматом."
                              />
                              <Choices
                                options={eventOptions}
                                label="Формат мероприятия"
                                value={order.event_type}
                                onChange={(value) =>
                                  change("event_type", value)
                                }
                                tiles
                              />
                            </View>
                            <View className={cardClass}>
                              <SectionTitle number="02" title="Где и когда?" />
                              <View className="gap-5">
                                <Choices
                                  label="Город мероприятия"
                                  options={["Алматы", "Астана", "Зарубежье"]}
                                  value={order.city}
                                  onChange={(value) => change("city", value)}
                                />
                                <DatePicker
                                  value={order.date}
                                  onChange={(value) => change("date", value)}
                                />
                                <View className="flex-row items-start gap-2">
                                  <MapPin size={14} color={colors.muted} />
                                  <Text className="flex-1 text-xs leading-5 text-muted">
                                    Смотрим доступность именно на выбранную
                                    дату.
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </>
                        )}
                        {step === 1 && (
                          <>
                            <View className={cardClass}>
                              <SectionTitle
                                number="03"
                                title="Кого ищем?"
                                subtitle="Выберите одну специализацию."
                              />
                              <View
                                className="flex-row flex-wrap gap-2"
                                accessibilityRole="radiogroup"
                                accessibilityLabel="Категория подрядчика"
                              >
                                {visibleCategories.map(
                                  ({ value, icon: Icon, detail }) => (
                                    <Pressable
                                      key={value}
                                      accessibilityRole="radio"
                                      aria-checked={order.category === value}
                                      accessibilityLabel={value}
                                      accessibilityState={{
                                        checked: order.category === value,
                                      }}
                                      onPress={() => change("category", value)}
                                      style={{ width: "48%", flexGrow: 1 }}
                                      className={`min-h-[132px] justify-between gap-4 rounded-2xl border p-4 ${order.category === value ? "border-brand bg-soft" : "border-line bg-white"} active:opacity-70`}
                                    >
                                      <View className="flex-row items-center justify-between">
                                        <Icon
                                          size={25}
                                          color={
                                            order.category === value
                                              ? colors.brand
                                              : colors.muted
                                          }
                                          strokeWidth={1.4}
                                        />
                                        <SelectionMark
                                          selected={order.category === value}
                                        />
                                      </View>
                                      <View className="gap-1">
                                        <Text
                                          className={`text-sm font-semibold ${order.category === value ? "text-brand" : "text-ink"}`}
                                        >
                                          {value}
                                        </Text>
                                        <Text className="text-[11px] leading-4 text-muted">
                                          {detail}
                                        </Text>
                                      </View>
                                    </Pressable>
                                  ),
                                )}
                              </View>
                              <Pressable
                                accessibilityRole="button"
                                aria-expanded={allCategories}
                                accessibilityState={{
                                  expanded: allCategories,
                                }}
                                onPress={() => setAllCategories(!allCategories)}
                                className="mt-3 min-h-11 flex-row items-center justify-center gap-2"
                              >
                                <Text className="text-sm font-medium text-muted">
                                  {allCategories
                                    ? "Свернуть категории"
                                    : "Все категории"}
                                </Text>
                                <ChevronDown
                                  size={15}
                                  color={colors.muted}
                                  style={{
                                    transform: [
                                      {
                                        rotate: allCategories
                                          ? "180deg"
                                          : "0deg",
                                      },
                                    ],
                                  }}
                                />
                              </Pressable>
                            </View>
                            <View className={cardClass}>
                              <SectionTitle
                                number="04"
                                title="Комфортный бюджет"
                                subtitle="Лимит на одного подрядчика за мероприятие."
                              />
                              <Field
                                label="Бюджет до"
                                value={order.budget ? money(order.budget) : ""}
                                onChangeText={(value) =>
                                  change("budget", value.replace(/[^0-9]/g, ""))
                                }
                                keyboardType="number-pad"
                                maxLength={15}
                                suffix="₸"
                                large
                              />
                              <View className="mt-4">
                                <Choices
                                  options={[
                                    { value: "200000", label: "200 тыс." },
                                    { value: "500000", label: "500 тыс." },
                                    { value: "1000000", label: "1 млн" },
                                  ]}
                                  value={order.budget}
                                  onChange={(value) => change("budget", value)}
                                />
                              </View>
                              <Text className="mt-4 text-xs leading-5 text-muted">
                                В каталоге указана цена «от». Финальная
                                стоимость может зависеть от деталей события.
                              </Text>
                            </View>
                          </>
                        )}
                        {step === 2 && (
                          <>
                            <View className={cardClass}>
                              <SectionTitle
                                number="05"
                                title="Точнее — значит ближе"
                                subtitle="Можно оставить без ограничений."
                              />
                              <View className="gap-6">
                                <Choices
                                  label="Язык мероприятия"
                                  options={languages}
                                  value={order.language}
                                  onChange={(value) =>
                                    change("language", value)
                                  }
                                />
                                <Field
                                  label="Длительность работы"
                                  placeholder="Неважно"
                                  suffix="ч"
                                  value={order.duration_hours}
                                  onChangeText={(value) =>
                                    change(
                                      "duration_hours",
                                      value.replace(",", "."),
                                    )
                                  }
                                  keyboardType="decimal-pad"
                                  maxLength={5}
                                  hint="Для услуг без присутствия на площадке длительность не учитывается."
                                />
                              </View>
                            </View>
                            {!wide && <Brief order={order} onEdit={edit} />}
                            <View className="flex-row items-start gap-3 rounded-2xl bg-soft p-5">
                              <Sparkles size={21} color={colors.brand} />
                              <View className="flex-1 gap-1">
                                <Text className="text-sm font-semibold text-ink">
                                  Понятно, почему именно они
                                </Text>
                                <Text className="text-xs leading-5 text-muted">
                                  В каждой карточке — объяснение совпадений.
                                  Если никто не подойдёт, покажем причину.
                                </Text>
                              </View>
                            </View>
                            {!isApiConfigured && (
                              <Text className="px-1 text-xs leading-5 text-muted">
                                Сервис подбора пока не подключён. Вы можете
                                подготовить условия; реальные рекомендации
                                появятся после подключения.
                              </Text>
                            )}
                          </>
                        )}

                      </View>
                    </Reveal>
                  </>
                ) : (
                  <Results
                    result={result}
                    loading={loading}
                    error={error}
                    order={order}
                    onEdit={edit}
                    onRetry={search}
                  />
                )}
              </View>
              {wide && (
                <View style={{ width: 294 }} className="gap-5">
                  <Brief order={order} onEdit={loading ? undefined : edit} />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setAbout(true)}
                    className="flex-row items-center justify-between gap-3 rounded-2xl border border-line p-5"
                  >
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-ink">
                        Как мы помогаем выбрать
                      </Text>
                      <Text className="text-xs leading-5 text-muted">
                        Прозрачность на каждом шаге
                      </Text>
                    </View>
                    <ArrowUpRight size={18} color={colors.brand} />
                  </Pressable>
                  <Text className="px-3 text-xs leading-5 text-muted">
                    TRUST ME / HACKALEM AI{"\n"}Сделано для событий, которые
                    запоминаются.
                  </Text>
                </View>
              )}
            </View>
            <View className="mt-7 flex-row items-center justify-between border-t border-line pt-5">
              <Text className="text-[10px] tracking-wide text-muted">
                TRUST ME © 2026
              </Text>
              <Text className="text-[10px] text-muted">
                С вниманием к вашему выбору
              </Text>
            </View>
          </View>
        </ScrollView>
        {view === "form" && (
          <View className="border-t border-line bg-white">
            <View className="mx-auto w-full max-w-6xl flex-row items-center gap-3 px-5 py-3 sm:px-8">
              {step > 0 && (
                <IconButton
                  icon={ArrowLeft}
                  label="Предыдущий шаг"
                  onPress={() => edit(step - 1)}
                />
              )}
              {wide && (
                <View className="flex-1">
                  <Text className="text-xs text-muted">Ваше событие</Text>
                  <Text className="mt-1 text-sm font-medium text-ink">
                    {order.city} · {formatDate(order.date, true)}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flex: wide ? undefined : 1,
                  minWidth: wide ? 300 : undefined,
                }}
              >
                <ActionButton
                  icon={step === 2 ? Sparkles : ArrowRight}
                  onPress={step === 2 ? search : next}
                >
                  {step === 0
                    ? "Выбрать подрядчика"
                    : step === 1
                      ? "Уточнить пожелания"
                      : "Найти моих людей"}
                </ActionButton>
              </View>
            </View>
          </View>
        )}
        <AboutSheet visible={about} onClose={() => setAbout(false)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
