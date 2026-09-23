import { readFileSync } from 'node:fs';

export const calendar = { from: '2026-09-23', to: '2026-12-31' };
const norm = x => String(x ?? '').normalize('NFKC').trim().toLowerCase().replaceAll('ё', 'е').replace(/\s+/g, ' ');
const has = (xs, x) => xs.some(v => norm(v) === norm(x));
const split = x => (Array.isArray(x) ? x : String(x ?? '').split('|')).map(v => String(v).trim()).filter(Boolean);
const bool = x => x === true || norm(x) === 'true';
const number = x => x === null || x === undefined || x === '' ? null : Number(x);
export class ApiError extends Error {
  constructor(statusCode, status, message) { super(message); this.statusCode = statusCode; this.status = status; }
}

export function loadContractors(path) {
  const rows = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(rows) || !rows.length) throw new Error('Dataset must be a non-empty array');
  const ids = new Set();
  return rows.map(row => {
    const c = { ...row };
    for (const k of ['categories', 'event_formats', 'languages', 'busy_dates']) c[k] = split(c[k]);
    for (const k of ['synthetic', 'city_imputed', 'price_imputed']) c[k] = bool(c[k]);
    c.price_from_kzt = number(c.price_from_kzt);
    c.max_hours = number(c.max_hours);
    if (typeof c.id !== 'string' || !c.id || ids.has(c.id) || typeof c.anon_name !== 'string' ||
        typeof c.city !== 'string' || !c.categories.length ||
        !Number.isFinite(c.price_from_kzt) || c.price_from_kzt < 0 ||
        (c.max_hours !== null && (!Number.isFinite(c.max_hours) || c.max_hours <= 0)) ||
        c.busy_dates.some(d => !validDate(d))) throw new Error(`Invalid contractor: ${c.id}`);
    ids.add(c.id);
    return c;
  });
}

function validDate(x) {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(`${x}T00:00:00Z`);
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === x;
}
export function validate(body) {
  const fail = message => { throw new ApiError(400, 'invalid_request', message); };
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('Тело запроса должно быть JSON-объектом.');
  const allowed = ['city', 'date', 'event_type', 'category', 'budget', 'duration_hours', 'language'];
  if (Object.keys(body).some(k => !allowed.includes(k))) fail('Неизвестное поле запроса. Используйте city, date, event_type, category, budget, duration_hours, language.');
  for (const k of ['city', 'event_type', 'category']) {
    if (typeof body[k] !== 'string' || !body[k].trim() || body[k].length > 120) fail(`Поле ${k}: нужна непустая строка до 120 символов.`);
  }
  if (!validDate(body.date)) fail('date: нужна существующая дата в формате YYYY-MM-DD.');
  if (body.date < calendar.from || body.date > calendar.to) throw new ApiError(422, 'date_out_of_range', `Календарь доступен только с ${calendar.from} по ${calendar.to}; занятость вне этого периода неизвестна.`);
  if (typeof body.budget !== 'number' || !Number.isFinite(body.budget) || body.budget < 0 || body.budget > Number.MAX_SAFE_INTEGER) fail('budget: нужно неотрицательное число в тенге.');
  if (body.duration_hours != null && (typeof body.duration_hours !== 'number' || !Number.isFinite(body.duration_hours) || body.duration_hours <= 0)) fail('duration_hours: нужно положительное число или null.');
  if (body.language != null && (typeof body.language !== 'string' || !body.language.trim() || body.language.length > 120)) fail('language: нужна непустая строка или null.');
  return { ...body, city: body.city.trim(), category: body.category.trim(), event_type: body.event_type.trim(), language: body.language?.trim() ?? null, duration_hours: body.duration_hours ?? null };
}

// Transparent lexical relevance: event roots in the source description, not text length.
const roots = { 'корпоратив': ['корпоратив'], 'свадьба': ['свад'], 'той': ['той', 'тоя'], 'конференция': ['конференц'], 'юбилей': ['юбиле'], 'день рождения': ['день рождения', 'дня рождения'] };
function relevantSnippet(c, q) {
  const keys = roots[norm(q.event_type)] ?? [norm(q.event_type)];
  const parts = String(c.description ?? '').split(/(?<=[.!?])\s+|[\r\n]+/).map(s => s.trim()).filter(Boolean);
  const text = parts.find(s => keys.some(k => norm(s).includes(k))) ?? parts[0] ?? '';
  return { relevant: parts.some(s => keys.some(k => norm(s).includes(k))), text: text.length > 220 ? text.slice(0, 217).trimEnd() + '…' : text };
}
function score(c, q) {
  const ratio = q.budget === 0 ? 0 : c.price_from_kzt / q.budget;
  return (ratio <= .7 ? 30 : ratio <= .85 ? 27 : 24) + 25 + (q.language ? 15 : 0) +
    (q.duration_hours != null ? 15 : 0) + (relevantSnippet(c, q).relevant ? 15 : 0);
}
const money = n => new Intl.NumberFormat('ru-RU').format(n);
function explain(c, q) {
  const facts = [`${c.anon_name}: ${c.city}`, `формат «${q.event_type}» есть в профиле`,
    `цена от ${money(c.price_from_kzt)} ₸ при бюджете ${money(q.budget)} ₸`, `на ${q.date} в календаре нет занятости`];
  if (q.language) facts.push(`язык: ${q.language}`);
  if (q.duration_hours != null) facts.push(c.max_hours === null ? 'услуга не привязана к часам присутствия' : `лимит ${c.max_hours} ч покрывает запрошенные ${q.duration_hours} ч`);
  if (c.synthetic) facts.push('синтетический профиль');
  if (c.city_imputed) facts.push('город заполнен при подготовке датасета');
  if (c.price_imputed) facts.push('цена заполнена при подготовке датасета');
  const snippet = relevantSnippet(c, q).text;
  return `${facts.join('; ')}. ${snippet ? `Из описания: «${snippet}»; ` : ''}Окончательную стоимость нужно уточнить.`;
}
const reasons = {
  busy: 'заняты на выбранную дату', budget: 'цена выше бюджета', format: 'не берут этот формат',
  language: 'не указан нужный язык', duration: 'лимит часов меньше нужного',
};
export function recommend(rows, input) {
  const q = validate(input);
  const pool = rows.filter(c => norm(c.city) === norm(q.city) && has(c.categories, q.category));
  if (!pool.length) return { status: 'no_category_in_city', message: `В городе «${q.city}» нет подрядчиков категории «${q.category}» в этом каталоге.`, recommendations: [] };
  const rejected = Object.fromEntries(Object.keys(reasons).map(k => [k, 0]));
  const matches = pool.filter(c => {
    // Count each rejection once, at its first failed constraint.
    const reason = c.busy_dates.includes(q.date) ? 'busy' : c.price_from_kzt > q.budget ? 'budget' :
      !has(c.event_formats, q.event_type) ? 'format' : q.language && !has(c.languages, q.language) ? 'language' :
      q.duration_hours != null && c.max_hours !== null && c.max_hours < q.duration_hours ? 'duration' : null;
    if (reason) { rejected[reason]++; return false; }
    return true;
  });
  matches.sort((a, b) => score(b, q) - score(a, q) || a.price_from_kzt - b.price_from_kzt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const details = Object.entries(rejected).filter(([, n]) => n).map(([k, n]) => `${reasons[k]}: ${n}`).join('; ');
  if (!matches.length) return { status: 'no_matches', message: `Ни один из ${pool.length} подрядчиков не прошёл условия: ${details}. Причины подсчитаны по первому непройденному условию.`, recommendations: [] };
  const recommendations = matches.slice(0, 3).map(c => ({
    id: c.id, anon_name: c.anon_name, categories: c.categories, city: c.city, price_from_kzt: c.price_from_kzt,
    explanation: explain(c, q), synthetic: c.synthetic, city_imputed: c.city_imputed, price_imputed: c.price_imputed,
  }));
  let message = recommendations.length === 1 ? 'Найден один подходящий подрядчик.' : `Найдено ${recommendations.length} подходящих подрядчика.`;
  if (recommendations.length < 3) message += ` В категории и городе всего ${pool.length}. ` + (details ? `Остальные исключены: ${details} (первое непройденное условие).` : 'Все доступные кандидаты показаны.');
  return { status: 'matched', message, recommendations };
}
export function catalog(rows) {
  const unique = values => [...new Set(values)].sort();
  return { cities: unique(rows.map(c => c.city)), categories: unique(rows.flatMap(c => c.categories)),
    event_types: unique(rows.flatMap(c => c.event_formats)), languages: unique(rows.flatMap(c => c.languages)),
    calendar, contractor_count: rows.length };
}
