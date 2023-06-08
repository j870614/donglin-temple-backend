import moment from "moment";
import { Prisma } from "@prisma/client";

import { BuddhaSevenAppliesService } from "./buddhaSevenApplies.service";
import {
  BuddhaSevenCheckInCancelRequest,
  BuddhaSevenCheckInUpdateRequest,
  BuddhaSevenApplyGetManyRequest
} from "../../models";
import { BuddhaSevenApplyStatus } from "../../enums/buddhaSevenApplies.enum";

export class BuddhaSevenCheckInService extends BuddhaSevenAppliesService {
  async findManyOfTodayApplies() {
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const findManyArgs: Prisma.buddha_seven_applyFindManyArgs = {
      where: {
        CheckInDate: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: { Id: "asc" },
      take: 100,
      skip: 0
    };

    const buddhaSevenApplies = await this.findMany(findManyArgs);

    return buddhaSevenApplies;
  }

  // async findOneById(
  //   id: number,
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >,
  //   status: BuddhaSevenApplyStatus = BuddhaSevenApplyStatus.CHECKED_IN
  // ) {
  //   const buddhaSevenCheckIn = await this.findIfExisted(id, status);
  //   if (!buddhaSevenCheckIn) {
  //     return errorResponse(StatusCodes.BAD_REQUEST, {
  //       status: false,
  //       message: "無此報名序號或尚未報到"
  //     });
  //   }
  //   return responseSuccess("查詢成功", { buddhaSevenCheckIn });
  // }
  // async updateOneById(
  //   id: number,
  //   updatedCheckInData: BuddhaSevenCheckInUpdateRequest,
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >
  // ) {
  //   const targetApplyExist = await this.findIfExisted(
  //     id,
  //     BuddhaSevenApplyStatus.APPLIED
  //   );
  //   if (!targetApplyExist) {
  //     return errorResponse(StatusCodes.BAD_REQUEST, {
  //       status: false,
  //       message: "無此報名序號或已報到完成"
  //     });
  //   }
  //   const updatedBuddhaSevenCheckInData =
  //     await this.prismaClient.buddha_seven_apply.update({
  //       where: {
  //         Id: id
  //       },
  //       data: {
  //         ...updatedCheckInData,
  //         Status: BuddhaSevenApplyStatus.CHECKED_IN,
  //         CheckInTime: new Date()
  //       }
  //     });
  //   if (!updatedBuddhaSevenCheckInData) {
  //     return errorResponse(StatusCodes.BAD_REQUEST, {
  //       status: false,
  //       message: "報到失敗"
  //     });
  //   }
  //   return responseSuccess("報到成功");
  // }
  // async cancelOneById(
  //   id: number,
  //   buddhaSevenCheckInCancelRequest: BuddhaSevenCheckInCancelRequest,
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >,
  //   status: BuddhaSevenApplyStatus = BuddhaSevenApplyStatus.CHECKED_IN
  // ) {
  //   const buddhaSevenCheckIn = await this.findIfExisted(id, status);
  //   if (!buddhaSevenCheckIn) {
  //     return errorResponse(StatusCodes.BAD_REQUEST, {
  //       status: false,
  //       message: "無此報名序號或尚未報到"
  //     });
  //   }
  //   const cancelledBuddhaSevenCheckIn =
  //     await this.prismaClient.buddha_seven_apply.update({
  //       where: {
  //         Id: id
  //       },
  //       data: {
  //         ...buddhaSevenCheckInCancelRequest,
  //         Status: BuddhaSevenApplyStatus.CANCELLED
  //       }
  //     });
  //   if (!cancelledBuddhaSevenCheckIn) {
  //     return errorResponse(StatusCodes.BAD_REQUEST, {
  //       status: false,
  //       message: "取消失敗"
  //     });
  //   }
  //   return responseSuccess("取消成功");
  // }
  // private async findIfExisted(
  //   id: number,
  //   status: BuddhaSevenApplyStatus = BuddhaSevenApplyStatus.APPLIED
  // ) {
  //   return this.prismaClient.buddha_seven_apply.findFirst({
  //     where: { Id: id, Status: status }
  //   });
  // }
}
