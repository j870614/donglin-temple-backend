/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  BodyProp,
  Controller,
  Example,
  Get,
  Header,
  Post,
  Query,
  Res,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags
} from "tsoa";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import { managers } from "@prisma/client";
import { TsoaResponse } from "src/utils/ErrorResponse";

import { successResponse } from "../utils/SuccessResponse";
import { prisma } from "../configs/prismaClient";
import { generateAndSendJWT } from "../services/auth/jwtToken.service";

@Tags("Manager")
@Route("/api/managers")
export class ManagersController extends Controller {
  /**
   * 查詢管理員
   * @param order 正序("asc") / 倒序("desc")
   * @param take 顯示數量
   * @param skip 略過數量
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  public async getAll(
    @Query() order: "asc" | "desc" = "desc",
    @Query() take = 100,
    @Query() skip = 0
  ) {
    const allManagers = await prisma.managers.findMany({
      orderBy: { Id: order },
      take,
      skip
    });

    return successResponse("查詢成功", { managers: allManagers });
  }

  /**
   * 產生空白管理員
   * @param counts 產生個數
   */
  @Post("generate")
  @SuccessResponse(StatusCodes.CREATED, "產生成功")
  public async generate(@BodyProp() counts = 1) {
    const generatedManagers: managers[] = [];
    for (let i = 0; i < counts; i += 1) {
      const manager = await prisma.managers.create({
        data: {}
      });
      generatedManagers.push(manager);
    }

    return successResponse("產生成功", { managers: generatedManagers });
  }

  /**
   * 使用四眾使用者 ID 來註冊管理員身分
   * @param Email 信箱
   * @param Password 密碼
   * @param ConfirmPassword 再次確認密碼
   * @param UserId 使用者 ID
   */
  @Post("signup")
  @SuccessResponse(StatusCodes.CREATED, "註冊成功")
  @Response(StatusCodes.BAD_REQUEST, "註冊失敗")
  @Example({
    Id: 1,
    UserId: 1,
    Email: "a123456789@abc.com",
    Google: "GoogleAccount",
    Line: "LineId",
    Password: "password123"
  })
  public async signUp(
    @BodyProp() Email: string,
    @BodyProp() Password: string,
    @BodyProp() ConfirmPassword: string,
    @BodyProp() UserId: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    if (!Email || !Password || !ConfirmPassword || !UserId) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "所有欄位都必須填寫"
      });
    }

    if (Password !== ConfirmPassword) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "密碼和再次確認密碼不相同"
      });
    }

    if (!validator.isLength(Password, { min: 8 })) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "密碼需要至少 8 個字元長度"
      });
    }

    if (!validator.isEmail(Email)) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "信箱格式錯誤"
      });
    }

    const existingManagerByEmail = await prisma.managers.findFirst({
      where: { Email }
    });

    const existingManagerByUserId = await prisma.managers.findFirst({
      where: { UserId }
    });

    if (existingManagerByEmail || existingManagerByUserId) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "您的信箱或是個人資料已經建立過管理員帳號"
      });
    }

    const UnsignedManager = await prisma.managers.findFirst({
      where: {
        Email: null,
        UserId: null
      }
    });

    if (!UnsignedManager) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "沒有足夠的管理員空位"
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 12);
    const signedManager = await prisma.managers.update({
      where: { Id: UnsignedManager.Id },
      data: {
        Email,
        UserId,
        Password: hashedPassword
      }
    });

    return successResponse("註冊成功", { manager: signedManager });
  }

  /**
   * 使用信箱、密碼登入管理員帳號，成功會返回 JWT token
   * @param Email 信箱
   * @param Password 密碼
   */
  @Post("signin")
  @SuccessResponse(StatusCodes.OK, "登入成功")
  @Response(StatusCodes.BAD_REQUEST, "登入失敗")
  @Example({
    status: true,
    message: "登入成功",
    token: "eyJhbGciOiJSUzI1NiIsImtpZCI6InRCME0yQSJ9....",
    expired: 1684908011
  })
  public async signIn(
    @BodyProp() Email: string,
    @BodyProp() Password: string,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    if (!Email || !Password) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "所有欄位都必須填寫"
      });
    }

    const manager = await prisma.managers.findUnique({
      where: { Email }
    });
    if (!manager || !manager.Password) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "信箱或是密碼錯誤"
      });
    }

    const auth = await bcrypt.compare(Password, manager.Password);
    if (!auth) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "信箱或是密碼錯誤"
      });
    }

    return successResponse("登入成功", { ...generateAndSendJWT(manager) });
  }

  /**
   * 查詢當前 JWT token 是否為登入狀態。
   */
  @Security("jwt", ["manager"])
  @Post("check")
  @SuccessResponse(StatusCodes.OK, "管理員已登入")
  @Response(StatusCodes.BAD_REQUEST, "請重新登入")
  @Example({
    status: true,
    message: "管理員已登入"
  })
  public checkAuthorization() {
    return successResponse("管理員已登入");
  }

  /**
   * 使用 Jwt token 獲得當前管理員個人檔案
   */
  @Security("jwt", ["manager"])
  @Post("profile")
  @SuccessResponse(StatusCodes.OK, "已獲得管理員個人檔案")
  @Response(StatusCodes.BAD_REQUEST, "請重新登入")
  @Example({
    status: true,
    message: "管理員已登入"
  })
  public getProfile(
    @Header() Authorization: string,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    if (!Authorization || !Authorization.startsWith("Bearer")) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "Authorization header 丟失"
      });
    }

    const [, token] = Authorization.split(" ");
    if (!token) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "Token 丟失"
      });
    }

    const { UserId } = jwt.decode(token) as JwtPayload;

    return successResponse("已獲得管理員個人檔案", { userId: Number(UserId) });
  }
}
