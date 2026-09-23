import { create, isAxiosError } from "axios";
export const isApiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

// This is the frontend contract, not an assertion about the existing backend.
// Adapt this single boundary once the backend OpenAPI is available.
export async function getRecommendations(payload) {
  if (!isApiConfigured)
    throw new Error(
      "Сервис подбора пока не подключён. Ваши условия сохранены в форме — к ним можно вернуться.",
    );
  const { data } = await api.post(
    process.env.EXPO_PUBLIC_RECOMMENDATIONS_PATH || "/recommendations",
    payload,
  );
  const states = ["matched", "category_unavailable", "no_matches"];
  const validCard = (item) =>
    item &&
    typeof item.id === "string" &&
    typeof item.anon_name === "string" &&
    Array.isArray(item.categories) &&
    typeof item.city === "string" &&
    Number.isFinite(item.price_from_kzt) &&
    typeof item.explanation === "string" &&
    item.explanation.trim();
  if (
    !data ||
    !states.includes(data.status) ||
    !Array.isArray(data.recommendations) ||
    data.recommendations.length > 3 ||
    !data.recommendations.every(validCard) ||
    typeof data.message !== "string" ||
    !data.message.trim() ||
    (data.status === "matched"
      ? data.recommendations.length === 0
      : data.recommendations.length !== 0)
  ) {
    throw new Error(
      "Формат ответа сервера не совпадает с контрактом приложения.",
    );
  }
  return data;
}
export function errorMessage(error) {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED")
      return "Подбор занимает больше 10 секунд. Попробуйте ещё раз.";
    return error.response
      ? "Сервис временно не смог выполнить подбор. Попробуйте ещё раз."
      : "Не удалось связаться с сервером. Проверьте подключение.";
  }
  return error.message || "Не удалось выполнить подбор.";
}
