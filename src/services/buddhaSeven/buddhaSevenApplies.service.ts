import moment from "moment";
import { Prisma } from "@prisma/client";

import prisma from "../../configs/prismaClient";
import {
  BuddhaSevenApplyCheckDate,
  BuddhaSevenApplyGetManyRequest
} from "../../models";
import { BuddhaSevenApplyStatus } from "../../enums/buddhaSevenApplies.enum";
import {
  getEndDateFromYearAndMonth,
  getStartDateFromYearAndMonth
} from "../../utils/useDate";

export class BuddhaSevenAppliesService {
  constructor(private readonly prismaClient = prisma) {}

  async findMany(findManyArgs: Prisma.buddha_seven_applyFindManyArgs) {
    const buddhaSevenApplies =
      await this.prismaClient.buddha_seven_apply.findMany(findManyArgs);

    return buddhaSevenApplies;
  }

  async findManyByRequests(getManyRequest: BuddhaSevenApplyGetManyRequest) {
    const { year, month, order, take, skip, status } = getManyRequest;
    const parsedYear = year || moment().year();
    const parsedMonth = month || moment().month() + 1;
    const startCheckInDate = getStartDateFromYearAndMonth(
      parsedYear,
      parsedMonth
    );
    const endCheckInDate = getEndDateFromYearAndMonth(parsedYear, parsedMonth);
    const Status = status;

    const findManyArgs: Prisma.buddha_seven_applyFindManyArgs = {
      where: {
        CheckInDate: {
          gte: startCheckInDate,
          lt: endCheckInDate
        },
        Status
      },
      orderBy: { Id: order || "asc" },
      take: take || 100,
      skip: skip || 0
    };

    const buddhaSevenApplies = await this.findMany(findManyArgs);

    return buddhaSevenApplies;
  }

  async findOneByIdAndStatus(id: number, status?: BuddhaSevenApplyStatus) {
    const buddhaSevenApply =
      await this.prismaClient.buddha_seven_apply.findFirst({
        where: { Id: id, Status: status }
      });
    return buddhaSevenApply;
  }

  async createOne(createInputs: Prisma.buddha_seven_applyCreateInput) {
    const createdBuddhaSevenApply =
      await this.prismaClient.buddha_seven_apply.create({
        data: createInputs
      });
    return createdBuddhaSevenApply;
  }

  async updateOneByIdAndUpdateData(
    id: number,
    updateInputs: Prisma.buddha_seven_applyUpdateInput
  ) {
    const updatedBuddhaSevenApply =
      await this.prismaClient.buddha_seven_apply.update({
        where: {
          Id: id
        },
        data: {
          ...updateInputs
        }
      });

    return updatedBuddhaSevenApply;
  }

  async checkIfDateOverlap(buddhaApplyCheckDate: BuddhaSevenApplyCheckDate) {
    const { UserId, CheckInDate, CheckOutDate } = buddhaApplyCheckDate;

    const buddhaApplyIsOverlap =
      await this.prismaClient.buddha_seven_apply.findFirst({
        where: {
          UserId,
          OR: [
            {
              CheckInDate: { lte: CheckOutDate },
              CheckOutDate: { gte: CheckInDate }
            }
          ]
        }
      });

    return Boolean(buddhaApplyIsOverlap);
  }
}
