import { contractors } from "./dataService";
import {
  generateExplanation,
  getEmptyResultExplanation,
} from "./explanationService";

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const same = (a, b) => normalize(a) === normalize(b);

const getBudgetScore = (price, budget) => {
  if (!budget || budget <= 0) return 0;

  const ratio = price / budget;

  if (ratio <= 0.7) return 30;
  if (ratio <= 0.85) return 27;
  if (ratio <= 1) return 24;

  return 0;
};

const calculateScore = (contractor, request) => {
  let score = 0;

  // Бюджет — до 30
  score += getBudgetScore(
    contractor.price_from_kzt,
    Number(request.budget)
  );

  // Формат — 25
  if (
    request.eventFormat &&
    contractor.event_formats.some((format) =>
      same(format, request.eventFormat)
    )
  ) {
    score += 25;
  }

  // Язык — 15
  if (
    request.language &&
    contractor.languages.some((language) =>
      same(language, request.language)
    )
  ) {
    score += 15;
  }

  // Длительность — 15
  if (request.duration) {
    if (
      contractor.max_hours === null ||
      contractor.max_hours >= Number(request.duration)
    ) {
      score += 15;
    }
  }

  // Описание — до 15
  if (contractor.description) {
    const length = contractor.description.length;

    if (length >= 300) {
      score += 15;
    } else if (length >= 150) {
      score += 10;
    } else {
      score += 5;
    }
  }

  return score;
};

export const findMatches = (request) => {
  const rejectionStats = {
    unavailable: 0,
    overBudget: 0,
    wrongFormat: 0,
    wrongLanguage: 0,
    tooShort: 0,
  };

  // 1. Сначала проверяем:
  // есть ли вообще такая категория в этом городе
  const categoryCandidates = contractors.filter(
    (contractor) =>
      same(contractor.city, request.city) &&
      contractor.categories.some((category) =>
        same(category, request.category)
      )
  );

  // 2. Категории в городе вообще нет
  if (categoryCandidates.length === 0) {
    return {
      status: "NO_CATEGORY_IN_CITY",
      results: [],
      message:
        `В городе ${request.city} нет подрядчиков ` +
        `категории «${request.category}».`,
      rejectionStats,
    };
  }

  const validCandidates = [];

  categoryCandidates.forEach((contractor) => {
    // 3. Занят на выбранную дату
    if (
      request.date &&
      contractor.busy_dates.includes(request.date)
    ) {
      rejectionStats.unavailable++;
      return;
    }

    // 4. Не проходит по бюджету
    if (
      request.budget &&
      contractor.price_from_kzt > Number(request.budget)
    ) {
      rejectionStats.overBudget++;
      return;
    }

    // 5. Не подходит формат мероприятия
    if (
      request.eventFormat &&
      !contractor.event_formats.some((format) =>
        same(format, request.eventFormat)
      )
    ) {
      rejectionStats.wrongFormat++;
      return;
    }

    // 6. Не подходит язык
    if (
      request.language &&
      !contractor.languages.some((language) =>
        same(language, request.language)
      )
    ) {
      rejectionStats.wrongLanguage++;
      return;
    }

    // 7. Не подходит длительность
    if (
      request.duration &&
      contractor.max_hours !== null &&
      contractor.max_hours < Number(request.duration)
    ) {
      rejectionStats.tooShort++;
      return;
    }

    // 8. Кандидат прошёл все hard filters
    const score = calculateScore(contractor, request);

    validCandidates.push({
      ...contractor,
      score,
      explanation: generateExplanation(
        contractor,
        request
      ),
    });
  });

  // 9. Кандидаты были, но все отсеялись
  if (validCandidates.length === 0) {
    return {
      status: "NO_MATCHES",
      results: [],
      message:
        getEmptyResultExplanation(rejectionStats),
      rejectionStats,
    };
  }

  // 10. Детерминированная сортировка
  // score DESC → price ASC → id ASC
  validCandidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (
      a.price_from_kzt !== b.price_from_kzt
    ) {
      return (
        a.price_from_kzt - b.price_from_kzt
      );
    }

    return String(a.id).localeCompare(
      String(b.id)
    );
  });

  // 11. До 3 карточек
  const results =
    validCandidates.slice(0, 3);

  let message = "";

  if (results.length === 3) {
    message =
      "Подобраны 3 подходящих подрядчика.";
  } else {
    message =
      `Найдено ${results.length} подходящих подрядчика. ` +
      `Остальные кандидаты не прошли условия запроса.`;
  }

  return {
    status: "SUCCESS",
    results,
    message,
    rejectionStats,
  };
};