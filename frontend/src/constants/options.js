import {
  Mic2,
  Camera,
  Building2,
  Flower2,
  Palette,
  Gift,
  HeartHandshake,
  Images,
  Hotel,
  Music2,
  BriefcaseBusiness,
  Heart,
  PartyPopper,
  Presentation,
  Cake,
  Sparkles,
} from "lucide-react-native";
export const eventOptions = [
  { value: "корпоратив", label: "Корпоратив", icon: BriefcaseBusiness },
  { value: "свадьба", label: "Свадьба", icon: Heart },
  { value: "той", label: "Той", icon: PartyPopper },
  { value: "конференция", label: "Конференция", icon: Presentation },
  { value: "юбилей", label: "Юбилей", icon: Sparkles },
  { value: "день рождения", label: "День рождения", icon: Cake },
];
export const categoryOptions = [
  { value: "Ведущий", icon: Mic2, detail: "Ритм и атмосфера" },
  { value: "Фотограф", icon: Camera, detail: "Моменты в кадре" },
  { value: "Банкетный зал", icon: Building2, detail: "Место встречи" },
  { value: "Флорист", icon: Flower2, detail: "Цветы и композиции" },
  { value: "Декоратор", icon: Palette, detail: "Визуальная история" },
  { value: "Подарки и сувениры", icon: Gift, detail: "Знаки внимания" },
  {
    value: "Ведущий церемонии",
    icon: HeartHandshake,
    detail: "Особенные слова",
  },
  { value: "Фото и видеобудки", icon: Images, detail: "Живые впечатления" },
  { value: "Отель", icon: Hotel, detail: "Комфорт для гостей" },
  { value: "Инструменталист", icon: Music2, detail: "Живой звук" },
];
export const languages = [
  { value: "", label: "Любой" },
  { value: "русский", label: "Русский" },
  { value: "казахский", label: "Қазақша" },
  { value: "английский", label: "English" },
];
export const steps = ["Событие", "Подрядчик", "Пожелания"];
