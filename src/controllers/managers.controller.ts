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
  Tags,
  Patch,
  Query
} from "tsoa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { TsoaResponse } from "src/utils/responseTsoaError";

import { ManagersService } from "../services/managers.service";
// import { lineCallback } from "../services/line.service";
import {
  ErrorData,
  GetManyRequest,
  ManagerRoleRequest,
  QRCodeRequest,
  SignInByEmailRequest,
  SignUpByEmailRequest,
  UpdateDBManagersRole
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
   * 修改 manager 權限，指定 UserId 的權限變更角色 or 是否啟用
   * @param authorization JWT 登入
   * @param managerRoleRequest 管理者角色請求物件
   * @param errorResponse
   * @returns
   */
  @Security("jwt", ["manager"])
  @Patch("auth")
  @SuccessResponse(StatusCodes.OK, "修改成功")
  @Response(StatusCodes.BAD_REQUEST, "修改失敗")
  public async updateManagerAuth(
    @Header() authorization: string,
    @Body() managerRoleRequest: ManagerRoleRequest,
    @Res()
    errorResponse: TsoaResponse<StatusCodes.BAD_REQUEST, ErrorData>
  ) {
    // 檢查有無登入 & 是否有管理員身分
    const authObj = await this.checkLoginAndManagerActive(authorization);

    if (!authObj.data.status) {
      return errorResponse(StatusCodes.BAD_REQUEST, authObj.data as ErrorData);
    }

    const { UserId, DeaconName, IsActive } = managerRoleRequest;

    // 檢查資料 & 取得更新物件 or 錯誤訊息
    const updateObj = await this.getUpdateManagerAuthObj(
      authObj.userId,
      UserId,
      DeaconName,
      IsActive
    ); // 更新用物件

    if (!updateObj.canUpdate) {
      return errorResponse(
        StatusCodes.BAD_REQUEST,
        updateObj.errorObj as ErrorData
      );
    }

    const result = await prisma.managers.update({
      where: { UserId },
      data: updateObj.data as UpdateDBManagersRole
    });

    return result === null
      ? errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: "修改失敗"
        })
      : SuccessResponse(StatusCodes.OK, "修改成功");
  }

  /**
   * 檢查資料 & 取得要更新物件（改角色or是否啟用）or 錯誤訊息
   * @param authorizeUserId 授權人 UserId
   * @param userId 要修改的 UserId
   * @param deaconName 要修改的執事名稱
   * @param isActive 是否啟用管理者
   * @returns
   */
  private async getUpdateManagerAuthObj(
    authorizeUserId: number,
    userId: number,
    deaconName: string | undefined,
    isActive: boolean | undefined
  ) {
    const manager = await prisma.managers.findFirst({
      where: { UserId: userId }
    });

    if (!manager) {
      return {
        canUpdate: false,
        errorObj: {
          status: false,
          message: "找不到 UserId"
        }
      };
    }

    // 檢查被授權角色
    if (deaconName) {
      const deaconId = await this.getDeaconIdByName(deaconName);

      if (deaconId === -1) {
        return {
          canUpdate: false,
          errorObj: {
            status: false,
            message: "找不到執事Id"
          }
        };
      }

      // 修改管理權限
      return {
        canUpdate: true,
        data: {
          DeaconId: deaconId,
          AuthorizeUserId: authorizeUserId,
          IsActive: true,
          UpdateAt: this.getDate()
        }
      };
    }

    // 修改成帳號啟用
    if (isActive) {
      if (manager.IsActive === isActive) {
        // 啟用沒異動，也沒輸入執事名稱
        return {
          canUpdate: false,
          errorObj: {
            status: false,
            message: "修改失敗，執事名稱及啟用狀態皆無異動"
          }
        };
      }

      if (manager.DeaconId > -1) {
        // 執事Id 有效才給啟用
        return {
          canUpdate: true,
          data: {
            AuthorizeUserId: authorizeUserId,
            IsActive: true,
            UpdateAt: this.getDate()
          }
        };
      }

      return {
        canUpdate: false,
        errorObj: {
          status: false,
          message: "未提供有效的執事名稱"
        }
      };
    }

    //  修改成停用帳號
    return {
      canUpdate: true,
      data: {
        AuthorizeUserId: authorizeUserId,
        IsActive: false,
        UpdateAt: this.getDate()
      }
    };
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
        Id: 19,
        UserId: 45,
        Gender: "女",
        DharmaName: null,
        Name: "黃某甲",
        ChurchName: null,
        DeaconId: 3,
        DeaconName: "知客志工",
        AuthorizeUserId: 4,
        AuthorizeName: null,
        AuthorizeDate: "2023/6/5",
        Status: "註冊連結失效"
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
    const authObj = await this.checkLoginAndManagerActive(Authorization);

    if (!authObj.data.status) {
      return errorResponse(
        StatusCodes.BAD_REQUEST,
        authObj.data as { status: false; message?: string | undefined }
      );
    }

    // 查詢 qrcode 使用狀態
    const qrcodeStatus = await prisma.user_auth_qr_codes_view.findMany({
      orderBy: { AuthorizeDate: "desc" }
    });

    if (qrcodeStatus == null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查詢失敗"
      });
    }

    return responseSuccess("查詢成功", { data: qrcodeStatus });
  }

  /**
   * 檢查有無登入 & 是否有管理員身分
   * @param authorization
   * @returns
   */
  private async checkLoginAndManagerActive(authorization: string) {
    const result = {
      userId: Number(-1),
      data: {
        status: false,
        message: ""
      }
    };

    // 授權人身分驗證
    if (!authorization || !authorization.startsWith("Bearer")) {
      result.data.message = "Authorization header 丟失";
      return result;
    }

    const [, token] = authorization.split(" ");
    if (!token) {
      result.data.message = "Token 丟失";
      return result;
    }

    // 檢查查詢人的權限
    const { UserId } = jwt.decode(token) as JwtPayload;

    result.userId = Number(UserId);

    const manager = await prisma.managers.findFirst({
      where: {
        UserId: result.userId,
        IsActive: true
      }
    });

    if (manager == null) {
      result.data.message = "此帳號無查詢權限";
      return result;
    }

    result.data.status = true;
    return result;
  }

  /**
   * 查詢使用者權限核發 API(測試用，不做身分驗證檢查)
   * @param errorResponse
   * @returns
   */
  @Get("qrcode/status-test")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查詢失敗")
  @Example({
    status: true,
    message: "查詢成功",
    data: [
      {
        Id: 19,
        UserId: 45,
        Gender: "女",
        DharmaName: null,
        Name: "黃某甲",
        DeaconId: 3,
        DeaconName: "知客志工",
        AuthorizeUserId: 4,
        AuthorizeDharmaName: null,
        AuthorizeDate: "2023/6/5",
        Status: "註冊連結失效"
      }
    ]
  })
  public async getQRCodeStatus2(
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 查詢 qrcode 使用狀態
    const qrcodeStatus = await prisma.user_auth_qr_codes_view.findMany({
      orderBy: { AuthorizeDate: "desc" }
    });

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
    const deaconId = await this.getDeaconIdByName(DeaconName);

    if (deaconId === -1) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "找不到執事Id"
      });
    }

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
   * 測試用，不做身分驗證檢查
   * @param qrCodeRequest
   * @param errorResponse
   * @returns
   */
  @Post("qrcode-test")
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
    const deaconId = await this.getDeaconIdByName(DeaconName);

    if (deaconId === -1) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "找不到執事Id"
      });
    }

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

    if (item) {
      return Number(item.ItemId);
    }

    return -1;
  }

  /**
   * 取得執事Id
   * @param deaconName 執事名稱
   * @returns
   */
  private async getDeaconIdByName(deaconName: string) {
    return this.changeToItemId("執事名稱", deaconName);
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

  /**
   * Line  登入
   */
  @Get("line")
  @SuccessResponse(StatusCodes.MOVED_TEMPORARILY, "轉址到 Line 登入頁面")
  @Response(StatusCodes.BAD_REQUEST, "Line 登入失敗")
  public lineLogin() {
    const lineLoginParams = {
      response_type: "code",
      client_id: String(process.env.LINE_CHANNEL_ID),
      redirect_uri: String(process.env.LINE_CALLBACK_URL),
      state: String(process.env.LINE_STATE),
      scope: "profile openid",
      nonce: String(process.env.LINE_NONCE),
      ui_locales: "ch-TW",
      initial_amr_display: "lineqr",
      disable_auto_login: "false"
    };

    const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
    Object.entries(lineLoginParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const lineLoginURL = url.toString();

    this.setStatus(StatusCodes.MOVED_TEMPORARILY);
    this.setHeader("Location", lineLoginURL);
  }

  /**
   * Line 登入 callback API
   */
  @Get("line/callback")
  @SuccessResponse(StatusCodes.OK, "Line 登入成功")
  @Response(StatusCodes.BAD_REQUEST, "Line 登入失敗")
  public lineCallback(
    @Query() code: string,
    @Query() state: string,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    return this._manager.lineCallback(code, state, errorResponse);
  }
}
