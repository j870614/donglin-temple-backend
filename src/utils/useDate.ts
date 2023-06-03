export const getStartDateFromYearAndMonth = (year: number, month: number) =>
  new Date(year, month - 1);

export const getEndDateFromYearAndMonth = (year: number, month: number) =>
  new Date(year, month);
