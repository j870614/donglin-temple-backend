/* eslint-disable class-methods-use-this */
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Route } from "tsoa";
import { responseSuccess } from "../utils/responseSuccess";
import { UserRequest } from "../models/users.model";
import { prisma } from "../configs/prismaClient";

@Route("user")
export class UsersController {
  // constructor(private readonly _manager: ManagerDocument) {}

  public getAll = async (req: UserRequest, res: Response) => {
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

  public generate = async (req: UserRequest, res: Response) => {
    // @swagger.tags = ['User']
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Name, IsMonk, EatBreakfast, EatDinner, EatLunch } = req.body;
    try {
      const user = await prisma.users.create({
        data: {
          Name,
          IsMonk,
          // IsMale,
          EatBreakfast,
          EatLunch,
          EatDinner
        }
      });

      responseSuccess(res, StatusCodes.OK, user);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };
}
