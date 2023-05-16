/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { responseSuccess } from "../utils/responseSuccess";
import { GuestRequest } from "../models/guests.model";
import { prisma } from "../configs/prismaClient";
import { appError } from "../utils/appError";

export class GuestsController {
  public getAll = async (req: GuestRequest, res: Response) => {
    // @swagger.tags = ['User']
    const { order, take, skip } = req.query;
    const orderOption = order === "asc" ? "asc" : "desc";
    const takeOption = Number(take || 100);
    const skipOption = Number(skip || 0);

    try {
      const allUsers = await prisma.users.findMany({
        orderBy: { Id: orderOption },
        take: takeOption,
        skip: skipOption
      });

      responseSuccess(res, StatusCodes.OK, allUsers);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };

  public getGuest = async (req: GuestRequest, res: Response) => {
    // @swagger.tags = ['User']
    try {
      const guestId = Number(req.params.id);
      const guest = await prisma.users.findUnique({
        where: {
          Id: guestId
        }
      });
      responseSuccess(res, StatusCodes.OK, guest);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };

  public createUser = async (
    req: GuestRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { IsMonk, Gender } = req.body;

      if (Gender === undefined) {
        next(appError(StatusCodes.BAD_REQUEST, "性別未填寫", next));
        return;
      }

      if (IsMonk === undefined) {
        next(appError(StatusCodes.BAD_REQUEST, "身分別未填寫", next));
        return;
      }

      if (IsMonk) {
        this.checkMonkFields(req, res, next);
      } else {
        this.checkBuddhistFields(req, res, next);
      }

      const {
        MobilePrefix,
        Mobile,
        Name,
        DharmaName,
        MageNickname,
        LineId,
        Email,
        StayIdentity,
        BirthDate,
        IdNumber,
        PassportNumber,
        BirthPlace,
        Phone,
        Ordination,
        Altar,
        ShavedMaster,
        ShavedDate,
        OrdinationTemple,
        OrdinationDate,
        ResidentialTemple,
        RefugueMaster,
        RefugueDate,
        Referrer,
        ClothType,
        ClothSize,
        EmergencyName,
        EmergencyPhone,
        Relationship,
        Expertise,
        Education,
        ComeTempleReason,
        HealthStatus,
        EatBreakfast,
        EatLunch,
        EatDinner,
        Address,
        Remarks
      } = req.body;
      console.log(typeof IsMonk);
      const user = await prisma.users.create({
        data: {
          MobilePrefix,
          Mobile,
          Name,
          DharmaName,
          MageNickname,
          LineId,
          Email,
          IsMonk,
          StayIdentity,
          Gender,
          BirthDate,
          IdNumber,
          PassportNumber,
          BirthPlace,
          Phone,
          Ordination,
          Altar,
          ShavedMaster,
          ShavedDate,
          OrdinationTemple,
          OrdinationDate,
          ResidentialTemple,
          RefugueMaster,
          RefugueDate,
          Referrer,
          ClothType,
          ClothSize,
          EmergencyName,
          EmergencyPhone,
          Relationship,
          Expertise: undefined,
          Education,
          ComeTempleReason,
          HealthStatus: undefined,
          EatBreakfast,
          EatLunch,
          EatDinner,
          Address: undefined,
          Remarks
        }
      });

      responseSuccess(res, StatusCodes.OK, user);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in guests createUser");
    }
  };

  private checkMonkFields = (
    req: GuestRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { DharmaName, ShavedMaster } = req.body;
    const errMsgArr: string[] = [];

    if (!DharmaName) errMsgArr.push("法名");

    if (!ShavedMaster) errMsgArr.push("剃度師長德號");

    if (errMsgArr.length !== 0) {
      const errMsg = errMsgArr.join("、");
      next(appError(StatusCodes.BAD_REQUEST, `${errMsg} 未填寫`, next));
    }
  };

  private checkBuddhistFields = (
    req: GuestRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { Name } = req.body;

    if (!Name) {
      next(appError(StatusCodes.BAD_REQUEST, `俗名未填寫`, next));
    }
  };
}
