export function formatSavedMenuToDayDetails(orderMenu) {
  if (!orderMenu?.days?.length) {
    return {};
  }

  const formattedDays = {};

  orderMenu.days.forEach((day) => {
    formattedDays[day.day] = {
      day: day.day,
      date: day.date,
      times: {
        Morning: {
          persons: day.times?.Morning?.persons || 0,
          items: day.times?.Morning?.items || [],
        },
        Afternoon: {
          persons: day.times?.Afternoon?.persons || 0,
          items: day.times?.Afternoon?.items || [],
        },
        Evening: {
          persons: day.times?.Evening?.persons || 0,
          items: day.times?.Evening?.items || [],
        },
        Night: {
          persons: day.times?.Night?.persons || 0,
          items: day.times?.Night?.items || [],
        },
      },
    };
  });

  return formattedDays;
}
