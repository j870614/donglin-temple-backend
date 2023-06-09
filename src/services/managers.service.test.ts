// import { StatusCodes } from "http-status-codes";
// import bcrypt from "bcryptjs";
// import validator from "validator";

// import { managers } from "@prisma/client";
// import { Context } from "../../test/context";
import { prismaMock } from "../../test/setup";
import { ManagersService } from "./managers.service";
// import prisma from "../configs/prismaClient";
// import { generateAndSendJWT } from "./auth/jwtToken.service";
import { GetManyRequest } from "../models";

// jest.mock("bcryptjs");
// jest.mock("validator");
// jest.mock("../configs/prismaClient");
// jest.mock("./auth/jwtToken.service");

describe("ManagersService", () => {
  let managersService: ManagersService;

  beforeEach(() => {
    managersService = new ManagersService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("ManagerService unit test", () => {
    it("should return with managers", async () => {
      const getManyRequest: GetManyRequest = {
        order: "desc",
        take: 100,
        skip: 0
      };
      const expectedResponse = {
        status: true,
        message: "查詢成功",
        data: { managers: [] }
      };

      prismaMock.managers.findMany.mockResolvedValue([]);

      await expect(managersService.getMany(getManyRequest)).resolves.toEqual(
        expectedResponse
      );
    });
  });
});
