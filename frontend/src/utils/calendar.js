export const MIN_DATE = "2026-09-23";
export const MAX_DATE = "2026-12-31";
export const months = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];
export function calendarDays(month) {
  const start = (new Date(Date.UTC(2026, month, 1)).getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(2026, month + 1, 0)).getUTCDate();
  const cells = Array.from(
    { length: Math.ceil((start + length) / 7) * 7 },
    (_, i) => {
      const day = i - start + 1;
      if (day < 1 || day > length) return null;
      const date = `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { day, date, disabled: date < MIN_DATE || date > MAX_DATE };
    },
  );
  return cells;
}
export function formatDate(value, short = false) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Выберите дату";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: short ? "short" : "long",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
}
export function money(value) {
  return Number(value || 0).toLocaleString("ru-RU");
}
