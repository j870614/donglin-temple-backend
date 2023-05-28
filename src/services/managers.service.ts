import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import validator from "validator";
import { TsoaResponse } from "src/utils/responseTsoaError";

import {
  GetManyRequest,
  SignInByEmailRequest,
  SignUpByEmailRequest
} from "../models";
import { responseSuccess } from "../utils/responseSuccess";
import { prisma } from "../configs/prismaClient";
import { generateAndSendJWT } from "./auth/jwtToken.service";

/* eslint-disable class-methods-use-this */
export class ManagersService {
  constructor(private readonly prismaClient = prisma) {}

  async getMany(getManyRequest: GetManyRequest) {
    const { order, take, skip } = getManyRequest;
    const orderOption = order || "desc";
    const takeOption = take || 100;
    const skipOption = skip || 0;

    const allManagers = await this.prismaClient.managers.findMany({
      orderBy: { Id: orderOption },
      take: takeOption,
      skip: skipOption
    });

    return responseSuccess("查詢成功", { managers: allManagers });
  }

  async signUp(
    signUpByEmailRequest: SignUpByEmailRequest,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { UserId, Email, Password, ConfirmPassword } = signUpByEmailRequest;

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

    return responseSuccess("註冊成功", { manager: signedManager });
  }

  async signIn(
    signInByEmailRequest: SignInByEmailRequest,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { Email, Password } = signInByEmailRequest;
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

    return responseSuccess("登入成功", { ...generateAndSendJWT(manager) });
  }

  checkAuthorization() {
    return responseSuccess("管理員已登入");
  }

  // getProfile() {

  // }
}
