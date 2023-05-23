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
  Tags,
  Example
} from "tsoa";
import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import { prisma } from "../configs/prismaClient";

import { UserCreateRequest } from "../models";

@Tags("User - 四眾個資")
@Route("/api/users")
@Example({
  "status": true,
  "message": "查詢成功",
  "data": {
    "users": [
      {
        "Id": 13,
        "MobilePrefix": null,
        "Mobile": "0911123123",
        "Name": "王某某",
        "DharmaName": "普某",
        "MageNickname": null,
        "LineId": null,
        "Email": "testUser13@test.com",
        "IsMonk": false,
        "StayIdentity": 3,
        "IsMale": true,
        "BirthDate": "1990-01-01T00:00:00.000Z",
        "IdNumber": "G145698745",
        "PassportNumber": null,
        "BirthPlace": "宜蘭縣",
        "Phone": "039590000",
        "Ordination": null,
        "Altar": null,
        "ShavedMaster": null,
        "ShavedDate": null,
        "OrdinationTemple": null,
        "OrdinationDate": null,
        "ResidentialTemple": null,
        "RefugueMaster": "某某法師",
        "RefugueDate": "2023-01-01T00:00:00.000Z",
        "Referrer": null,
        "ClothType": null,
        "ClothSize": null,
        "EmergencyName": null,
        "EmergencyPhone": null,
        "Relationship": null,
        "Expertise": null,
        "Education": null,
        "ComeTempleReason": null,
        "HealthStatus": null,
        "EatBreakfast": false,
        "EatLunch": false,
        "EatDinner": false,
        "Address": null,
        "Remarks": null,
        "UpdateAt": "2023-05-14T08:51:49.000Z"
      }
    ]
  }
})
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
  @Example({
    "status": true,
    "message": "查詢成功",
    "data": {
      "user": {
        "Id": 13,
        "MobilePrefix": null,
        "Mobile": "0911123123",
        "Name": "王某某",
        "DharmaName": "普某",
        "MageNickname": null,
        "LineId": null,
        "Email": "testUser13@test.com",
        "IsMonk": false,
        "StayIdentity": 3,
        "IsMale": true,
        "BirthDate": "1990-01-01T00:00:00.000Z",
        "IdNumber": "G145698745",
        "PassportNumber": null,
        "BirthPlace": "宜蘭縣",
        "Phone": "039590000",
        "Ordination": null,
        "Altar": null,
        "ShavedMaster": null,
        "ShavedDate": null,
        "OrdinationTemple": null,
        "OrdinationDate": null,
        "ResidentialTemple": null,
        "RefugueMaster": "某某法師",
        "RefugueDate": "2023-01-01T00:00:00.000Z",
        "Referrer": null,
        "ClothType": null,
        "ClothSize": null,
        "EmergencyName": null,
        "EmergencyPhone": null,
        "Relationship": null,
        "Expertise": null,
        "Education": null,
        "ComeTempleReason": null,
        "HealthStatus": null,
        "EatBreakfast": false,
        "EatLunch": false,
        "EatDinner": false,
        "Address": null,
        "Remarks": null,
        "UpdateAt": "2023-05-14T08:51:49.000Z"
      }
    }
  })
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
  @Example({
    "status": true,
    "message": "新增四眾個資成功",
    "data": {
      "user": {
        "Id": 44,
        "MobilePrefix": null,
        "Mobile": "0905123147",
        "Name": "黃某某",
        "DharmaName": "普丙",
        "MageNickname": null,
        "LineId": null,
        "Email": null,
        "IsMonk": false,
        "StayIdentity": 3,
        "IsMale": true,
        "BirthDate": null,
        "IdNumber": null,
        "PassportNumber": null,
        "BirthPlace": null,
        "Phone": null,
        "Ordination": null,
        "Altar": null,
        "ShavedMaster": null,
        "ShavedDate": null,
        "OrdinationTemple": null,
        "OrdinationDate": null,
        "ResidentialTemple": null,
        "RefugueMaster": null,
        "RefugueDate": null,
        "Referrer": null,
        "ClothType": null,
        "ClothSize": null,
        "EmergencyName": null,
        "EmergencyPhone": null,
        "Relationship": null,
        "Expertise": null,
        "Education": null,
        "ComeTempleReason": null,
        "HealthStatus": null,
        "EatBreakfast": false,
        "EatLunch": false,
        "EatDinner": false,
        "Address": null,
        "Remarks": "測試",
        "UpdateAt": "2023-05-22T15:08:35.000Z"
      }
    }
  })
  public async createUser(
    @Body() userCreateBody: UserCreateRequest,
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
  @Example({
    "status": true,
    "message": "修改四眾個資成功",
    "data": {
      "user": {
        "Id": 44,
        "MobilePrefix": null,
        "Mobile": "0905123147",
        "Name": "黃某某",
        "DharmaName": "普丙",
        "MageNickname": null,
        "LineId": null,
        "Email": null,
        "IsMonk": false,
        "StayIdentity": 3,
        "IsMale": true,
        "BirthDate": null,
        "IdNumber": null,
        "PassportNumber": null,
        "BirthPlace": null,
        "Phone": null,
        "Ordination": null,
        "Altar": null,
        "ShavedMaster": null,
        "ShavedDate": null,
        "OrdinationTemple": null,
        "OrdinationDate": null,
        "ResidentialTemple": null,
        "RefugueMaster": null,
        "RefugueDate": null,
        "Referrer": null,
        "ClothType": null,
        "ClothSize": null,
        "EmergencyName": null,
        "EmergencyPhone": null,
        "Relationship": null,
        "Expertise": null,
        "Education": null,
        "ComeTempleReason": null,
        "HealthStatus": null,
        "EatBreakfast": false,
        "EatLunch": false,
        "EatDinner": false,
        "Address": null,
        "Remarks": "測試",
        "UpdateAt": "2023-05-22T15:08:35.000Z"
      }
    }
  })
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
    userCreateBody: UserCreateRequest
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
    userCreateBody: UserCreateRequest
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
