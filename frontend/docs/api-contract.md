# Предлагаемый контракт frontend

Это адаптационная граница, **не подтверждённый контракт готового backend**.
После получения Swagger измените `src/services/api.js` и при необходимости `toPayload` в `src/utils/order.js`.

`POST /recommendations` (путь задаётся через EXPO_PUBLIC_RECOMMENDATIONS_PATH).

```json
{
  "city": "Алматы",
  "date": "2026-10-17",
  "event_type": "корпоратив",
  "category": "Ведущий",
  "budget": 800000,
  "duration_hours": null,
  "language": null
}
```

Ответ (пример структуры, не фактическая рекомендация):

```json
{
  "status": "matched",
  "message": "Найдено 2 кандидата. Остальные заняты на выбранную дату.",
  "recommendations": [
    {
      "id": "example-id",
      "anon_name": "Имя из каталога",
      "categories": ["Ведущий"],
      "city": "Алматы",
      "price_from_kzt": 400000,
      "explanation": "Конкретное объяснение backend на основе профиля и условий запроса.",
      "synthetic": false,
      "city_imputed": false,
      "price_imputed": false
    }
  ]
}
```

`matched`: 1–3 карточки; `category_unavailable`: категория отсутствует в городе;
`no_matches`: кандидаты есть, но условия не проходят. У двух последних — пустой массив.
`message` обязателен: для неполной выдачи backend объясняет, почему меньше трёх.
Frontend сохраняет порядок backend и не ранжирует самостоятельно.

Backend отвечает за исключение занятых дат, фильтры, детерминизм и достоверность объяснений.
Ключи LLM остаются на backend; переменные EXPO*PUBLIC*\* видны пользователю приложения.
