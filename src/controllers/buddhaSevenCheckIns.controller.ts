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
import { BuddhaSevenApplyCheckInRequest } from "../models";

@Tags("Buddha seven check-in - 佛七報到")
@Route("/api/buddha-seven/check-ins")
export class BuddhaSevenCheckInController extends Controller {
  constructor(
    private readonly _buddhaSevenCheckIn = new BuddhaSevenCheckInService()
  ) {
    super();
  }

  /**
   * 取得今日佛七預約報名表(不含四眾個資)
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
  public async getAllBuddhaSevenAppliesOfToday() {
    const buddhaSevenApplies =
      await this._buddhaSevenCheckIn.findManyOfTodayApplies();
    return responseSuccess("查詢成功", { buddhaSevenApplies });
  }

  /**
   * 取得今日佛七預約報名表(含四眾個資)
   */
  @Get("/views")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApplyViews: [
        {
          Id: 7,
          UserId: 13,
          Name: "王某某",
          DharmaName: "普某",
          IsMonk: false,
          IsMale: true,
          StayIdentity: 3,
          StayIdentityName: "佛七蓮友",
          Mobile: "0911123123",
          Phone: "039590000",
          EatBreakfast: false,
          EatLunch: false,
          EatDinner: true,
          RoomId: 40501,
          BedStayOrderNumber: 1,
          CheckInDate: "2023-06-09T00:00:00.000Z",
          CheckOutDate: "2023-06-07T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: null,
          CheckInUserId: null,
          CheckInUserName: null,
          CheckInUserDharmaName: null,
          CheckInUserIsMale: null,
          Status: "已取消掛單",
          Remarks: null,
          UpdateUserId: 11,
          UpdateUserName: null,
          UpdateUserDharmaName: "普某",
          UpdateUserIsMale: true,
          UpdateAt: "2023-06-09T04:52:12.000Z"
        }
      ]
    }
  })
  public async getAllBuddhaSevenApplyViewsOfToday() {
    const buddhaSevenApplyViews =
      await this._buddhaSevenCheckIn.findManyViewsOfTodayApplies();
    return responseSuccess("查詢成功", { buddhaSevenApplyViews });
  }

  /**
   * 在今日佛七預約報名表搜尋目標手機或是市話的報名(含四眾個資)
   * @param mobileOrPhone 手機或是市話
   */
  @Get("/views/{mobileOrPhone}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApplyView: {
        Id: 7,
        UserId: 13,
        Name: "王某某",
        DharmaName: "普某",
        IsMonk: false,
        IsMale: true,
        StayIdentity: 3,
        StayIdentityName: "佛七蓮友",
        Mobile: "0911123123",
        Phone: "039590000",
        EatBreakfast: false,
        EatLunch: false,
        EatDinner: true,
        RoomId: 40501,
        BedStayOrderNumber: 1,
        CheckInDate: "2023-06-09T00:00:00.000Z",
        CheckOutDate: "2023-06-07T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        CheckInUserName: null,
        CheckInUserDharmaName: null,
        CheckInUserIsMale: null,
        Status: "已取消掛單",
        Remarks: null,
        UpdateUserId: 11,
        UpdateUserName: null,
        UpdateUserDharmaName: "普某",
        UpdateUserIsMale: true,
        UpdateAt: "2023-06-09T04:52:12.000Z"
      }
    }
  })
  public async getBuddhaSevenApplyViewByMobileOrPhoneOfToday(
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    @Path() mobileOrPhone: string
  ) {
    const buddhaSevenApplyView =
      await this._buddhaSevenCheckIn.findOneViewByMobileOrPhoneOfTodayApplies(
        mobileOrPhone
      );
    if (!buddhaSevenApplyView) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此手機，請確認是否報名成功。"
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
  public async checkInBuddhaSevenApplyByIdAndRequest(
    @Path() id: number,
    @Body()
    buddhaSevenApplyCheckInRequest: BuddhaSevenApplyCheckInRequest,
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
      buddhaSevenApplyCheckInRequest
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
