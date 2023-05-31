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

  // describe("signUp", () => {
  //   let signUpByEmailRequest;
  //   let errorResponse;

  //   beforeEach(() => {
  //     signUpByEmailRequest = {
  //       UserId: "testUser",
  //       Email: "test@example.com",
  //       Password: "password",
  //       ConfirmPassword: "password",
  //       QRCode: "testQRCode"
  //     };
  //     errorResponse = jest.fn().mockReturnValue({ status: false });
  //   });

  //   it("should return errorResponse when required fields are missing", async () => {
  //     signUpByEmailRequest.Email = "";
  //     signUpByEmailRequest.Password = "";
  //     signUpByEmailRequest.ConfirmPassword = "";
  //     signUpByEmailRequest.UserId = null;
  //     signUpByEmailRequest.QRCode = null;

  //     const expectedResponse = {
  //       status: false,
  //       message: "所有欄位都必須填寫"
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when Password and ConfirmPassword do not match", async () => {
  //     signUpByEmailRequest.ConfirmPassword = "differentPassword";

  //     const expectedResponse = {
  //       status: false,
  //       message: "密碼和再次確認密碼不相同"
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when Password length is less than 8", async () => {
  //     validator.isLength.mockReturnValue(false);

  //     const expectedResponse = {
  //       status: false,
  //       message: "密碼需要至少 8 個字元長度"
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when Email format is invalid", async () => {
  //     validator.isEmail.mockReturnValue(false);

  //     const expectedResponse = {
  //       status: false,
  //       message: "信箱格式錯誤"
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when manager with the same Email or UserId already exists", async () => {
  //     prisma.managers.findFirst.mockResolvedValueOnce({ Id: 1 });
  //     prisma.managers.findFirst.mockResolvedValueOnce({ Id: 2 });

  //     const expectedResponse = {
  //       status: false,
  //       message: "您的信箱或是個人資料已經建立過管理員帳號"
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when there are no available manager slots", async () => {
  //     prisma.managers.findFirst.mockResolvedValueOnce(null);

  //     const expectedResponse = {
  //       status: false,
  //       message: "沒有足夠的管理員空位"
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should create a new manager and return responseSuccess when all conditions are met", async () => {
  //     prisma.managers.findFirst.mockResolvedValueOnce({ Id: 1 });
  //     prisma.managers.findFirst.mockResolvedValueOnce(null);
  //     prisma.managers.update.mockResolvedValue({ Id: 2 });

  //     const expectedResponse = {
  //       message: "註冊成功",
  //       data: { manager: { Id: 2 } }
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(prisma.managers.update).toHaveBeenCalledWith({
  //       where: { Id: 1 },
  //       data: {
  //         Email: "test@example.com",
  //         UserId: "testUser",
  //         Password: expect.any(String)
  //       }
  //     });
  //     expect(bcrypt.hash).toHaveBeenCalledWith("password", 12);
  //   });

  //   it("should create a new manager and call getQRCodeSetUsed when userData and QRCode are provided", async () => {
  //     prisma.managers.findFirst.mockResolvedValueOnce({ Id: 1 });
  //     prisma.managers.findFirst.mockResolvedValueOnce(null);
  //     prisma.managers.update.mockResolvedValue({ Id: 2 });

  //     const expectedResponse = {
  //       message: "註冊成功",
  //       data: { manager: { Id: 2 } }
  //     };

  //     const result = await managersService.signUp(
  //       signUpByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(prisma.managers.update).toHaveBeenCalledWith({
  //       where: { Id: 1 },
  //       data: {
  //         Email: "test@example.com",
  //         UserId: "testUser",
  //         Password: expect.any(String)
  //       }
  //     });
  //     expect(bcrypt.hash).toHaveBeenCalledWith("password", 12);
  //     expect(managersService.getQRCodeSetUsed).toHaveBeenCalledWith(
  //       "testQRCode"
  //     );
  //   });
  // });

  // describe("signIn", () => {
  //   let signInByEmailRequest;
  //   let errorResponse;

  //   beforeEach(() => {
  //     signInByEmailRequest = {
  //       Email: "test@example.com",
  //       Password: "password"
  //     };
  //     errorResponse = jest.fn().mockReturnValue({ status: false });
  //   });

  //   it("should return errorResponse when required fields are missing", async () => {
  //     signInByEmailRequest.Email = "";
  //     signInByEmailRequest.Password = "";

  //     const expectedResponse = {
  //       status: false,
  //       message: "所有欄位都必須填寫"
  //     };

  //     const result = await managersService.signIn(
  //       signInByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when manager with the provided Email does not exist", async () => {
  //     prisma.managers.findUnique.mockResolvedValue(null);

  //     const expectedResponse = {
  //       status: false,
  //       message: "信箱或是密碼錯誤"
  //     };

  //     const result = await managersService.signIn(
  //       signInByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return errorResponse when provided password does not match the manager's password", async () => {
  //     prisma.managers.findUnique.mockResolvedValue({
  //       Password: "hashedPassword"
  //     });
  //     bcrypt.compare.mockResolvedValue(false);

  //     const expectedResponse = {
  //       status: false,
  //       message: "信箱或是密碼錯誤"
  //     };

  //     const result = await managersService.signIn(
  //       signInByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).toHaveBeenCalledWith(
  //       StatusCodes.BAD_REQUEST,
  //       expectedResponse
  //     );
  //   });

  //   it("should return responseSuccess with JWT token when Email and Password match", async () => {
  //     prisma.managers.findUnique.mockResolvedValue({
  //       Password: "hashedPassword"
  //     });
  //     bcrypt.compare.mockResolvedValue(true);
  //     generateAndSendJWT.mockReturnValue({ token: "jwtToken" });

  //     const expectedResponse = {
  //       message: "登入成功",
  //       data: { token: "jwtToken" }
  //     };

  //     const result = await managersService.signIn(
  //       signInByEmailRequest,
  //       errorResponse
  //     );

  //     expect(result).toEqual(expectedResponse);
  //     expect(errorResponse).not.toHaveBeenCalled();
  //     expect(generateAndSendJWT).toHaveBeenCalledWith({
  //       Password: "hashedPassword"
  //     });
  //   });
  // });

  // describe("checkAuthorization", () => {
  //   it("should return responseSuccess with '管理員已登入'", () => {
  //     const expectedResponse = {
  //       message: "管理員已登入"
  //     };

  //     const result = managersService.checkAuthorization();

  //     expect(result).toEqual(expectedResponse);
  //   });
  // });

  // describe("getUserAuthDataFromQRCode", () => {
  //   it("should return null when qrCode is not provided", async () => {
  //     const result = await managersService.getUserAuthDataFromQRCode(null);

  //     expect(result).toBeNull();
  //   });

  //   it("should return userAuthData when qrCode is provided and meets the conditions", async () => {
  //     const qrCode = "testQRCode";
  //     const endTime = new Date();
  //     endTime.setUTCHours(endTime.getUTCHours() + 8);
  //     const userAuthData = {
  //       UserId: "testUser",
  //       DeaconId: 1,
  //       AuthorizeUserId: 2
  //     };

  //     prisma.user_auth_qr_codes.findFirst.mockResolvedValue(userAuthData);

  //     const expectedResponse = userAuthData;

  //     const result = await managersService.getUserAuthDataFromQRCode(qrCode);

  //     expect(result).toEqual(expectedResponse);
  //     expect(prisma.user_auth_qr_codes.findFirst).toHaveBeenCalledWith({
  //       where: {
  //         QRCode: "testQRCode",
  //         EndTime: { gte: endTime },
  //         HasUsed: false
  //       }
  //     });
  //   });
  // });

  // describe("getQRCodeSetUsed", () => {
  //   it("should return null when qrCode is not provided", async () => {
  //     const result = await managersService.getQRCodeSetUsed(null);

  //     expect(result).toBeNull();
  //   });

  //   it("should update user_auth_qr_codes with HasUsed set to true when qrCode is provided", async () => {
  //     const qrCode = "testQRCode";
  //     const expectedResponse = { QRCode: "testQRCode", HasUsed: true };

  //     const result = await managersService.getQRCodeSetUsed(qrCode);

  //     expect(result).toEqual(expectedResponse);
  //     expect(prisma.user_auth_qr_codes.update).toHaveBeenCalledWith({
  //       where: { QRCode: "testQRCode" },
  //       data: { HasUsed: true }
  //     });
  //   });
  // });
});
