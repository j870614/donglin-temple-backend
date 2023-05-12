/* eslint-disable class-methods-use-this */
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { responseSuccess } from "../utils/responseSuccess";
import { GuestRequest } from "../models/guests.model";
import { prisma } from "../configs/prismaClient";

export class GuestsController {
  // constructor(private readonly _manager: ManagerDocument) {}

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
      const guestId=Number(req.params.id)
      const guest = await prisma.users.findUnique({
        where: {
          Id:guestId
        },
      });
      responseSuccess(res, StatusCodes.OK, guest);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };
}
