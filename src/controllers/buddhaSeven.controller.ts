/* eslint-disable class-methods-use-this */
import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import moment from 'moment';

import { responseSuccess } from "../utils/responseSuccess";
import { BuddhaSevenRequest } from '../models/buddhaSeven.model';
import { prisma } from "../configs/prismaClient";
import { appError } from "../utils/appError";
// import { config } from "dotenv";

export class BuddhaSevenController {
  // constructor(private readonly _manager: ManagerDocument) {}

  public getAllBuddhaSeven = async (req: BuddhaSevenRequest, res: Response, next: NextFunction) => {
    /**
     * order 參數表示排列方式，預設是按照 id 由小到大排列
     * take 參數表示顯示資料數量，佛七預設顯示一年度 36 期的佛七
     * year 參數表示查詢該年度之佛七
     */
    const { order, take, skip ,year } = req.query;
    const orderOption = order === "asc" || '' ? "asc" : "desc";
    const takeOption = Number(take || 36);
    const skipOption = Number(skip || 0);
    const yearOption = Number(year || moment().year());

    try {
      const startDate = new Date(`${yearOption}-01-01`);
      const endDate = new Date(`${yearOption}-12-31`);
      const buddhaSevenYearly = await prisma.buddha_seven_periods.findMany({
        orderBy: { Id: orderOption },
        take: takeOption,
        skip: skipOption,
        where: {
          StarSevenDate: {
            gte: startDate,
            lte: endDate,
          }
        }
      });
      
      responseSuccess(res, StatusCodes.OK, buddhaSevenYearly);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in BuddhaSevenController getAllBuddhaSeven");
    }
  };


  public getBuddhaSeven = async (req: BuddhaSevenRequest, res: Response) => {
    try {
      const buddhaSevenId = Number(req.params.id)
      const buddhaSeven = await prisma.buddha_seven_periods.findUnique({
        where: {
          Id:buddhaSevenId
        },
      });
      responseSuccess(res, StatusCodes.OK, buddhaSeven);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in BuddhaSevenController getBuddhaSeven");
    }
  };

  public createBuddhaSeven = async (req: BuddhaSevenRequest, res: Response, next: NextFunction ) => {
    try {
      
      const { StarSevenDate, CompleteDate, Remarks } = req.body;

      if (!StarSevenDate || !CompleteDate ) {
        next(appError(StatusCodes.BAD_REQUEST, '起七日、圓滿日 未填寫', next));
        return;
      }

      const buddhaSeven = await prisma.buddha_seven_periods.create({
        data: {
          StarSevenDate: new Date(StarSevenDate),
          CompleteDate: new Date(CompleteDate),
          Remarks,
        },
      })

      responseSuccess(res, StatusCodes.OK, buddhaSeven);

    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in guests createBuddhaSeven");
    }
  }

}
