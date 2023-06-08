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
  Example
} from "tsoa";
import { TsoaResponse } from "src/utils/responseTsoaError";

import { BuddhaSevenApplyStatus } from "../enums/buddhaSevenApplies.enum";
import { responseSuccess } from "../utils/responseSuccess";
import { BuddhaSevenCheckInService } from "../services/buddhaSeven/buddhaSevenCheckIn.service";
import { BuddhaSevenApplyCheckInUpdateRequest } from "../models";

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
   * 在今日佛七預約報名表搜尋目標手機或是市話的報名
   * @param mobileOrPhone 手機或是市話
   */
  @Get("{mobileOrPhone}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApplyView: {
        Id: 9,
        UserId: 17,
        Name: "林某某",
        DharmaName: "普乙",
        IsMonk: false,
        IsMale: false,
        StayIdentity: 2,
        StayIdentityName: "常住法眷",
        Mobile: "0917123123",
        Phone: "031234123",
        EatBreakfast: false,
        EatLunch: false,
        EatDinner: false,
        RoomId: 10101,
        BedStayOrderNumber: 2,
        CheckInDate: "2023-06-08T00:00:00.000Z",
        CheckOutDate: "2023-06-15T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: "1970-01-01T06:12:44.000Z",
        CheckInUserId: 4,
        CheckInUserName: "Hiro4",
        CheckInUserDharmaName: null,
        CheckInUserIsMale: true,
        Status: "已報到佛七",
        Remarks: "CheckInTest",
        UpdateUserId: 4,
        UpdateUserName: "Hiro4",
        UpdateUserDharmaName: null,
        UpdateUserIsMale: true,
        UpdateAt: "2023-06-08T05:48:26.000Z"
      }
    }
  })
  public async getBuddhaSevenCheckInById(
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    @Path() mobileOrPhone: string
  ) {
    const buddhaSevenApplyView =
      await this._buddhaSevenCheckIn.findOneByMobileOrPhoneOfTodayApplies(
        mobileOrPhone
      );
    if (!buddhaSevenApplyView) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此手機，請確認"
      });
    }
    return responseSuccess("查詢成功", { buddhaSevenApplyView });
  }

  /**
   * 修改佛七報名資料，狀態從"已報名佛七"修改為"已報到佛七"。
   * @param id 報名序號
   */
  @Patch("{id}")
  @SuccessResponse(StatusCodes.OK, "報到成功")
  @Response(StatusCodes.BAD_REQUEST, "報到失敗")
  @Example({
    status: true,
    message: "報到成功"
  })
  public async patchBuddhaSevenCheckInById(
    @Path() id: number,
    @Body()
    buddhaSevenApplyCheckInUpdateRequest: BuddhaSevenApplyCheckInUpdateRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const isExisted = await this._buddhaSevenCheckIn.findOneByIdAndStatus(
      id,
      BuddhaSevenApplyStatus.APPLIED
    );
    if (!isExisted) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此佛七報名資料或已報到完成"
      });
    }

    const buddhaSevenApply = this._buddhaSevenCheckIn.checkInOneById(
      id,
      buddhaSevenApplyCheckInUpdateRequest
    );
    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "報到失敗"
      });
    }

    return responseSuccess("報到成功");
  }
}
