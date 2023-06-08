import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Get,
  Path,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  Patch,
  Example,
  Queries
} from "tsoa";

import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import { BuddhaSevenCheckInService } from "../services/buddhaSeven/buddhaSevenCheckIn.service";
import {
  BuddhaSevenCheckInCancelRequest,
  BuddhaSevenCheckInUpdateRequest,
  BuddhaSevenApplyGetManyRequest
} from "../models";

@Tags("Buddha seven check-in - 佛七報到")
@Route("/api/buddha-seven/check-ins")
export class BuddhaSevenCheckInController extends Controller {
  constructor(
    private readonly _buddhaSevenCheckIn = new BuddhaSevenCheckInService()
  ) {
    super();
  }

  /**
   * 取得今日佛七預約報名表
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApplies: [
        {
          Id: 5,
          UserId: 5,
          RoomId: 50703,
          BedStayOrderNumber: 1,
          CheckInDate: "2023-06-03T00:00:00.000Z",
          CheckOutDate: "2023-06-10T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: "1970-01-01T05:52:31.000Z",
          CheckInUserId: 4,
          Status: "已報到佛七",
          Remarks: "CheckInTest",
          UpdateUserId: 4,
          UpdateAt: "2023-06-03T05:52:32.000Z"
        }
      ]
    }
  })
  public async getAllBuddhaSevenCheckIns() {
    const buddhaSevenApplies =
      await this._buddhaSevenCheckIn.findManyOfTodayApplies();
    return responseSuccess("查詢成功", { buddhaSevenApplies });
  }

  /**
   * 取得單筆佛七報名狀態為"已報名佛七"的資料
   * @param id 報名序號
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenCheckIn: {
        Id: 10,
        UserId: 45,
        RoomId: null,
        BedStayOrderNumber: null,
        CheckInDate: "2023-06-01T00:00:00.000Z",
        CheckOutDate: "2023-06-07T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: "1970-01-01T06:17:39.000Z",
        CheckInUserId: 4,
        Status: "已報到佛七",
        Remarks: "CheckInTest",
        UpdateUserId: 4,
        UpdateAt: "2023-06-03T06:17:39.000Z"
      }
    }
  })
  public async getBuddhaSevenCheckInById(
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    return this._buddhaSevenCheckIn.findOneByIdAndStatus(id);
    // return this._buddhaSevenCheckIn.findOneById(id, errorResponse);
  }

  // /**
  //  * 修改佛七報名資料，狀態從"已報名佛七"修改為"已報到佛七"。
  //  * @param id 報名序號
  //  */
  // @Patch("{id}")
  // @SuccessResponse(StatusCodes.OK, "報到成功")
  // @Response(StatusCodes.BAD_REQUEST, "報到失敗")
  // @Example({
  //   status: true,
  //   message: "報到成功"
  // })
  // public async patchBuddhaSevenCheckInById(
  //   @Path() id: number,
  //   @Body() buddhaSevenCheckInUpdateRequest: BuddhaSevenCheckInUpdateRequest,
  //   @Res()
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >
  // ) {
  //   return this._buddhaSevenCheckIn.updateOneById(
  //     id,
  //     buddhaSevenCheckInUpdateRequest,
  //     errorResponse
  //   );
  // }

  // /**
  //  * 修改佛七報名資料，狀態從"已報名佛七"修改為"已取消掛單"。
  //  * @param id 報名序號
  //  */
  // @Patch("cancel/{id}")
  // @SuccessResponse(StatusCodes.OK, "已取消掛單")
  // @Response(StatusCodes.BAD_REQUEST, "取消失敗")
  // @Example({
  //   status: true,
  //   message: "取消成功"
  // })
  // public async cancelBuddhaSevenCheckInById(
  //   @Path() id: number,
  //   @Body() buddhaSevenCheckInCancelRequest: BuddhaSevenCheckInCancelRequest,
  //   @Res()
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >
  // ) {
  //   return this._buddhaSevenCheckIn.cancelOneById(
  //     id,
  //     buddhaSevenCheckInCancelRequest,
  //     errorResponse
  //   );
  // }
}
