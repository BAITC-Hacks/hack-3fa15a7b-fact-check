import rawContractors from "../data/contractors.json";

const splitField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return String(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toBoolean = (value) => {
  return value === true || String(value).toLowerCase() === "true";
};

const normalizeContractor = (contractor) => ({
  ...contractor,

  categories: splitField(contractor.categories),
  event_formats: splitField(contractor.event_formats),
  languages: splitField(contractor.languages),
  busy_dates: splitField(contractor.busy_dates),

  price_from_kzt: Number(contractor.price_from_kzt) || 0,

  max_hours:
    contractor.max_hours === "" ||
    contractor.max_hours === null ||
    contractor.max_hours === undefined
      ? null
      : Number(contractor.max_hours),

  synthetic: toBoolean(contractor.synthetic),
  city_imputed: toBoolean(contractor.city_imputed),
  price_imputed: toBoolean(contractor.price_imputed),
});

export const contractors = rawContractors.map(normalizeContractor);

export const getContractors = () => contractors;