/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  Body,
  BodyProp,
  Controller,
  Example,
  Get,
  Header,
  Post,
  Queries,
  Res,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags
} from "tsoa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TsoaResponse } from "src/utils/responseTsoaError";

import { ManagersService } from "../services/managers.service";
import {
  GetManyRequest,
  SignInByEmailRequest,
  SignUpByEmailRequest
} from "../models";
import { responseSuccess } from "../utils/responseSuccess";

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
   * 產生空白管理員
   * @param counts 產生個數
   */
  @Post("generate")
  @SuccessResponse(StatusCodes.CREATED, "產生成功")
  @Response(StatusCodes.CREATED, "產生失敗")
  public async generate(@BodyProp() counts = 1) {
    return this._manager.generate(counts);
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
    return this._manager.signUp(signUpByEmailRequest, errorResponse);
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
  @Post("profile")
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
}
