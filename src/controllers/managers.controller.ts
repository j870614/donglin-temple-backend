/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  BodyProp,
  Controller,
  Example,
  Get,
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
import { managers } from "@prisma/client";
import { TsoaResponse } from "src/utils/ErrorResponse";

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

    return { status: true, data: { managers: allManagers } };
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

    return { status: true, data: { managers: generatedManagers } };
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
  @Example<managers>({
    Id: 1,
    UserId: 1,
    CreatedAt: new Date(),
    Email: "a12345679@oao.com",
    Google: "a123454543",
    Line: "a12321321321",
    Password: "password123",
    UpdateAt: new Date()
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

    return { status: true, data: { managers: signedManager } };
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
    Email: "a12345679@oao.com",
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

    return {
      status: true,
      message: "登入成功",
      data: { ...generateAndSendJWT(manager) }
    };
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
    return { status: true, message: "管理員已登入" };
  }
}
