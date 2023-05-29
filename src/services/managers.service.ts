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
    const { UserId, Email, Password, ConfirmPassword, QRCode } = signUpByEmailRequest;
    
    if (!Email || !Password || !ConfirmPassword || !(UserId || QRCode)) {
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
    
    const userData = await this.getUserAuthDataFromQRCode(QRCode);
    const userId = userData? userData.UserId: UserId;
    
    const existingManagerByUserId = await prisma.managers.findFirst({
      where: { UserId: userId }
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
    let data;    

   if(userData){
    // 註冊碼帶的權限資料
      data = {
        Email,        
        UserId: userData.UserId,
        Password: hashedPassword,        
        DeaconId: userData.DeaconId,
        AuthorizeUserId: userData.AuthorizeUserId
      };

    }else{
      data = {
        Email,        
        UserId,
        Password: hashedPassword
      }; 
    }

    const signedManager = await prisma.managers.update({
      where: { Id: UnsignedManager.Id },
      data
    });

    if(userData){
      await this.getQRCodeSetUsed(QRCode);
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

  /**
   * 取得 user_auth_qr_codes 指定 QRCode，時效內且尚未啟用的資料
   * @param qrCode 註冊碼
   * @returns 
   */
  async getUserAuthDataFromQRCode(qrCode: string){
    if(!qrCode){
      return null;
    }

    const endTime = new Date();
    endTime.setUTCHours(endTime.getUTCHours()+8);

    return prisma.user_auth_qr_codes.findFirst({
      where: { 
        QRCode: qrCode ,
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
  async getQRCodeSetUsed(qrCode: string){
    if(!qrCode){
      return null;
    }

    return prisma.user_auth_qr_codes.update({
      where: { QRCode: qrCode },
      data: { HasUsed: true }
    });
  }
  // getProfile() {

  // }
}
