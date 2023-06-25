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
import {
  ErrorData,
  GetManyRequest,
  ManagerAuthRequest,
  QRCodeRequest,
  SignInByEmailRequest,
  SignUpByEmailRequest,
  UpdateDBManagersRole,
  LineLoginRequest
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
   * @param managerAuthRequest 管理者角色請求物件
   * @param errorResponse
   * @returns
   */
  @Security("jwt", ["manager"])
  @Patch("auth")
  @SuccessResponse(StatusCodes.OK, "修改成功")
  @Response(StatusCodes.BAD_REQUEST, "修改失敗")
  public async updateManagerAuth(
    @Header() authorization: string,
    @Body() managerAuthRequest: ManagerAuthRequest,
    @Res()
    errorResponse: TsoaResponse<StatusCodes.BAD_REQUEST, ErrorData>
  ) {
    // 檢查有無登入 & 是否有管理員身分
    const authObj = await this.checkLoginAndManagerActive(authorization);

    if (!authObj.data.status) {
      return errorResponse(StatusCodes.BAD_REQUEST, authObj.data as ErrorData);
    }

    const { UserId, ChurchName, DeaconName, IsActive } = managerAuthRequest;

    // 檢查資料 & 取得更新物件 or 錯誤訊息
    const updateObj = await this.getUpdateManagerAuthObj(
      authObj.userId,
      UserId,
      ChurchName,
      DeaconName,
      IsActive
    ); // 更新用物件

    if (!updateObj.canUpdate) {      
      return errorResponse(
        StatusCodes.BAD_REQUEST, 
        (updateObj as { errorObj: ErrorData }).errorObj
        );
    }

    const result = await prisma.managers.update({
      where: { UserId },
      data: (updateObj as { data: UpdateDBManagersRole }).data
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
   * @param churchName 要修改的堂口名稱
   * @param deaconName 要修改的執事名稱
   * @param isActive 是否啟用管理者
   * @returns 
   */
  private async getUpdateManagerAuthObj(
    authorizeUserId: number,
    userId: number,
    churchName: string | undefined,
    deaconName: string | undefined,
    isActive: boolean | undefined
  ) {    
    const errorData = {
      canUpdate: false,
      errorObj: {
        status: false,
        message: ""
      }
    };

    const manager = await prisma.managers.findFirst({
      where: { UserId: userId }
    });

    if (!manager) {
      errorData.errorObj.message = "找不到 UserId";
      return errorData;
    }

    let churchId = -1;

    if (churchName) {
      churchId = await this.getChurchIdByName(churchName);

      if (churchId === -1) {
        errorData.errorObj.message = "找不到堂口Id";
        return errorData;
      }

      if(!deaconName){
        // 只更新堂口
        return {
          canUpdate: true,
          data: {
            ChurchId: churchId,
            AuthorizeUserId: authorizeUserId,
            IsActive: true,
            UpdateAt: this.getDate()
          }
        };        
      }
    }

    // 檢查被授權角色
    if (deaconName) {
      const deaconId = await this.getDeaconIdByName(deaconName);

      if (deaconId === -1) {
        errorData.errorObj.message = "找不到執事Id";
        return errorData;
      }

      const data = {
        DeaconId: deaconId,
        AuthorizeUserId: authorizeUserId,
        IsActive: true,
        UpdateAt: this.getDate()
      };

      if(churchId > -1){
        // 更新堂口Id、執事Id
        return {
          canUpdate: true,
          data: {
            ChurchId: churchId,
            ...data
          }
        };
      }

      // 只更新執事Id
      return {
        canUpdate: true,
        data
      };
    }

    // 修改成帳號啟用 OR 停用
    if (manager.IsActive === isActive) {
      // 啟用沒異動，也沒輸入執事名稱
      errorData.errorObj.message = "修改失敗，執事名稱及啟用狀態皆無異動";
      return errorData;        
    }
    
    return {
      canUpdate: true,
      data: {
        AuthorizeUserId: authorizeUserId,
        IsActive: isActive,
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
        ChurchId: 0,
        ChurchName: "知客",
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
        ChurchId: 0,
        ChurchName: "知客",
        DeaconId: 3,
        DeaconName: "知客志工",
        AuthorizeUserId: 4,
        AuthorizeName: null,
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

    const { UserId: AuthorizeUserId } = jwt.decode(token) as JwtPayload;    
    const { UserId, ChurchName, DeaconName } = qrCodeRequest;
    const result = await this.getUpdateNameData(ChurchName, DeaconName);

    if(!result.canUpdate){
      // 缺少資料
      const error = result.errorObj as ErrorData;
      return errorResponse(StatusCodes.BAD_REQUEST, error);
    }      

    const authorizeUserId = Number(AuthorizeUserId); // 授權人
    const tempData = {
      ChurchId: Number(result.data?.churchId),
      DeaconId: Number(result.data?.deaconId),
    };

    // 檢查 UserId 有沒建過資料  
    const managerResult = await this.checkManagersOrUpdate(
      UserId, 
      tempData.ChurchId, 
      tempData.DeaconId,
      authorizeUserId
      );

    if(!managerResult.canUpdate){
      // 已經建過
      const error = result.errorObj as ErrorData;
      return errorResponse(StatusCodes.BAD_REQUEST, error);
    }

    const endTime = this.getDate(); 
    
    // 檢查有沒有時限內的註冊碼
    let qrCodeData = await prisma.user_auth_qr_codes.findFirst({
      where: { 
        ...tempData,
        UserId,
        EndTime: { gte: endTime },
        HasUsed: false
      }
    });

    if (qrCodeData == null) {      
      // 沒有可用註冊碼，要產生註冊碼 
      endTime.setMinutes(endTime.getMinutes() + 20);

      // 新建註冊碼
      qrCodeData = await prisma.user_auth_qr_codes.create({ 
        data: { 
          ...tempData,
          UserId,
          QRCode: uuidv4(),        
          AuthorizeUserId: authorizeUserId,
          EndTime: endTime
        }
      });
      
      if (qrCodeData == null) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: "註冊碼取得失敗"
        });
      }
    }

    return responseSuccess("註冊碼取得成功", { qrcode: qrCodeData.QRCode });
  }

  /**
   * 檢查 manager 有沒有見過資料，建過資料但設定不一致的做更新
   * @param UserId 
   * @param ChurchId 
   * @param DeaconId 
   * @param AuthorizeUserId 
   * @returns 
   */
  async checkManagersOrUpdate(
    UserId: number, 
    ChurchId: number, 
    DeaconId: number, 
    AuthorizeUserId: number
    ) {
    // 檢查 UserId 有沒建過資料
    const manager = await prisma.managers.findFirst({ where: { UserId } });

    if (manager == null) {
      // 沒建過資料
      return { canUpdate: true };
    }

    const errorData = {
      canUpdate: false,
      errorObj: {
        status: false,
        message: ""
      }
    };

    // 已建過
    if (manager.IsActive) {
      // 帳號可使用，且權限等級一樣，不做處理
      if (manager.DeaconId === DeaconId 
        && manager.ChurchId === ChurchId) {
          errorData.errorObj.message =  "帳號已存在，請使用原帳號登入"
          return errorData;
      }
    }

    // 停用帳戶 or 權限等級不一樣，重新設定
    const isSuccess = await prisma.managers.update({
      where: { UserId },
      data: {
        ChurchId,
        DeaconId,
        AuthorizeUserId,
        IsActive: true,
        UpdateAt: this.getDate()
      }
    });

    if (isSuccess) {
      errorData.errorObj.message =  "帳號已存在，已更新設定，請使用原帳號登"
      return errorData;
    }

    errorData.errorObj.message =  "帳號停用，重新啟用失敗"
    return errorData;
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
    const { AuthorizeUserId, UserId, ChurchName, DeaconName } = qrCodeRequest;
    const result = await this.getUpdateNameData(ChurchName, DeaconName);

    if(!result.canUpdate){
      // 缺少資料
      const error = result.errorObj as ErrorData;
      return errorResponse(StatusCodes.BAD_REQUEST, error);
    }      

    const authorizeUserId = Number(AuthorizeUserId); // 授權人
    const tempData = {
      ChurchId: Number(result.data?.churchId),
      DeaconId: Number(result.data?.deaconId),
    };

    // 檢查 UserId 有沒建過資料  
    const managerResult = await this.checkManagersOrUpdate(
      UserId, 
      tempData.ChurchId, 
      tempData.DeaconId,
      authorizeUserId
      );

    if(!managerResult.canUpdate){
      // 已經建過
      const error = result.errorObj as ErrorData;
      return errorResponse(StatusCodes.BAD_REQUEST, error);
    }

    const endTime = this.getDate(); 
    
    // 檢查有沒有時限內的註冊碼
    let qrCodeData = await prisma.user_auth_qr_codes.findFirst({
      where: { 
        ...tempData,
        UserId,
        EndTime: { gte: endTime },
        HasUsed: false
      }
    });

    if (qrCodeData == null) {      
      // 沒有可用註冊碼，要產生註冊碼 
      endTime.setMinutes(endTime.getMinutes() + 20);

      // 新建註冊碼
      qrCodeData = await prisma.user_auth_qr_codes.create({ 
        data: { 
          ...tempData,
          UserId,
          QRCode: uuidv4(),        
          AuthorizeUserId: authorizeUserId,
          EndTime: endTime
        }
      });
      
      if (qrCodeData == null) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: "註冊碼取得失敗"
        });
      }
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
   * 取得修改名稱的物件
   * @param ChurchName 堂口名稱
   * @param DeaconName 執事名稱
   * @returns 
   */
  async getUpdateNameData(ChurchName: string, DeaconName: string) {    
    if(!ChurchName || !DeaconName){
      return {
        canUpdate: false,
          errorObj: {
            status: false,
            message: "缺少堂口名稱或執事名稱"
          }
      };
    }

    const churchId = await this.getChurchIdByName(ChurchName);
    if(churchId === -1){      
      return {
        canUpdate: false,
          errorObj: {
            status: false,
            message: "無效堂口名稱"
          }
      };
    }

    const deaconId = await this.getDeaconIdByName(DeaconName);
    if(deaconId === -1){      
      return {
        canUpdate: false,
          errorObj: {
            status: false,
            message: "無效執事名稱"
          }
      };
    } 

    return {
      canUpdate: true,
      data: {
        churchId,
        deaconId
      }
    };
  }

  /**
   * 取得堂口Id
   * @param ChurchName 堂口名稱 
   * @returns 
   */
  private async getChurchIdByName(ChurchName: string) {
    return this.changeToItemId("堂口名稱", ChurchName);
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
   * Line 登入，全後端處理方式登入
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
   * Line 登入 callback API，若使用全後端處理方式登入 Line，前端可忽略此 API
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
    const lineLoginRequest: LineLoginRequest = {
      code,
      state
    }
    return this._manager.signInWithLine(lineLoginRequest, errorResponse);
  }

  /**
   * Line 登入驗證，前後端分離方式登入
   */
  @Get('line/signin')
  @SuccessResponse(StatusCodes.MOVED_TEMPORARILY, "轉址到 Line 登入頁面")
  @Response(StatusCodes.BAD_REQUEST, "Line 登入失敗")
  public verifyLineLoginWithFrontend () {
    const lineLoginParams = {
      response_type: 'code',
      client_id: String(process.env.LINE_CHANNEL_ID),
      redirect_uri: String(process.env.LINE_FRONTEND_CALLBACK_URL),
      state: String(process.env.LINE_STATE),
      scope: 'profile openid',
      nonce: String(process.env.LINE_NONCE),
      ui_locales: 'ch-TW',
      initial_amr_display: 'lineqr',
      disable_auto_login: 'false',
    };
    
    const url = new URL('https://access.line.me/oauth2/v2.1/authorize');
    Object.entries(lineLoginParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const lineLoginURL = url.toString();

    this.setStatus(StatusCodes.MOVED_TEMPORARILY);
    this.setHeader('Location', lineLoginURL);
  }

  /**
   * Line 登入，前後端分離方式登入。登入時 Request body 不需要帶入 UserId，只需回傳 Callback URL 參數上的 code 與 state。
   */
  @Post('line/signin')
  @SuccessResponse(StatusCodes.OK, "Line 登入成功")
  @Response(StatusCodes.BAD_REQUEST, "Line 登入失敗")
  public lineLoginWithFrontend (
    @Body() lineLoginRequest: LineLoginRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >

  ) {
    return this._manager.signInWithLine(lineLoginRequest, errorResponse, true);
  }

  /**
   * Managers 新註冊，並綁定 Line 第三方登入
   */
  @Post('line/signup/{qrcode}')
  @SuccessResponse(StatusCodes.OK, "Line 綁定成功")
  @Response(StatusCodes.BAD_REQUEST, "Line 綁定失敗")
  public signUpWithLine (
    @Path() qrcode: string,
    @Body() lineLoginRequest: LineLoginRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    return this._manager.signUpWithLine(lineLoginRequest, qrcode, errorResponse);
  }

  /**
   * 既有 Managers 綁定 Line 第三方登入
   */
  @Post('line/assign')
  @SuccessResponse(StatusCodes.OK, "Line 綁定成功")
  @Response(StatusCodes.BAD_REQUEST, "Line 綁定失敗")
  public assignLineToManager (
    @Body() lineLoginRequest: LineLoginRequest,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    return this._manager.assignLineToManager(lineLoginRequest, errorResponse);
  }
}
