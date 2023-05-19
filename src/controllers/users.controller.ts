/* eslint-disable class-methods-use-this */

import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Example,
  Get,
  Post,
  Query,
  Path,
  Res,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags
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
    @Query() order: 'asc' | "desc" = 'desc',
    @Query() take = 100,
    @Query() skip = 0
    ) {

    const allUsers = await prisma.users.findMany({
      orderBy: { Id: order },
      take,
      skip
    });

    return { status: true, allUsers };
  }

  /**
   * 
   * 取得單一四眾個資
   */
  @Get('{id}')
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查無 id")
  public async getUser (
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const guest = await prisma.users.findUnique({
      where: {
        Id: id
      }
    });

    if (!guest) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: '查無此 User Id'
      })
    }

    return { status: true, guest };
  };


  /**
   * 新增四眾個資
   */
  @Post()
  @SuccessResponse(StatusCodes.OK, "新增成功")
  @Response(StatusCodes.BAD_REQUEST, "新增失敗")
  public  async createUser (
    @Body() newUser: User,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
      console.log('newUser:', typeof newUser, newUser);
      const { IsMonk, IsMale } = newUser;
      console.log('IsMonk:', IsMonk);
      console.log('IsMale:', IsMale);

      if (IsMale === undefined) {
        return errorResponse(StatusCodes.BAD_REQUEST,{
          status: false,
          message: '性別未填寫'
        })
      }

      // if (IsMonk === undefined) {
      //   next(appError(StatusCodes.BAD_REQUEST, "身分別未填寫", next));
      //   return;
      // }

      // if (IsMonk) {
      //   this.checkMonkFields(req, res, next);
      // } else {
      //   this.checkBuddhistFields(req, res, next);
      // }

      // const user = await prisma.users.create({
      //   data: newUser
      // });

      // responseSuccess(res, StatusCodes.OK, user);
    
  };

  // private checkMonkFields = (
  //   req: GuestRequest,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   const { DharmaName, ShavedMaster } = req.body;
  //   const errMsgArr: string[] = [];

  //   if (!DharmaName) errMsgArr.push("法名");

  //   if (!ShavedMaster) errMsgArr.push("剃度師長德號");

  //   if (errMsgArr.length !== 0) {
  //     const errMsg = errMsgArr.join("、");
  //     next(appError(StatusCodes.BAD_REQUEST, `${errMsg} 未填寫`, next));
  //   }
  // };

  // private checkBuddhistFields = (
  //   req: GuestRequest,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   const { Name } = req.body;

  //   if (!Name) {
  //     next(appError(StatusCodes.BAD_REQUEST, `俗名未填寫`, next));
  //   }
  // };
}
