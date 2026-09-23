import { Text, View } from "react-native";
import {
  SlidersHorizontal,
  ScanLine,
  MessageSquareText,
} from "lucide-react-native";
import { Sheet, Eyebrow } from "./UI";
import { colors } from "../constants/theme";
const items = [
  {
    icon: SlidersHorizontal,
    title: "Сначала ваши условия",
    text: "Город, дата, формат и бюджет задают границы поиска. Язык и длительность помогают уточнить выбор.",
  },
  {
    icon: ScanLine,
    title: "Затем проверка совпадений",
    text: "Сервис подбора должен исключить занятых на вашу дату и проверить остальные ограничения.",
  },
  {
    icon: MessageSquareText,
    title: "И главное — объяснение",
    text: "До трёх карточек с конкретными причинами выбора. Если вариантов меньше, покажем причину.",
  },
];
export default function AboutSheet({ visible, onClose }) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Выбор, который понятен">
      <View className="gap-7">
        <Eyebrow>Trust ME / Как это устроено</Eyebrow>
        {items.map(({ icon: Icon, title, text }, index) => (
          <View key={title} className="flex-row gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sage">
              <Icon size={22} color={colors.green} strokeWidth={1.5} />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-base font-semibold text-ink">
                0{index + 1}. {title}
              </Text>
              <Text className="text-sm leading-6 text-muted">{text}</Text>
            </View>
          </View>
        ))}
        <View className="rounded-2xl bg-canvas p-4">
          <Text className="text-xs leading-5 text-muted">
            HackAlem AI · Креативные индустрии{"\n"}Команда Fact Check. Профили
            анонимизированы; синтетические записи отмечаются в подборке.
          </Text>
        </View>
      </View>
    </Sheet>
  );
}
