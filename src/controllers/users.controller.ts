/* eslint-disable class-methods-use-this */
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { responseSuccess } from "../utils/responseSuccess";
import { UserRequest } from "../models/users.model";
import { prisma } from "../configs/prismaClient";

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
    const { Name, IsMonk, Gender, Eat_Breakfast, Eat_Dinner, Eat_Lunch } =
      req.body;
    try {
      const user = await prisma.users.create({
        data: {
          Name,
          IsMonk,
          Gender,
          Eat_Breakfast,
          Eat_Lunch,
          Eat_Dinner
        }
      });

      responseSuccess(res, StatusCodes.OK, user);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };
}
