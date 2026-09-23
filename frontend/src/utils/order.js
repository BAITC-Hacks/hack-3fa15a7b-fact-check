export const initialOrder = {
  city: "Алматы",
  date: "2026-10-17",
  event_type: "корпоратив",
  category: "Ведущий",
  budget: "800000",
  duration_hours: "",
  language: "",
};
export function validateOrder(order) {
  if (!order.city || !order.category || !order.event_type)
    return "Выберите город, формат и категорию.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(order.date))
    return "Введите дату в формате ГГГГ-ММ-ДД.";
  const date = new Date(`${order.date}T12:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== order.date
  )
    return "Такой даты не существует.";
  if (order.date < "2026-09-23" || order.date > "2026-12-31")
    return "Календари доступны с 23.09 по 31.12.2026.";
  if (!Number.isFinite(Number(order.budget)) || Number(order.budget) <= 0)
    return "Укажите бюджет больше нуля.";
  if (
    order.duration_hours &&
    (!Number.isFinite(Number(order.duration_hours)) ||
      Number(order.duration_hours) <= 0)
  )
    return "Длительность должна быть больше нуля.";
  return null;
}
export const toPayload = (order) => ({
  ...order,
  budget: Number(order.budget),
  duration_hours: order.duration_hours ? Number(order.duration_hours) : null,
  language: order.language || null,
});
