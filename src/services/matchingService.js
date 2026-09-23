// src/services/matchingService.js
import { contractors } from "./dataService";
const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const includesNormalized = (array = [], value) => {
  const target = normalize(value);

  return array.some((item) => normalize(item) === target);
};

const parsePrice = (price) => {
  if (typeof price === "number") return price;

  return Number(
    String(price ?? "")
      .replace(/[^\d]/g, "")
  );
};

const normalizeDate = (value) => {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();

  // Handles values like:
  // 2026-10-06
  // 2026-10-06T00:00:00.000Z
  return stringValue.slice(0, 10);
};

const isAvailable = (contractor, requestedDate) => {
  if (!requestedDate) return true;

  const targetDate = normalizeDate(requestedDate);

  return !(contractor.busy_dates || []).some(
    (busyDate) => normalizeDate(busyDate) === targetDate
  );
};

const matchesCategory = (contractor, category) => {
  if (!category) return true;

  return includesNormalized(contractor.categories, category);
};

const matchesCity = (contractor, city) => {
  if (!city) return true;

  return normalize(contractor.city) === normalize(city);
};

const matchesEventFormat = (contractor, eventFormat) => {
  if (!eventFormat) return true;

  return includesNormalized(contractor.event_formats, eventFormat);
};

const matchesLanguage = (contractor, language) => {
  if (!language) return true;

  return includesNormalized(contractor.languages, language);
};

const matchesBudget = (contractor, budget) => {
  if (budget == null || budget === "") return true;

  const price = parsePrice(contractor.price_from_kzt);

  return price <= Number(budget);
};

const matchesDuration = (contractor, duration) => {
  if (duration == null || duration === "") return true;

  // null means the contractor is not tied to presence on site.
  if (contractor.max_hours == null) return true;

  return Number(contractor.max_hours) >= Number(duration);
};

/**
 * Creates concrete reasons for recommending a contractor.
 * These reasons are based ONLY on actual dataset fields.
 */
const buildReasons = (contractor, request) => {
  const reasons = [];

  const price = parsePrice(contractor.price_from_kzt);

  if (request.budget && price <= Number(request.budget)) {
    reasons.push(
      `Price starts at ${price.toLocaleString("ru-RU")} ₸, within your ${Number(
        request.budget
      ).toLocaleString("ru-RU")} ₸ budget.`
    );
  }

  if (
    request.eventFormat &&
    matchesEventFormat(contractor, request.eventFormat)
  ) {
    reasons.push(
      `Works with ${request.eventFormat} events.`
    );
  }

  if (
    request.language &&
    matchesLanguage(contractor, request.language)
  ) {
    reasons.push(
      `Works in ${request.language}.`
    );
  }

  if (
    request.duration &&
    contractor.max_hours != null &&
    Number(contractor.max_hours) >= Number(request.duration)
  ) {
    reasons.push(
      `Supports the requested ${request.duration}-hour duration.`
    );
  }

  if (request.date && isAvailable(contractor, request.date)) {
    reasons.push(
      `Available on ${request.date}.`
    );
  }

  return reasons.slice(0, 3);
};


/**
 * Calculates a deterministic recommendation score.
 *
 * Maximum:
 * Budget        30
 * Event format  25
 * Language      15
 * Duration      15
 * Description   15
 * ----------------
 * Total         100
 */
const calculateScore = (contractor, request) => {
  let score = 0;

  const price = parsePrice(contractor.price_from_kzt);

  // Budget: closer to the requested budget gets a higher score.
  if (request.budget) {
    const budget = Number(request.budget);

    if (price <= budget) {
      const ratio = price / budget;

      if (ratio >= 0.8) {
        score += 30;
      } else if (ratio >= 0.6) {
        score += 27;
      } else if (ratio >= 0.4) {
        score += 24;
      } else {
        score += 20;
      }
    }
  }

  // Event format
  if (
    request.eventFormat &&
    matchesEventFormat(contractor, request.eventFormat)
  ) {
    score += 25;
  }

  // Language
  if (
    request.language &&
    matchesLanguage(contractor, request.language)
  ) {
    score += 15;
  }

  // Duration
  if (
    request.duration &&
    contractor.max_hours != null &&
    Number(contractor.max_hours) >= Number(request.duration)
  ) {
    score += 15;
  }

  // Description relevance.
  //
  // This is intentionally simple and deterministic for the MVP.
  // Later this can be replaced by embeddings.
  if (request.eventFormat && contractor.description) {
    const description = normalize(contractor.description);
    const event = normalize(request.eventFormat);

    if (description.includes(event)) {
      score += 15;
    } else {
      score += 8;
    }
  }

  return score;
};


/**
 * Find up to 3 suitable contractors.
 */
export const findMatches = (contractors, request) => {
  if (!Array.isArray(contractors)) {
    throw new Error("Contractors must be an array.");
  }

  const candidates = contractors
    // HARD FILTERS
    .filter((contractor) =>
      matchesCategory(contractor, request.category)
    )
    .filter((contractor) =>
      matchesCity(contractor, request.city)
    )
    .filter((contractor) =>
      isAvailable(contractor, request.date)
    )
    .filter((contractor) =>
      matchesBudget(contractor, request.budget)
    )
    .filter((contractor) =>
      matchesEventFormat(contractor, request.eventFormat)
    )
    .filter((contractor) =>
      matchesLanguage(contractor, request.language)
    )
    .filter((contractor) =>
      matchesDuration(contractor, request.duration)
    )

    // SCORING
    .map((contractor) => ({
      ...contractor,
      score: calculateScore(contractor, request),
      reasons: buildReasons(contractor, request),
    }));

  // DETERMINISTIC ORDER:
  // score ↓, price ↑, id ↑
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    const priceA = parsePrice(a.price_from_kzt);
    const priceB = parsePrice(b.price_from_kzt);

    if (priceA !== priceB) {
      return priceA - priceB;
    }

    return String(a.id).localeCompare(String(b.id));
  });

  return candidates.slice(0, 3);
};


/**
 * Explains why fewer than 3 results were returned.
 */
export const explainNoOrFewResults = (contractors, request) => {
  const categoryMatches = contractors.filter((c) =>
    matchesCategory(c, request.category)
  );

  if (categoryMatches.length === 0) {
    return `No contractors found in the "${request.category}" category.`;
  }

  const cityMatches = categoryMatches.filter((c) =>
    matchesCity(c, request.city)
  );

  if (cityMatches.length === 0) {
    return `There are no "${request.category}" contractors in ${request.city}.`;
  }

  const unavailable = cityMatches.filter(
    (c) => !isAvailable(c, request.date)
  );

  const available = cityMatches.filter(
    (c) => isAvailable(c, request.date)
  );

  const formatMatches = available.filter((c) =>
    matchesEventFormat(c, request.eventFormat)
  );

  const budgetMatches = formatMatches.filter((c) =>
    matchesBudget(c, request.budget)
  );

  const languageMatches = budgetMatches.filter((c) =>
    matchesLanguage(c, request.language)
  );

  const durationMatches = languageMatches.filter((c) =>
    matchesDuration(c, request.duration)
  );

  const reasons = [];

  if (unavailable.length > 0) {
    reasons.push(`${unavailable.length} unavailable on the selected date`);
  }

  if (formatMatches.length < available.length) {
    reasons.push(
      `${available.length - formatMatches.length} do not support the selected event format`
    );
  }

  if (budgetMatches.length < formatMatches.length) {
    reasons.push(
      `${formatMatches.length - budgetMatches.length} exceed the budget`
    );
  }

  if (languageMatches.length < budgetMatches.length) {
    reasons.push(
      `${budgetMatches.length - languageMatches.length} do not support the selected language`
    );
  }

  if (durationMatches.length < languageMatches.length) {
    reasons.push(
      `${languageMatches.length - durationMatches.length} cannot support the requested duration`
    );
  }

  if (reasons.length === 0) {
    return "Fewer than 3 contractors match all selected conditions.";
  }

  return `Only ${durationMatches.length} suitable contractor${
    durationMatches.length === 1 ? "" : "s"
  } found. ${reasons.join(", ")}.`;
};