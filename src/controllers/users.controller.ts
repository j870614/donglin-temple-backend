/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Path,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { TsoaResponse } from "src/utils/ErrorResponse";
import { prisma } from "../configs/prismaClient";

import { User } from "../models/users.model";

@Tags("User - 四眾個資")
@Route("/api/users")
export class UsersController extends Controller {
  /**
   * 取得所有四眾個資
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
    const allUsers = await prisma.users.findMany({
      orderBy: { Id: order },
      take,
      skip,
    });

    return { status: true, allUsers };
  }

  /**
   *
   * 取得單一四眾個資
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查無 id")
  public async getUser(
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const guest = await prisma.users.findUnique({
      where: {
        Id: id,
      },
    });

    if (!guest) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此 User Id",
      });
    }

    return { status: true, guest };
  }

  /**
   * 新增四眾個資
   */
  @Post()
  @SuccessResponse(StatusCodes.OK, "新增成功")
  @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  public async createUser(
    @Body() newUser: User,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 檢查四眾個資必填欄位，法師居士所須必填之欄位不同
    const { IsMonk } = newUser;
    if (IsMonk) {
      this.checkMonkFields(errorResponse, newUser); // 檢查法師欄位 
    } else {
      this.checkBuddhistFields(errorResponse, newUser); // 檢查居士欄位
    }

    // 住眾身分別字串轉 ItemId
    const { StayIdentity } = newUser;

    if ( StayIdentity && typeof StayIdentity === 'string') {
      const ItemValue: string = StayIdentity;
      const item = await prisma.item_name_mapping.findFirst({
        where: {
          ItemValue,
        },
        select: {
          ItemId: true,
          ItemValue: true,
        },
      });
      const newStayIdentity = item?.ItemId;
      newUser = { ...newUser, StayIdentity: Number(newStayIdentity)}; 
    } else {
      console.log('未輸入住眾身分別');
      // 未輸入住眾身分別，則設定預設值
      if (IsMonk) {
        console.log('法師');
        // 法師之住眾身分別預設值為外單法師
        newUser = { ...newUser, StayIdentity: 4}; 
      } else {
        console.log('居士');
        // 居士之住眾身分別預設值為佛七蓮友
        newUser = { ...newUser, StayIdentity: 3}; 
      }
    }
    

    const user = await prisma.users.create({
      data: newUser
    });

    return {
      status: true,
      message: "新增四眾個資成功",
      data: { user }
    };
  }

  /**
   *   檢查法師必填欄位
   */
  private checkMonkFields (
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    newUser: User
  ) {
    const { DharmaName, ShavedMaster } = newUser;
    const errMsgArr: string[] = [];

    if (!DharmaName) errMsgArr.push("法名");

    if (!ShavedMaster) errMsgArr.push("剃度師長德號");

    if (errMsgArr.length !== 0) {
      const errMsg = errMsgArr.join("、");
      errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: `${errMsg} 未填寫`,
      })
    }
  };

  /**
   *   檢查居士必填欄位
   */
  private checkBuddhistFields  (
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    newUser: User
  ) {
    const { Name } = newUser;

    if (!Name) {
      errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: '俗名未填寫',
      })
    }
  };
}
