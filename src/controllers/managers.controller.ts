/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Example,
  Get,
  Header,
  Post,
  Path,
  Queries,
  Res,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags
} from "tsoa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { TsoaResponse } from "src/utils/responseTsoaError";

import { user_auth_qr_codes_view } from "@prisma/client";
import { ManagersService } from "../services/managers.service";
import {
  GetManyRequest,
  QRCodeRequest,
  SignInByEmailRequest,
  SignUpByEmailRequest
} from "../models";
import { responseSuccess } from "../utils/responseSuccess";
import prisma from "../configs/prismaClient";

@Tags("Manager")
@Route("/api/managers")
export class ManagersController extends Controller {
  constructor(private readonly _manager = new ManagersService()) {
    super();
  }

  /**
   * 查詢管理員
   * @param order 正序("asc") / 倒序("desc")
   * @param take 顯示數量
   * @param skip 略過數量
   */
  @Get()
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  public async getMany(@Queries() getManyRequest: GetManyRequest) {
    return this._manager.getMany(getManyRequest);
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
   @Body() signUpByEmailRequest: SignUpByEmailRequest,
   @Res()    
   errorResponse: TsoaResponse<
     StatusCodes.BAD_REQUEST,
     { status: false; message?: string }
   >    
 ) {
   return this._manager.signUp(signUpByEmailRequest, undefined, errorResponse);
 }

  /**
   * 用 QRCode 信箱註冊管理員身分
   * @param qrcode 
   * @param signUpByEmailRequest 
   * @param errorResponse 
   * @returns 
   */
  @Post("signup/{qrcode}")
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
  public async signUpByQRCode(    
    @Path() qrcode: string,
    @Body() signUpByEmailRequest: SignUpByEmailRequest,
    @Res()    
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >    
  ) {
    return this._manager.signUp(signUpByEmailRequest, qrcode, errorResponse);
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
    @Body() signInByEmailRequest: SignInByEmailRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    return this._manager.signIn(signInByEmailRequest, errorResponse);
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
    return this._manager.checkAuthorization();
  }

  /**
   * 使用 Jwt token 獲得當前管理員個人檔案
   */
  @Security("jwt", ["manager"])
  @Get("profile")
  @SuccessResponse(StatusCodes.OK, "已獲得管理員個人檔案")
  @Response(StatusCodes.BAD_REQUEST, "請重新登入")
  @Example({
    status: true,
    message: "已獲得管理員個人檔案"
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

    return responseSuccess("已獲得管理員個人檔案", { userId: Number(UserId) });
  }

  /**
     * 查詢使用者權限核發 API
     * 
     * 查看管理者註冊碼使用狀況
     * @param Authorization JWT 檢查該 User 是否有查詢權限
     * @param errorResponse
     * @returns
     */
  @Security("jwt", ["manager"])
  @Get("qrcode/status")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  @Example({
    status: true,
    message: "查詢成功",
    data: [
      {
        "Id": 19,
        "UserId": 45,
        "Gender":"男",        
        "DharmaName": null,
        "Name": "黃某甲",
        "DeaconId": 3,
        "DeaconName": "知客志工",
        "AuthorizeUserId": 4,
        "AuthorizeDharmaName": "王曉明",
        "AuthorizeDate": "2023/6/5",
        "Status": "註冊連結失效"
      }
    ]
  })
  public async getQRCodeStatus(
    @Header() Authorization: string,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 授權人身分驗證
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

    // 檢查查詢人的權限
    const { UserId } = jwt.decode(token) as JwtPayload;  

    const manager = await prisma.managers.findFirst({
      where: { 
        UserId: Number(UserId),
        IsActive: true
      }
    });

    if (manager == null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "此帳號無查詢權限"
      });
    }
    
    // 查詢 qrcode 使用狀態
    const qrcodeStatus = await prisma.user_auth_qr_codes_view.findMany({
      orderBy: { AuthorizeDate: 'desc' }
    }) as user_auth_qr_codes_view[];
    
    if (qrcodeStatus == null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查詢失敗"
      });
    }

    return responseSuccess("查詢成功", { data: qrcodeStatus });
  }

  /**
   * 取得註冊碼 or 更新 managers 授權
   * @param Authorization JWT
   * @param qrCodeRequest
   * @param errorResponse
   * @returns
   */
  @Security("jwt", ["manager"])
  @Post("qrcode")
  @SuccessResponse(StatusCodes.CREATED, "註冊碼取得成功")
  @Response(StatusCodes.BAD_REQUEST, "註冊碼取得失敗")
  @Example({
    status: true,
    message: "註冊碼取得成功",
    data: {
      qrcode: "109156be-c4fb-41ea-b1b4-efe1671c5836"
    }
  })
  public async getQRCodeOrResetManager(
    @Header() Authorization: string,
    @Body() qrCodeRequest: QRCodeRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 授權人身分驗證
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

    const { AuthorizeUserId, UserId, DeaconName } = qrCodeRequest;
    const deaconId = await this.changeToItemId("執事名稱", DeaconName);

    // 檢查 UserId 有沒建過資料
    const manager = await prisma.managers.findFirst({ where: { UserId } });

    if (manager != null) {
      // 已建過

      if (manager.IsActive) {
        // 帳號可使用，且權限等級一樣，不做處理
        if (manager.DeaconId === deaconId) {
          return errorResponse(StatusCodes.BAD_REQUEST, {
            status: false,
            message: "帳號已存在，請使用原帳號登入"
          });
        }
      }

      const newData = {
        DeaconId: deaconId,
        AuthorizeUserId,
        IsActive: true,
        UpdateAt: this.getDate()
      };

      // 停用帳戶 or 權限等級不一樣，重新設定
      const isSuccess = await prisma.managers.update({
        where: { UserId },
        data: newData
      });

      if (isSuccess) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: "帳號已存在，已更新設定，請使用原帳號登入"
        });
      }

      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "帳號停用，重新啟用失敗"
      });
    }

    // 沒建過帳戶，要產生註冊碼
    const endTime = this.getDate();

    let qrCodeData = await prisma.user_auth_qr_codes.findFirst({
      where: {
        UserId,
        DeaconId: deaconId,
        EndTime: { gte: endTime },
        HasUsed: false
      }
    });

    if (qrCodeData == null) {
      // 沒有可用註冊碼
      endTime.setMinutes(endTime.getMinutes() + 20);

      const data = {
        UserId,
        DeaconId: deaconId,
        AuthorizeUserId,
        QRCode: uuidv4(),
        EndTime: endTime
      };

      // 新建註冊碼
      qrCodeData = await prisma.user_auth_qr_codes.create({
        data
      });
    }

    if (qrCodeData == null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "註冊碼取得失敗"
      });
    }

    return responseSuccess("註冊碼取得成功", { qrcode: qrCodeData.QRCode });
  }

  /**
   * 測試用，不做權限驗證
   * @param qrCodeRequest
   * @param errorResponse
   * @returns
   */
  @Post("qrcodetest")
  @SuccessResponse(StatusCodes.OK, "註冊碼取得成功")
  @Response(StatusCodes.BAD_REQUEST, "註冊碼取得失敗")
  @Example({
    status: true,
    message: "註冊碼取得成功",
    data: {
      qrcode: "109156be-c4fb-41ea-b1b4-efe1671c5836"
    }
  })
  public async getQRCodeOrResetManagerTest(
    @Body() qrCodeRequest: QRCodeRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { AuthorizeUserId, UserId, DeaconName } = qrCodeRequest;
    const deaconId = await this.changeToItemId("執事名稱", DeaconName);

    // 檢查 UserId 有沒建過資料
    const manager = await prisma.managers.findFirst({ where: { UserId } });

    if (manager != null) {
      // 已建過

      if (manager.IsActive) {
        // 帳號可使用，且權限等級一樣，不做處理
        if (manager.DeaconId === deaconId) {
          return errorResponse(StatusCodes.BAD_REQUEST, {
            status: false,
            message: "帳號已存在，請使用原帳號登入"
          });
        }
      }

      const newData = {
        DeaconId: deaconId,
        AuthorizeUserId,
        IsActive: true,
        UpdateAt: this.getDate()
      };

      // 停用帳戶 or 權限等級不一樣，重新設定
      const isSucess = await prisma.managers.update({
        where: { UserId },
        data: newData
      });

      if (isSucess) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: "帳號已存在，已更新設定，請使用原帳號登入"
        });
      }

      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "帳號停用，重新啟用失敗"
      });
    }

    // 沒建過帳戶，要產生註冊碼
    const endTime = this.getDate();

    let qrCodeData = await prisma.user_auth_qr_codes.findFirst({
      where: {
        UserId,
        DeaconId: deaconId,
        EndTime: { gte: endTime },
        HasUsed: false
      }
    });

    if (qrCodeData == null) {
      // 沒有可用註冊碼
      endTime.setMinutes(endTime.getMinutes() + 20);

      const data = {
        UserId,
        DeaconId: deaconId,
        AuthorizeUserId,
        QRCode: uuidv4(),
        EndTime: endTime
      };

      // 新建註冊碼
      qrCodeData = await prisma.user_auth_qr_codes.create({
        data
      });
    }

    if (qrCodeData == null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "註冊碼取得失敗"
      });
    }

    return responseSuccess("註冊碼取得成功", { qrcode: qrCodeData.QRCode });
  }

  /**
   * 選項名稱換代號
   * @param groupName 選項種類名稱
   * @param itemValue 選項名稱
   * @returns 選項Id
   */
  private async changeToItemId(
    groupName: string,
    itemValue: string
  ): Promise<number> {
    const GroupName: string = groupName;
    const ItemValue: string = itemValue;
    const item = await prisma.item_name_mapping.findFirst({
      where: {
        GroupName,
        ItemValue
      },
      select: {
        ItemId: true
      }
    });
    const id = item?.ItemId;
    const resultId = Number(id);

    return resultId;
  }

  /**
   * 取得現在本地時間
   * @returns
   */
  private getDate() {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + 8);
    return date;
  }
}