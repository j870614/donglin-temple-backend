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
    // @swagger.tags = ['User']
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
    }
  };


  public getGuest = async (req: BuddhaSevenRequest, res: Response) => {
    // @swagger.tags = ['User']
    try {
      const guestId = Number(req.params.id)
      const guest = await prisma.users.findUnique({
        where: {
          Id:guestId
        },
      });
      responseSuccess(res, StatusCodes.OK, guest);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in BuddhaSevenController getAllBuddhaSeven");
    }
  };

  // public createUser = async (req: BuddhaSevenRequest, res: Response, next: NextFunction ) => {
  //   try {
  //     const {IsMonk, Gender} = req.body;

  //     if (Gender === undefined) {
  //       next(appError(StatusCodes.BAD_REQUEST,'性別未填寫', next));
  //       return;
  //     }

  //     if (IsMonk === undefined) {
  //       next(appError(StatusCodes.BAD_REQUEST,'身分別未填寫', next));
  //       return;
  //     } 
      
  //     if (IsMonk) {
  //       this.checkMonkFields(req, res, next);
  //     } else {
  //       this.checkBuddhistFields(req, res, next);
  //     }

  //     const {
  //       MobilePrefix,
  //       Mobile,
  //       Name,
  //       DharmaName,
  //       MageNickname,
  //       LineId,
  //       Email,
  //       StayIdentity,
  //       BirthDate,
  //       IdNumber,
  //       PassportNumber,
  //       BirthPlace,
  //       Phone,
  //       Ordination,
  //       Altar,
  //       ShavedMaster,
  //       ShavedDate,
  //       OrdinationTemple,
  //       OrdinationDate,
  //       ResidentialTemple,
  //       RefugueMaster,
  //       RefugueDate,
  //       Referrer,
  //       ClothType,
  //       ClothSize,
  //       EmergencyName,
  //       EmergencyPhone,
  //       Relationship,
  //       Expertise,
  //       Education,
  //       ComeTempleReason,
  //       HealthStatus,
  //       EatBreakfast,
  //       EatLunch,
  //       EatDinner,
  //       Address,
  //       Remarks,
  //     } = req.body;
  //     console.log(typeof IsMonk);
  //     const user = await prisma.users.create({
  //       data: {
  //         MobilePrefix,
  //         Mobile,
  //         Name,
  //         DharmaName,
  //         MageNickname,
  //         LineId,
  //         Email,
  //         IsMonk,
  //         StayIdentity,
  //         Gender,
  //         BirthDate,
  //         IdNumber,
  //         PassportNumber,
  //         BirthPlace,
  //         Phone,
  //         Ordination,
  //         Altar,
  //         ShavedMaster,
  //         ShavedDate,
  //         OrdinationTemple,
  //         OrdinationDate,
  //         ResidentialTemple,
  //         RefugueMaster,
  //         RefugueDate,
  //         Referrer,
  //         ClothType,
  //         ClothSize,
  //         EmergencyName,
  //         EmergencyPhone,
  //         Relationship,
  //         Expertise,
  //         Education,
  //         ComeTempleReason,
  //         HealthStatus,
  //         EatBreakfast,
  //         EatLunch,
  //         EatDinner,
  //         Address,
  //         Remarks,
  //       }
  //     });

  //     responseSuccess(res, StatusCodes.OK, user);

  //   } catch (error: unknown) {
  //     if (error instanceof Error) throw error;
  //     throw new Error("Unexpected error in guests createUser");
  //   }
  // }

}
