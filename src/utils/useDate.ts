import moment from "moment";

export const getStartAndEndCheckInDateByYearAndMonth = (
  year?: number,
  month?: number
) => {
  const currentYear = year ?? moment().year();
  const currentMonth = month ?? moment().month() + 1;

  const [startCheckInDate, endCheckInDate] = [
    moment([currentYear, currentMonth - 1, 1]).toDate(),
    moment([currentYear, currentMonth - 1, 1])
      .endOf("month")
      .toDate()
  ];

  return [startCheckInDate, endCheckInDate];
};
