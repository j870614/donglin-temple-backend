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

import { BuddhaSeven } from "../models";

@Tags("Buddha seven - 佛七")
@Route("/api/buddha-seven")
export class BuddhaSevenController extends Controller {
  /**
   * 取得年度佛七
   * @param year 查詢該年度之佛七，預設為本年度
   * @param order 正序("asc") / 倒序("desc")，佛七預設為正序排列
   * @param take 顯示數量，預設為 36 期佛七
   * @param skip 略過數量
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Example({
    "status": true,
    "message": "查詢成功",
    "data": {
      "buddhaSevenYearly": [
        {
          "Id": 466,
          "StartSevenDate": "2023-05-01T00:00:00.000Z",
          "CompleteDate": "2023-05-07T00:00:00.000Z",
          "Remarks": null
        },
        {
          "Id": 467,
          "StartSevenDate": "2023-05-11T00:00:00.000Z",
          "CompleteDate": "2023-05-17T00:00:00.000Z",
          "Remarks": null
        }
      ]
    }
  })
  public async getAllBuddhaSeven (
    @Query() year = Number(moment().year()),
    @Query() order: "asc" | "desc" = "asc",
    @Query() take = 36,
    @Query() skip = 0,
  ) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const buddhaSevenYearly = await prisma.buddha_seven_periods.findMany({
      orderBy: { Id: order },
      take,
      skip,
      where: {
        StartSevenDate: {
          gte: startDate,
          lte: endDate,
        }
      }
    });
    
    return responseSuccess("查詢成功", { buddhaSevenYearly });
  };

  /**
   * 取得單期佛七
   * @param id 佛七期數
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查無佛七期數")
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
    const buddhaSeven = await prisma.buddha_seven_periods.findUnique({
      where: {
        Id: id
      },
    });

    if (!buddhaSeven) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此佛七期數"
      });
    }
    
    return responseSuccess("查詢成功", { buddhaSeven });
  };

  /**
   * 新增佛七。現在資料表中的資料已符合佛七的新增規則，前端串接測試時請避免大量新增佛七，並在測試新增佛七時，在 Remarks 備註：前端新增測試。
   */
  @Post()
  @SuccessResponse(StatusCodes.OK, "新增成功")
  @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  @Example({
    "status": true,
    "message": "新增佛七成功",
    "data": {
      "buddhaSeven": {
        "Id": 475,
        "StartSevenDate": "2023-08-11T00:00:00.000Z",
        "CompleteDate": "2023-08-17T00:00:00.000Z",
        "Remarks": null
      }
    }
  })
  public async createBuddhaSeven (
    @Body() newBuddhaSeven: BuddhaSeven,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
   ) {
    const { StartSevenDate, CompleteDate, Remarks } = newBuddhaSeven;

    if (!StartSevenDate || !CompleteDate ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: `起七日、圓滿日 未填寫`
      });
    }

    const buddhaSeven = await prisma.buddha_seven_periods.create({
      data: {
        StartSevenDate: new Date(StartSevenDate),
        CompleteDate: new Date(CompleteDate),
        Remarks,
      },
    })

    return responseSuccess("新增佛七成功", { buddhaSeven });
  }

  /**
   * 修改佛七
   * @param id 佛七期數
   */
  @Patch('{id}')
  @SuccessResponse(StatusCodes.OK, "修改佛七成功")
  @Response(StatusCodes.BAD_REQUEST, "修改佛七失敗")
  @Example({
    "status": true,
    "message": "更新成功",
    "data": {
      "updateBuddhaSeven": {
        "Id": 474,
        "StartSevenDate": "2023-08-01T00:00:00.000Z",
        "CompleteDate": "2023-08-07T00:00:00.000Z",
        "Remarks": null
      }
    }
  })
  public async updateBuddhaSeven (
    @Path() id: number,
    @Body() updateData: Partial<BuddhaSeven>,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 查詢要更新之佛七期數是否存在
    const buddhaSeven = await prisma.buddha_seven_periods.findUnique ({
      where: {
        Id: id,
      },
    });

    if (!buddhaSeven) {
      return errorResponse(StatusCodes.BAD_REQUEST,{
        status: false,
        message: '查無此佛七期數'
      });
    }

    const updateBuddhaSeven = await prisma.buddha_seven_periods.update ({
      where: {
        Id: id,
      },
      data: updateData,
    })

    return responseSuccess("更新成功", { updateBuddhaSeven });
  }
}
