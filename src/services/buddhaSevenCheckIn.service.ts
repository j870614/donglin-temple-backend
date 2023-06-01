import moment from "moment";

import prisma from "../configs/prismaClient";
import { BuddhaSevenGetManyRequest } from "../models";
import {
  getEndDateFromYearAndMonth,
  getStartDateFromYearAndMonth
} from "../utils/useDate";
import { responseSuccess } from "../utils/responseSuccess";

export class BuddhaSevenCheckInService {
  constructor(private readonly prismaClient = prisma) {}

  async getMany(getManyRequest: BuddhaSevenGetManyRequest) {
    const { year, month, order, take, skip } = getManyRequest;

    const parsedYear = year || moment().year();
    const parsedMonth = month || moment().month();
    const orderOption = order || "desc";
    const takeOption = take || 100;
    const skipOption = skip || 0;
    const startDate = getStartDateFromYearAndMonth(parsedYear, parsedMonth);
    const endDate = getEndDateFromYearAndMonth(parsedYear, parsedMonth);

    const buddhaSevenCheckInMonthly =
      await this.prismaClient.buddha_seven_apply.findMany({
        orderBy: { Id: orderOption },
        take: takeOption,
        skip: skipOption,
        where: {
          CheckInDate: {
            gte: startDate,
            lt: endDate
          }
        }
      });

    return responseSuccess("查詢成功", { buddhaSevenCheckInMonthly });
  }
}
