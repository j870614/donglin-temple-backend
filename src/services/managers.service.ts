import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import validator from "validator";
import { TsoaResponse } from "src/utils/responseTsoaError";
import axios from "axios";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
  VerifyFunction
} from "passport-google-oauth2";

import {
  GetManyRequest,
  SignInByEmailRequest,
  SignUpByEmailRequest,
  LineLoginRequest,
  LineResponse,
  LineUserInfoResponse,
  AxiosResponse
} from "../models";
import { responseSuccess } from "../utils/responseSuccess";
import prisma from "../configs/prismaClient";
import { generateAndSendJWT } from "./auth/jwtToken.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string
    },
    async (
      accessToken: string,
      refreshToken: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profile: any,
      done: VerifyCallback
    ) => {
      console.log("google passport");
      console.log(profile);

      try {
        const user = await prisma.managers.findUnique({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          where: { Google: profile.id as string }
        });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// passport.authenticate("google", { scope: ["email", "profile"] });

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
    qrCodeRequest: string | undefined,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { UserId, Email, Password, ConfirmPassword } = signUpByEmailRequest;

    if (!Email || !Password || !ConfirmPassword || !(UserId || qrCodeRequest)) {
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

    const existingManagerByEmail = await this.prismaClient.managers.findFirst({
      where: { Email }
    });
    const qrCode = qrCodeRequest || "";
    const userData = await this.getUserAuthDataFromQRCode(qrCode);

    if (qrCodeRequest && !userData) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "QRCode 無效或是已過期"
      });
    }

    const userId = userData ? userData.UserId : UserId;
    const existingManagerByUserId = await this.prismaClient.managers.findFirst({
      where: { UserId: userId }
    });

    if (existingManagerByEmail || existingManagerByUserId) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "您的信箱或是此四眾個資已經建立過管理員帳號"
      });
    }

    const UnsignedManager = await this.prismaClient.managers.findFirst({
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
    let data;

    if (userData) {
      // 註冊碼帶的權限資料
      data = {
        Email,
        UserId: userData.UserId,
        Password: hashedPassword,
        ChurchId: userData.ChurchId,
        DeaconId: userData.DeaconId,
        AuthorizeUserId: userData.AuthorizeUserId
      };
    } else {
      data = {
        Email,
        UserId,
        Password: hashedPassword
      };
    }

    const signedManager = await this.prismaClient.managers.update({
      where: { Id: UnsignedManager.Id },
      data
    });

    if (userData) {
      await this.getQRCodeSetUsed(qrCode);
    }

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

    const manager = await this.prismaClient.managers.findUnique({
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

    const result = await generateAndSendJWT(manager);
    
    return responseSuccess("登入成功", { ...result });
  }

  checkAuthorization() {
    return responseSuccess("管理員已登入");
  }

  /**
   * 取得 user_auth_qr_codes 指定 QRCode，時效內且尚未啟用的資料
   * @param qrCode 註冊碼
   * @returns
   */
  async getUserAuthDataFromQRCode(qrCode: string) {
    if (!qrCode) {
      return null;
    }

    const endTime = new Date();
    endTime.setUTCHours(endTime.getUTCHours() + 8);

    return this.prismaClient.user_auth_qr_codes.findFirst({
      where: {
        QRCode: qrCode,
        EndTime: { gte: endTime },
        HasUsed: false
      }
    });
  }

  /**
   * 將 user_auth_qr_codes 指定的 QRCode，註記已使用
   * @param qrCode 註冊碼
   * @returns
   */
  async getQRCodeSetUsed(qrCode: string) {
    if (!qrCode) {
      return null;
    }

    return this.prismaClient.user_auth_qr_codes.update({
      where: { QRCode: qrCode },
      data: { HasUsed: true }
    });
  }

  /**
   * Line 登入驗證，成功將回傳 Line user ID
   */
  private async verifyLineLogin(
    code: string,
    state: string,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    isFrontEndSeparate = false,
  ) {
    const lineState = String(process.env.LINE_STATE);
    if (state !== lineState) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "Line 登入驗證錯誤"
      });
    }

    // 拿 code 換成 access_token
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };

    const data = {
      grant_type: "authorization_code",
      code,
      redirect_uri: isFrontEndSeparate? String(process.env.LINE_FRONTEND_CALLBACK_URL) : String(process.env.LINE_CALLBACK_URL), // 判斷是否為前後端分離方式實作 Line 登入，對應不同的 callback URL。
      client_id: String(process.env.LINE_CHANNEL_ID),
      client_secret: String(process.env.LINE_CHANNEL_SECRET)
    };

    const lineResponse: AxiosResponse<LineResponse> = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      new URLSearchParams(data).toString(),
      { headers }
    );

    // 向 Line 獲取用戶資訊
    const userInfoResponse: AxiosResponse<LineUserInfoResponse> =
      await axios.get("https://api.line.me/v2/profile", {
        headers: {
          Authorization: `Bearer ${lineResponse.data.access_token}`
        }
      });

    const { userId } = userInfoResponse.data;

    return userId; // 此 userId 為 Line user ID
  }

  /**
   * Line 登入
   */
  async signInWithLine (
    lineLoginRequest: LineLoginRequest,
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    isFrontEndSeparate = false,
  ) {
    const { code, state } = lineLoginRequest;    const lineUserId = await this.verifyLineLogin(code, state, errorResponse, isFrontEndSeparate);

    const manager = await prisma.managers.findUnique({
      where: {
        Line: String(lineUserId)
      } 
    });

    if ( !manager ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "尚未邀請系統權限，或帳號未綁定 Line 帳號登入，請洽系統管理員"
      });
    }
    
    const result = await generateAndSendJWT(manager);

    return responseSuccess("Line 登入成功", { ...result });
  }

  /**
   * Managers 新註冊，並綁定 Line 第三方登入
   */
  async signUpWithLine (
    lineLoginRequest: LineLoginRequest,
    qrCodeRequest: string,
    errorResponse: TsoaResponse<
    StatusCodes.BAD_REQUEST,
    { status: false; message?: string }
  >
  ) {
    const { code, state, UserId } = lineLoginRequest;
    const lineUserId  = await this.verifyLineLogin(code, state, errorResponse, true);
  
    const existingManagerByLine = await prisma.managers.findUnique({
      where: { 
        Line: String(lineUserId),
      }
    });

    // 驗證是否重複綁定同一個 Line 帳號
    if ( existingManagerByLine ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "您的 Line 已經建立過管理員帳號"
      });
    }

    if (!existingManagerByLine && !(UserId || qrCodeRequest) ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "帳號未綁定 Line 帳號登入，請洽系統管理員"
      });
    }
    
    const qrCode = qrCodeRequest;
    const userData = await this.getUserAuthDataFromQRCode(qrCode);

    if (!userData) {
      return errorResponse(StatusCodes.BAD_REQUEST, { 
        status: false,
        message: "QRCode 無效或是已過期"
      });
    }

    // 驗證是否重複綁定同一個寺務系統 UserId
    const userId = userData ? userData.UserId : UserId;
    const existingManagerByUserId = await this.prismaClient.managers.findFirst({
      where: { UserId: userId }
    });

    if ( existingManagerByUserId ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "此四眾個資已經建立過管理員帳號"
      });
    }

    // 註冊碼帶的權限資料
    const data = {
      UserId: userData.UserId,
      DeaconId: userData.DeaconId,
      AuthorizeUserId: userData.AuthorizeUserId,
      Line: String(lineUserId),
    };
    const signedManager = await this.prismaClient.managers.create({
      data
    })


    await this.getQRCodeSetUsed(qrCode);


    return responseSuccess("註冊成功", { manager: signedManager });
  }

  /**
   * 既有 Managers 綁定 Line 第三方登入
   */
  async assignLineToManager(
    lineLoginRequest: LineLoginRequest,
    errorResponse: TsoaResponse<
    StatusCodes.BAD_REQUEST,
    { status: false; message?: string }
  >
  ) {
    const { code, state, UserId } = lineLoginRequest;
    const lineUserId  = await this.verifyLineLogin(code, state, errorResponse, true);
  
    const existingManagerByLine = await prisma.managers.findUnique({
      where: { 
        Line: String(lineUserId),
      }
    });

    // 驗證是否重複綁定同一個 Line 帳號
    if ( existingManagerByLine ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "您的 Line 已經建立過管理員帳號"
      });
    }

    const manager = await prisma.managers.findUnique({
      where: { 
        UserId,
      } 
    });
  
    if ( !manager ) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "此四眾個資尚未邀請系統權限，請洽系統管理員"
      });
    }

    const assignLineToManager = await this.prismaClient.managers.update({
      where: { Id: manager.Id },
      data: {
        Line: String(lineUserId),
      }
    });

    return responseSuccess("綁定 Line 第三方登入成功", { manager: assignLineToManager });
  }
}
