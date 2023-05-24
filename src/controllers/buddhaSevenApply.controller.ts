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
  Example
} from "tsoa";
import moment from 'moment';

import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import { prisma } from "../configs/prismaClient";

// import { BuddhaSevenApplyRequest } from "../models";

@Tags("Buddha seven apply - 佛七報名")
@Route("/api/buddha-seven-apply")
export class BuddhaSevenAppleController extends Controller {
  /**
   * 取得佛七預約報名表
   * @param year 查詢該年度之佛七預約報名表，預設為本年度
   * @param month 查詢該月份之佛七預約報名表，預設為當月
   * @param order 正序("asc") / 倒序("desc")，佛七預設為正序排列
   * @param take 顯示數量，預設為 100 筆
   * @param skip 略過數量
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Example({
    "status": true,
    "message": "查詢成功",
    "data": {
      "buddhaSevenApplyMonthly": []
    }
  })
  public async getAllBuddhaSevenApply (
    @Query() year = Number(moment().year()),
    @Query() month = Number(moment().month()),
    @Query() order: "asc" | "desc" = "asc",
    @Query() take = 100,
    @Query() skip = 0,
  ) {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month +1 }-01`);
    const buddhaSevenApplyMonthly = await prisma.buddha_seven_apply.findMany({
      orderBy: { Id: order },
      take,
      skip,
      where: {
        CheckInDate: {
          gte: startDate,
          lt: endDate,
        }
      }
    });
    
    return responseSuccess("查詢成功", { buddhaSevenApplyMonthly });
  };

  /**
   * 取得單筆佛七報名
   * @param id 報名序號
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查無佛七報名資料")
  @Example({
    "status": true,
    "message": "查詢成功",
    "data": {
      "buddhaSeven": {
        "Id": 466,
        "StartSevenDate": "2023-05-01T00:00:00.000Z",
        "CompleteDate": "2023-05-07T00:00:00.000Z",
        "Remarks": null
      }
    }
  })
  public async getBuddhaSeven (
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const buddhaSevenApply = await prisma.buddha_seven_apply.findUnique({
      where: {
        Id: id
      },
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此報名序號"
      });
    }
    
    return responseSuccess("查詢成功", { buddhaSevenApply });
  };

  // /**
  //  * 新增佛七。現在資料表中的資料已符合佛七的新增規則，前端串接測試時請避免大量新增佛七，並在測試新增佛七時，在 Remarks 備註：前端新增測試。
  //  */
  // @Post()
  // @SuccessResponse(StatusCodes.OK, "新增成功")
  // @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  // @Example({
  //   "status": true,
  //   "message": "新增佛七成功",
  //   "data": {
  //     "buddhaSeven": {
  //       "Id": 475,
  //       "StartSevenDate": "2023-08-11T00:00:00.000Z",
  //       "CompleteDate": "2023-08-17T00:00:00.000Z",
  //       "Remarks": null
  //     }
  //   }
  // })
  // public async createBuddhaSeven (
  //   @Body() newBuddhaSeven: BuddhaSeven,
  //   @Res()
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >
  //  ) {
  //   const { StartSevenDate, CompleteDate, Remarks } = newBuddhaSeven;

  //   if (!StartSevenDate || !CompleteDate ) {
  //     return errorResponse(StatusCodes.BAD_REQUEST, {
  //       status: false,
  //       message: `起七日、圓滿日 未填寫`
  //     });
  //   }

  //   const buddhaSeven = await prisma.buddha_seven_periods.create({
  //     data: {
  //       StartSevenDate: new Date(StartSevenDate),
  //       CompleteDate: new Date(CompleteDate),
  //       Remarks,
  //     },
  //   })

  //   return responseSuccess("新增佛七成功", { buddhaSeven });
  // }

  // /**
  //  * 修改佛七
  //  * @param id 佛七期數
  //  */
  // @Patch('{id}')
  // @SuccessResponse(StatusCodes.OK, "修改佛七成功")
  // @Response(StatusCodes.BAD_REQUEST, "修改佛七失敗")
  // @Example({
  //   "status": true,
  //   "message": "更新成功",
  //   "data": {
  //     "updateBuddhaSeven": {
  //       "Id": 474,
  //       "StartSevenDate": "2023-08-01T00:00:00.000Z",
  //       "CompleteDate": "2023-08-07T00:00:00.000Z",
  //       "Remarks": null
  //     }
  //   }
  // })
  // public async updateBuddhaSeven (
  //   @Path() id: number,
  //   @Body() updateData: Partial<BuddhaSeven>,
  //   @Res()
  //   errorResponse: TsoaResponse<
  //     StatusCodes.BAD_REQUEST,
  //     { status: false; message?: string }
  //   >
  // ) {
  //   // 查詢要更新之佛七期數是否存在
  //   const buddhaSeven = await prisma.buddha_seven_periods.findUnique ({
  //     where: {
  //       Id: id,
  //     },
  //   });

  //   if (!buddhaSeven) {
  //     return errorResponse(StatusCodes.BAD_REQUEST,{
  //       status: false,
  //       message: '查無此佛七期數'
  //     });
  //   }

  //   const updateBuddhaSeven = await prisma.buddha_seven_periods.update ({
  //     where: {
  //       Id: id,
  //     },
  //     data: updateData,
  //   })

  //   return responseSuccess("更新成功", { updateBuddhaSeven });
  // }
}
