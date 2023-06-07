import moment from "moment";
import { StatusCodes } from "http-status-codes";
import { TsoaResponse } from "src/utils/responseTsoaError";

import prisma from "../../configs/prismaClient";
import {
  BuddhaSevenCheckInCancelRequest,
  BuddhaSevenCheckInUpdateRequest,
  BuddhaSevenGetManyRequest
} from "../../models";
import {
  getEndDateFromYearAndMonth,
  getStartDateFromYearAndMonth
} from "../../utils/useDate";
import { responseSuccess } from "../../utils/responseSuccess";
import { BuddhaSevenStatus } from "../../enums/buddhaSeven.enum";

export class BuddhaSevenCheckInService {
  constructor(private readonly prismaClient = prisma) {}

  async findMany(getManyRequest: BuddhaSevenGetManyRequest) {
    const { year, month, order, take, skip, status } = getManyRequest;
    const parsedYear = year || moment().year();
    const parsedMonth = month || moment().month() + 1;
    const startDate = getStartDateFromYearAndMonth(parsedYear, parsedMonth);
    const endDate = getEndDateFromYearAndMonth(parsedYear, parsedMonth);

    const buddhaSevenCheckIns =
      await this.prismaClient.buddha_seven_apply.findMany({
        orderBy: { Id: order || "desc" },
        take: take || 100,
        skip: skip || 0,
        where: {
          CheckInDate: {
            gte: startDate,
            lt: endDate
          },
          Status: status || BuddhaSevenStatus.CHECKED_IN
        }
      });

    return responseSuccess("查詢成功", { buddhaSevenCheckIns });
  }

  async findOneById(
    id: number,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    status: BuddhaSevenStatus = BuddhaSevenStatus.CHECKED_IN
  ) {
    const buddhaSevenCheckIn = await this.findIfExisted(id, status);

    if (!buddhaSevenCheckIn) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "無此報名序號或尚未報到"
      });
    }

    return responseSuccess("查詢成功", { buddhaSevenCheckIn });
  }

  async updateOneById(
    id: number,
    updatedCheckInData: BuddhaSevenCheckInUpdateRequest,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const targetApplyExist = await this.findIfExisted(
      id,
      BuddhaSevenStatus.APPLIED
    );

    if (!targetApplyExist) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "無此報名序號或已報到完成"
      });
    }

    const updatedBuddhaSevenCheckInData =
      await this.prismaClient.buddha_seven_apply.update({
        where: {
          Id: id
        },
        data: {
          ...updatedCheckInData,
          Status: BuddhaSevenStatus.CHECKED_IN,
          CheckInTime: new Date()
        }
      });

    if (!updatedBuddhaSevenCheckInData) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "報到失敗"
      });
    }

    return responseSuccess("報到成功");
  }

  async cancelOneById(
    id: number,
    buddhaSevenCheckInCancelRequest: BuddhaSevenCheckInCancelRequest,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    status: BuddhaSevenStatus = BuddhaSevenStatus.CHECKED_IN
  ) {
    const buddhaSevenCheckIn = await this.findIfExisted(id, status);

    if (!buddhaSevenCheckIn) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "無此報名序號或尚未報到"
      });
    }

    const cancelledBuddhaSevenCheckIn =
      await this.prismaClient.buddha_seven_apply.update({
        where: {
          Id: id
        },
        data: {
          ...buddhaSevenCheckInCancelRequest,
          Status: BuddhaSevenStatus.CANCELLED
        }
      });

    if (!cancelledBuddhaSevenCheckIn) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "取消失敗"
      });
    }

    return responseSuccess("取消成功");
  }

  private async findIfExisted(
    id: number,
    status: BuddhaSevenStatus = BuddhaSevenStatus.APPLIED
  ) {
    return this.prismaClient.buddha_seven_apply.findFirst({
      where: { Id: id, Status: status }
    });
  }
}
