const formatPrice = (price) => {
  return Number(price).toLocaleString("ru-RU") + " ₸";
};

export const generateExplanation = (contractor, request) => {
  const facts = [];

  // 1. Бюджет
  if (request.budget && contractor.price_from_kzt) {
    const remaining =
      Number(request.budget) - Number(contractor.price_from_kzt);

    if (remaining >= 0) {
      facts.push(
        `Цена ${formatPrice(contractor.price_from_kzt)} укладывается ` +
        `в бюджет ${formatPrice(request.budget)}`
      );
    }
  }

  // 2. Формат
  if (
    request.eventFormat &&
    contractor.event_formats.includes(request.eventFormat)
  ) {
    facts.push(
      `работает с форматом «${request.eventFormat}»`
    );
  }

  // 3. Язык
  if (
    request.language &&
    contractor.languages.includes(request.language)
  ) {
    facts.push(
      `работает на ${request.language} языке`
    );
  }

  // 4. Длительность
  if (
    request.duration &&
    contractor.max_hours !== null &&
    contractor.max_hours >= Number(request.duration)
  ) {
    facts.push(
      `может работать до ${contractor.max_hours} ч. при необходимых ${request.duration} ч.`
    );
  }

  // 5. Для услуг без max_hours
  if (
    request.duration &&
    contractor.max_hours === null
  ) {
    facts.push(
      `услуга не привязана к длительности присутствия на площадке`
    );
  }

  // Берём самые полезные факты, чтобы текст не был огромным
  const selectedFacts = facts.slice(0, 3);

  if (selectedFacts.length === 0) {
    return "Подрядчик прошёл все обязательные условия запроса.";
  }

  return (
    selectedFacts
      .map((fact, index) => {
        if (index === 0) {
          return fact.charAt(0).toUpperCase() + fact.slice(1);
        }

        return fact;
      })
      .join("; ") + "."
  );
};