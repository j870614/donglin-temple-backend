/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Path,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags
} from "tsoa";
import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import { prisma } from "../configs/prismaClient";

import { UserCreateBody } from "../models/users.model";

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
      skip
    });

    return responseSuccess("查詢成功", { users: allUsers });
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
    const user = await prisma.users.findUnique({
      where: {
        Id: id
      }
    });

    if (!user) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此 User Id"
      });
    }

    return responseSuccess("查詢成功", { user });
  }

  /**
   * 新增四眾個資
   */
  @Post()
  @SuccessResponse(StatusCodes.OK, "新增成功")
  @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  public async createUser(
    @Body() userCreateBody: UserCreateBody,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    // 檢查四眾個資必填欄位，法師居士所須必填之欄位不同
    const { IsMonk, StayIdentity } = userCreateBody;
    let parsedStayIdentity: number;

    if (IsMonk) {
      this.checkMonkFields(errorResponse, userCreateBody); // 檢查法師欄位
    } else {
      this.checkBuddhistFields(errorResponse, userCreateBody); // 檢查居士欄位
    }

    // 住眾身分別字串轉 ItemId
    if ( typeof StayIdentity === "string") {
      parsedStayIdentity = await this.changeToItemId (StayIdentity);
      if ( !parsedStayIdentity ) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: 'StayIdentity 住眾身分別填寫錯誤'
        })
      }
    } else if (IsMonk) {
      // 未輸入住眾身分別，則設定預設值
      // 法師之住眾身分別預設值為外單法師
      parsedStayIdentity = 4;
    } else {
      // 居士之住眾身分別預設值為佛七蓮友
      parsedStayIdentity = 3;
    }

    const user = await prisma.users.create({
      data: { ...userCreateBody, StayIdentity: parsedStayIdentity }
    });

    return responseSuccess("新增四眾個資成功", { user });
  }

  /**
   * 修改四眾個資
   */
  @Patch('{id}')
  @SuccessResponse(StatusCodes.OK, "修改成功")
  @Response(StatusCodes.BAD_REQUEST, "修改失敗")
  public async updateUser (
    @Path() id: number,
    @Body() updateData: Partial<UserCreateBody>,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const user = await prisma.users.findUnique({
      where: {
        Id: id,
      },
    });

    if (!user) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: '查無此四眾 Id',
      })
    }

    // 住眾身分別 StayIdentity 字串轉 ItemId
    const { StayIdentity } = updateData;
    let parsedStayIdentity: number;
    if (typeof StayIdentity === "string") {
      parsedStayIdentity = await this.changeToItemId (StayIdentity);
      if ( !parsedStayIdentity ) {
        return errorResponse(StatusCodes.BAD_REQUEST, {
          status: false,
          message: 'StayIdentity 住眾身分別填寫錯誤'
        })
      }
    } else {
      parsedStayIdentity = Number(user.StayIdentity);
    }

    const updateUser = await prisma.users.update ({
      where: {
        Id: id,
      },
      data: { ...updateData, StayIdentity: parsedStayIdentity },
    });

    return responseSuccess("修改四眾個資成功", { updateUser });
  }

  /**
   *   檢查法師必填欄位
   */
  private checkMonkFields(
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    userCreateBody: UserCreateBody
  ) {
    const { DharmaName, ShavedMaster } = userCreateBody;
    const errMsgArr: string[] = [];

    if (!DharmaName) errMsgArr.push("法名");

    if (!ShavedMaster) errMsgArr.push("剃度師長德號");

    if (errMsgArr.length !== 0) {
      const errMsg = errMsgArr.join("、");
      errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: `${errMsg} 未填寫`
      });
    }
  }

  /**
   *   檢查居士必填欄位
   */
  private checkBuddhistFields(
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >,
    userCreateBody: UserCreateBody
  ) {
    const { Name } = userCreateBody;

    if (!Name) {
      errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "俗名未填寫"
      });
    }
  }

  /**
   *  住眾身分別 StayIdentity 字串轉 ItemId
   */
  private async changeToItemId (
    stayIdentity: string
  ): Promise<number> {
    const ItemValue: string = stayIdentity;
    const item = await prisma.item_name_mapping.findFirst({
      where: {
        ItemValue
      },
      select: {
        ItemId: true,
        ItemValue: true
      }
    });
    const newStayIdentity = item?.ItemId;
    const parsedStayIdentity = Number(newStayIdentity);

    return parsedStayIdentity;
  }
}
