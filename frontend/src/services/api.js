import { create, isAxiosError } from "axios";
export const isApiConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL?.trim());
export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

// Normalize the backend wire status to the existing UI state names.
export async function getRecommendations(payload) {
  const path =
    process.env.EXPO_PUBLIC_RECOMMENDATIONS_PATH || "/recommendations";
  const startedAt = Date.now();
  let response;
  try {
    const configurationError = getConfigurationError();
    if (configurationError) throw configurationError;
    response = await api.post(path, payload);
    const data =
      response.data?.status === "no_category_in_city"
        ? { ...response.data, status: "category_unavailable" }
        : response.data;
    const issues = responseIssues(data);
    if (issues.length) {
      const error = new Error(
        "Формат ответа сервера не совпадает с контрактом приложения.",
      );
      error.code = "INVALID_API_RESPONSE";
      error.validationIssues = issues;
      throw error;
    }
    return data;
  } catch (error) {
    logApiError(error, { path, payload, response, startedAt });
    throw error;
  }
}

function responseIssues(data) {
  if (!data || typeof data !== "object")
    return ["Ответ должен быть JSON-объектом."];
  const issues = [];
  if (!["matched", "category_unavailable", "no_matches"].includes(data.status))
    issues.push(`Неизвестный status: ${String(data.status)}`);
  if (typeof data.message !== "string" || !data.message.trim())
    issues.push("message: ожидается непустая строка.");
  if (!Array.isArray(data.recommendations)) {
    issues.push("recommendations: ожидается массив.");
    return issues;
  }
  if (data.recommendations.length > 3)
    issues.push("recommendations: допускается не больше 3 карточек.");
  if (data.status === "matched" && data.recommendations.length === 0)
    issues.push("При status=matched нужна хотя бы одна карточка.");
  if (data.status !== "matched" && data.recommendations.length !== 0)
    issues.push("Для пустого исхода recommendations должен быть пустым.");
  data.recommendations.forEach((item, index) => {
    const path = `recommendations[${index}]`;
    if (!item || typeof item !== "object") {
      issues.push(`${path}: ожидается объект карточки.`);
      return;
    }
    for (const key of ["id", "anon_name", "city", "explanation"]) {
      if (typeof item[key] !== "string" || !item[key].trim())
        issues.push(`${path}.${key}: ожидается непустая строка.`);
    }
    if (!Array.isArray(item.categories))
      issues.push(`${path}.categories: ожидается массив.`);
    if (!Number.isFinite(item.price_from_kzt))
      issues.push(`${path}.price_from_kzt: ожидается число.`);
  });
  return issues;
}

function getConfigurationError() {
  let code;
  let message;
  if (!isApiConfigured) {
    code = "API_NOT_CONFIGURED";
    message =
      "Не указан EXPO_PUBLIC_API_URL в frontend/.env. Укажите адрес backend и перезапустите Metro.";
  } else {
    try {
      const url = new URL(api.defaults.baseURL);
      if (!["http:", "https:"].includes(url.protocol))
        throw new Error("Invalid protocol");
      if (
        ["railway.com", "www.railway.com", "railway.app"].includes(
          url.hostname,
        ) &&
        url.pathname.startsWith("/project")
      ) {
        code = "API_URL_IS_DASHBOARD";
        message =
          "В EXPO_PUBLIC_API_URL указан адрес панели Railway, а не backend. Нужен публичный домен сервиса из Settings → Networking → Public Networking. Затем перезапустите Metro.";
      }
    } catch {
      code = "INVALID_API_URL";
      message =
        "EXPO_PUBLIC_API_URL должен быть полным адресом backend, начинающимся с http:// или https://.";
    }
  }
  if (!code) return null;
  const error = new Error(message);
  error.code = code;
  return error;
}

function printable(value) {
  if (value === undefined) return "не указано";
  if (value === null) return "null (пустое значение)";
  if (typeof value === "string") return value;
  const seen = new WeakSet();
  try {
    return (
      JSON.stringify(
        value,
        (_key, item) => {
          if (typeof item === "bigint") return String(item);
          if (item && typeof item === "object") {
            if (seen.has(item)) return "[Circular]";
            seen.add(item);
          }
          return item;
        },
        2,
      ) ?? String(value)
    );
  } catch {
    return "[Не удалось сериализовать значение]";
  }
}

function logApiError(error, { path, payload, response, startedAt }) {
  const received = error?.response || response;
  const code = error?.code || "UNKNOWN_ERROR";
  const kind = [
    "API_NOT_CONFIGURED",
    "INVALID_API_URL",
    "API_URL_IS_DASHBOARD",
  ].includes(code)
    ? "configuration"
    : code === "INVALID_API_RESPONSE"
      ? "invalid_response"
      : ["ECONNABORTED", "ETIMEDOUT"].includes(code)
        ? "timeout"
        : received
          ? "http"
          : "network";
  let address = "не настроен";
  try {
    const url = new URL(api.getUri({ url: path }));
    // Exclude credentials and query parameters from console diagnostics.
    address = `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    /* Keep a readable fallback for a missing/invalid base URL. */
  }
  const message = error?.message || printable(error);
  const lines = [
    `[API] ${kind} | ${code} | HTTP ${received?.status ?? "нет ответа"} | ${message}`,
    `Запрос: POST ${address}`,
    `Время: ${Date.now() - startedAt} мс; таймаут: ${error?.config?.timeout ?? api.defaults.timeout} мс`,
    `Параметры: ${printable(payload)}`,
    `Ответ backend: ${received ? printable(received.data) : "не получен"}`,
  ];
  if (error?.validationIssues)
    lines.push(`Ошибки контракта: ${printable(error.validationIssues)}`);
  if (kind === "network")
    lines.push(
      "Проверьте доступность backend с устройства. localhost на телефоне — сам телефон; для web также проверьте CORS.",
    );
  if (error?.stack) lines.push(`Исходный стек: ${error.stack}`);
  // One complete string: LogBox/Metro need not format a separate object argument.
  console.error(lines.join("\n"));
}

export function errorMessage(error) {
  if (isAxiosError(error)) {
    if (["ECONNABORTED", "ETIMEDOUT"].includes(error.code))
      return "Подбор занимает больше 10 секунд. Попробуйте ещё раз.";
    return error.response
      ? "Сервис временно не смог выполнить подбор. Попробуйте ещё раз."
      : "Не удалось связаться с сервером. Проверьте подключение.";
  }
  return error?.message || "Не удалось выполнить подбор.";
}
