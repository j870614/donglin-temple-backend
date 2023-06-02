/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Path,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  Patch,
  Example,
  Delete
} from "tsoa";
import moment from "moment";

import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import prisma from "../configs/prismaClient";

import { BuddhaSevenApplyRequest } from "../models";

@Tags("Buddha seven apply - 佛七報名")
@Route("/api/buddha-seven-apply")
export class BuddhaSevenAppleController extends Controller {
  /**
   * 取得佛七預約報名表
   * @param year 查詢該年度之佛七預約報名表，預設為本年度
   * @param month 查詢該月份之佛七預約報名表，預設為當月
   * @param order 正序("asc") / 倒序("desc")，預設為正序排列
   * @param take 顯示數量，預設為 100 筆
   * @param skip 略過數量
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApplyMonthly: [
        {
          Id: 1,
          UserId: 11,
          Name: null,
          DharmaName: "普某",
          IsMonk: true,
          IsMale: true,
          Mobile: "0901123123",
          Phone: "0395123123",
          RoomId: null,
          BedStayOrderNumber: null,
          CheckInDate: "2023-06-11T00:00:00.000Z",
          CheckOutDate: "2023-06-17T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: null,
          CheckInUserId: null,
          CheckInUserName: null,
          CheckInUserDharmaName: null,
          CheckInUserIsMale: null,
          Status: "已取消",
          Remarks: "修改測試",
          UpdateUserId: 11,
          UpdateUserName: null,
          UpdateUserDharmaName: "普某",
          UpdateUserIsMale: true,
          UpdateAt: "2023-05-27T13:58:10.000Z"
        }
      ]
    }
  })
  public async getAllBuddhaSevenApply(
    @Query() year = Number(moment().year()),
    @Query() month = Number(moment().month()),
    @Query() order: "asc" | "desc" = "asc",
    @Query() take = 100,
    @Query() skip = 0
  ) {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month + 1}-01`);
    const buddhaSevenApplyMonthly =
      await prisma.buddha_seven_apply_view.findMany({
        orderBy: { Id: order },
        take,
        skip,
        where: {
          CheckInDate: {
            gte: startDate,
            lt: endDate
          }
        }
      });

    return responseSuccess("查詢成功", { buddhaSevenApplyMonthly });
  }

  /**
   * 取得單筆佛七報名資料
   * @param id 報名序號
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查無佛七報名資料")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApply: {
        Id: 2,
        UserId: 11,
        Name: null,
        DharmaName: "普某",
        IsMonk: true,
        IsMale: true,
        Mobile: "0901123123",
        Phone: "0395123123",
        RoomId: null,
        BedStayOrderNumber: null,
        CheckInDate: "2023-06-11T00:00:00.000Z",
        CheckOutDate: "2023-06-30T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        CheckInUserName: null,
        CheckInUserDharmaName: null,
        CheckInUserIsMale: null,
        Status: "新登錄報名",
        Remarks: "新增測試",
        UpdateUserId: 6,
        UpdateUserName: null,
        UpdateUserDharmaName: "普中",
        UpdateUserIsMale: true,
        UpdateAt: "2023-05-30T07:38:34.000Z"
      }
    }
  })
  public async getBuddhaSeven(
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const buddhaSevenApply = await prisma.buddha_seven_apply_view.findUnique({
      where: {
        Id: id
      }
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此報名序號"
      });
    }

    return responseSuccess("查詢成功", { buddhaSevenApply });
  }

  /**
   * 佛七報名
   */
  @Post()
  @SuccessResponse(StatusCodes.OK, "新增成功")
  @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  @Example({
    status: true,
    message: "佛七報名成功",
    data: {
      buddhaSevenApplyData: {
        Id: 2,
        UserId: 11,
        RoomId: null,
        BedStayOrderNumber: null,
        CheckInDate: "2023-06-11T00:00:00.000Z",
        CheckOutDate: "2023-06-30T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        Status: "新登錄報名",
        Remarks: "新增測試",
        UpdateUserId: 6,
        UpdateAt: "2023-05-30T07:38:34.000Z"
      }
    }
  })
  public async createBuddhaSevenApply(
    @Body() applyData: BuddhaSevenApplyRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 報名表必填欄位驗證
    const { UserId, CheckInDate, CheckOutDate } = applyData;
    const errMsgArr: string[] = [];

    if (!UserId) {
      errMsgArr.push("四眾 Id");
    } else {
      const user = await prisma.users.findUnique({
        where: {
          Id: UserId
        }
      });

      if (!user) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: "查無此四眾 Id，報名佛七前請先新增四眾個資"
        });
      }
    }

    if (!CheckInDate || !CheckOutDate) {
      errMsgArr.push("預計報到日、預計離單日");
    }

    if (errMsgArr.length !== 0) {
      const errMsg: string = errMsgArr.join("、");

      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: `${errMsg} 未填寫`
      });
    }

    // 驗證同一位 UserId 是否重複報名同一個日期區間
    const isDuplicate = await this.checkDuplicateDates(applyData);
    if (isDuplicate) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message:
          "同一個四眾報名之日期區間重複，如欲修改掛單日期，請修改佛七報名資料。"
      });
    }

    const buddhaSevenApplyData = await prisma.buddha_seven_apply.create({
      data: {
        ...applyData,
        Status: "新登錄報名"
      }
    });

    return responseSuccess("佛七報名成功", { buddhaSevenApplyData });
  }

  /**
   * 修改佛七報名資料
   * @param id 報名序號
   */
  @Patch("{id}")
  @SuccessResponse(StatusCodes.OK, "修改成功")
  @Response(StatusCodes.BAD_REQUEST, "修改失敗")
  @Example({
    status: true,
    message: "更新成功",
    data: {
      updateBuddhaSevenApply: {
        Id: 1,
        UserId: 11,
        RoomId: null,
        BedStayOrderNumber: null,
        CheckInDate: "2023-06-11T00:00:00.000Z",
        CheckOutDate: "2023-06-17T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        Status: "新登錄報名",
        Remarks: "修改測試",
        UpdateUserId: 11,
        UpdateAt: "2023-05-27T08:33:19.000Z"
      }
    }
  })
  public async updateBuddhaSevenApply(
    @Path() id: number,
    @Body() updateData: Partial<BuddhaSevenApplyRequest>,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 查詢要更新之佛七報名資料是否存在
    const buddhaSevenApply = await prisma.buddha_seven_apply.findUnique({
      where: {
        Id: id
      }
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此佛七報名資料"
      });
    }

    const updateBuddhaSevenApply = await prisma.buddha_seven_apply.update({
      where: {
        Id: id
      },
      data: {
        ...updateData,
        UpdateAt: new Date()
      }
    });

    return responseSuccess("更新成功", { updateBuddhaSevenApply });
  }

  /**
   * 取消佛七報名
   * @param id 報名序號
   */
  @Delete("{id}")
  @SuccessResponse(StatusCodes.OK, "已取消報名")
  @Response(StatusCodes.BAD_REQUEST, "取消失敗")
  @Example({
    status: true,
    message: "取消成功",
    data: {
      cancelBuddhaSevenApply: {
        Id: 1,
        UserId: 11,
        RoomId: null,
        BedStayOrderNumber: null,
        CheckInDate: "2023-06-11T00:00:00.000Z",
        CheckOutDate: "2023-06-17T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        Status: "已取消",
        Remarks: "修改測試",
        UpdateUserId: 11,
        UpdateAt: "2023-05-27T13:58:10.000Z"
      }
    }
  })
  public async cancelBuddhaSevenApply(
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 查詢要取消之佛七報名資料是否存在
    const buddhaSevenApply = await prisma.buddha_seven_apply.findUnique({
      where: {
        Id: id
      }
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此佛七報名資料"
      });
    }

    const cancelBuddhaSevenApply = await prisma.buddha_seven_apply.update({
      where: {
        Id: id
      },
      data: {
        Status: "已取消",
        UpdateAt: new Date()
      }
    });

    return responseSuccess("取消成功", { cancelBuddhaSevenApply });
  }

  // 驗證同一位 UserId 是否重複報名同一個日期區間
  private async checkDuplicateDates(
    applyData: BuddhaSevenApplyRequest
  ): Promise<boolean> {
    const { UserId, CheckInDate, CheckOutDate } = applyData;

    const existingApply = await prisma.buddha_seven_apply.findFirst({
      where: {
        UserId,
        OR: [
          {
            AND: [
              // 驗證 CheckInDate 是否在已報名過的日期區間內
              { CheckInDate: { lte: CheckInDate } },
              { CheckOutDate: { gte: CheckInDate } }
            ]
          },
          {
            // 驗證 CheckOutDate 是否在已報名過的日期區間內
            AND: [
              { CheckInDate: { lte: CheckOutDate } },
              { CheckOutDate: { gte: CheckOutDate } }
            ]
          },
          {
            // 驗證 報名日期區間 是否完全重複報名過
            AND: [
              { CheckInDate: { gte: CheckInDate } },
              { CheckOutDate: { lte: CheckOutDate } }
            ]
          }
        ]
      }
    });
    return !!existingApply;
  }
}
