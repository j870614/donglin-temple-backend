import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Get,
  Post,
  Path,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  Patch,
  Example,
  Queries,
  Query
} from "tsoa";
import { Prisma } from "@prisma/client";

import { TsoaResponse } from "src/utils/responseTsoaError";
import { BuddhaSevenAppliesService } from "../services/buddhaSeven/buddhaSevenApplies.service";
import { responseSuccess } from "../utils/responseSuccess";
import prisma from "../configs/prismaClient";

import {
  BuddhaSevenApplyStatus,
  BuddhaSevenApplyStatusValues
} from "../enums/buddhaSevenApplies.enum";
import {
  BuddhaSevenApplyCancelRequest,
  BuddhaSevenApplyCreateRequest,
  BuddhaSevenApplyGetManyRequest
} from "../models";

@Tags("Buddha seven apply - 佛七報名")
@Route("/api/buddha-seven/applies")
export class BuddhaSevenAppliesController extends Controller {
  constructor(
    private readonly _buddhaSevenApplies = new BuddhaSevenAppliesService()
  ) {
    super();
  }

  /**
   * 取得佛七預約報名表
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Example({
    status: true,
    message: "查詢成功",
    data: {
      buddhaSevenApplies: [
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
  public async getBuddhaSevenAppliesByYearAndMonth(
    @Queries() buddhaSevenApplyGetManyRequest: BuddhaSevenApplyGetManyRequest
  ) {
    const buddhaSevenApplies =
      await this._buddhaSevenApplies.findManyByRequests(
        buddhaSevenApplyGetManyRequest
      );
    return responseSuccess("查詢成功", { buddhaSevenApplies });
  }

  /**
   * 取得單筆佛七報名資料
   * @param id 報名序號
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
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
        Status: "已報名佛七",
        Remarks: "新增測試",
        UpdateUserId: 6,
        UpdateUserName: null,
        UpdateUserDharmaName: "普中",
        UpdateUserIsMale: true,
        UpdateAt: "2023-05-30T07:38:34.000Z"
      }
    }
  })
  public async getBuddhaSevenApplyByIdAndStatus(
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    @Query() status?: BuddhaSevenApplyStatusValues
  ) {
    const buddhaSevenApply =
      await this._buddhaSevenApplies.findOneByIdAndStatus(id, status);

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
  @SuccessResponse(StatusCodes.CREATED, "佛七報名成功")
  @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  @Example({
    status: true,
    message: "佛七報名成功",
    data: {
      buddhaSevenApply: {
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
    @Body() buddhaSevenApplyCreateRequest: BuddhaSevenApplyCreateRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { UserId } = buddhaSevenApplyCreateRequest;
    // 驗證此 UserId 是否存在
    const user = await this._buddhaSevenApplies.findOneByIdAndStatus(UserId);
    if (!user) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此四眾 Id，報名佛七前請先新增四眾個資"
      });
    }

    // 驗證同一位 UserId 報名的日期區間是否重複
    const isOverlap = await this._buddhaSevenApplies.checkIfDateOverlap(
      buddhaSevenApplyCreateRequest
    );
    if (isOverlap) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message:
          "同一個四眾報名之日期區間重複，如欲修改掛單日期，請修改佛七報名資料。"
      });
    }

    const buddhaSevenApply = await this._buddhaSevenApplies.createOne({
      ...buddhaSevenApplyCreateRequest,
      Status: BuddhaSevenApplyStatus.APPLIED
    });

    return responseSuccess("佛七報名成功", { buddhaSevenApply });
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
    message: "修改成功"
  })
  public async updateBuddhaSevenApply(
    @Path() id: number,
    @Body() buddhaSevenApplyUpdateRequest: Prisma.buddha_seven_applyUpdateInput,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 查詢要更新之佛七報名資料是否存在
    const isExisted = await this._buddhaSevenApplies.findOneByIdAndStatus(id);

    if (!isExisted) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此佛七報名資料"
      });
    }
    // 更新佛七報名資料
    const updatedBuddhaSevenApply =
      await this._buddhaSevenApplies.updateOneByIdAndUpdateData(
        id,
        buddhaSevenApplyUpdateRequest
      );

    if (!updatedBuddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "修改失敗"
      });
    }

    return responseSuccess("修改成功");
  }

  /**
   * 取消佛七報名
   * @param id 報名序號
   */
  @Patch("cancel/{id}")
  @SuccessResponse(StatusCodes.OK, "取消成功")
  @Response(StatusCodes.BAD_REQUEST, "取消失敗")
  @Example({
    status: true,
    message: "取消成功"
  })
  public async cancelBuddhaSevenApply(
    @Path() id: number,
    @Queries() buddhaSevenApplyCancelRequest: BuddhaSevenApplyCancelRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 查詢目標佛七報名資料是否存在
    const isExisted = await this._buddhaSevenApplies.findOneByIdAndStatus(
      id,
      BuddhaSevenApplyStatus.APPLIED
    );

    if (!isExisted) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此佛七報名資料"
      });
    }

    // 取消目標佛七報名資料
    const canceledBuddhaSevenApply = await prisma.buddha_seven_apply.update({
      where: {
        Id: id
      },
      data: {
        ...buddhaSevenApplyCancelRequest,
        Status: BuddhaSevenApplyStatus.CANCELLED
      }
    });

    if (!canceledBuddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "取消失敗"
      });
    }

    return responseSuccess("取消成功");
  }
}
