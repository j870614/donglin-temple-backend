/* eslint-disable class-methods-use-this */

import { StatusCodes } from "http-status-codes";
import {
  BodyProp,
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
import { managers } from "@prisma/client";
import { TsoaResponse } from "src/utils/ErrorResponse";
import { prisma } from "../configs/prismaClient";

@Tags("Guest - 四眾個資")
@Route("/api/guests")
export class GuestsController extends Controller {
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
  public async getGuest (
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

//   public createUser = async (
//     req: GuestRequest,
//     res: Response,
//     next: NextFunction
//   ) => {
//     try {
//       const { IsMonk, Gender } = req.body;

//       if (Gender === undefined) {
//         next(appError(StatusCodes.BAD_REQUEST, "性別未填寫", next));
//         return;
//       }

//       if (IsMonk === undefined) {
//         next(appError(StatusCodes.BAD_REQUEST, "身分別未填寫", next));
//         return;
//       }

//       if (IsMonk) {
//         this.checkMonkFields(req, res, next);
//       } else {
//         this.checkBuddhistFields(req, res, next);
//       }

//       const {
//         MobilePrefix,
//         Mobile,
//         Name,
//         DharmaName,
//         MageNickname,
//         LineId,
//         Email,
//         StayIdentity,
//         BirthDate,
//         IdNumber,
//         PassportNumber,
//         BirthPlace,
//         Phone,
//         Ordination,
//         Altar,
//         ShavedMaster,
//         ShavedDate,
//         OrdinationTemple,
//         OrdinationDate,
//         ResidentialTemple,
//         RefugueMaster,
//         RefugueDate,
//         Referrer,
//         ClothType,
//         ClothSize,
//         EmergencyName,
//         EmergencyPhone,
//         Relationship,
//         Expertise,
//         Education,
//         ComeTempleReason,
//         HealthStatus,
//         EatBreakfast,
//         EatLunch,
//         EatDinner,
//         Address,
//         Remarks
//       } = req.body;
//       console.log(typeof IsMonk);
//       const user = await prisma.users.create({
//         data: {
//           MobilePrefix,
//           Mobile,
//           Name,
//           DharmaName,
//           MageNickname,
//           LineId,
//           Email,
//           IsMonk,
//           StayIdentity,
//           Gender,
//           BirthDate,
//           IdNumber,
//           PassportNumber,
//           BirthPlace,
//           Phone,
//           Ordination,
//           Altar,
//           ShavedMaster,
//           ShavedDate,
//           OrdinationTemple,
//           OrdinationDate,
//           ResidentialTemple,
//           RefugueMaster,
//           RefugueDate,
//           Referrer,
//           ClothType,
//           ClothSize,
//           EmergencyName,
//           EmergencyPhone,
//           Relationship,
//           Expertise: undefined,
//           Education,
//           ComeTempleReason,
//           HealthStatus: undefined,
//           EatBreakfast,
//           EatLunch,
//           EatDinner,
//           Address: undefined,
//           Remarks
//         }
//       });

//       responseSuccess(res, StatusCodes.OK, user);
//     } catch (error: unknown) {
//       if (error instanceof Error) throw error;
//       throw new Error("Unexpected error in guests createUser");
//     }
//   };

//   private checkMonkFields = (
//     req: GuestRequest,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const { DharmaName, ShavedMaster } = req.body;
//     const errMsgArr: string[] = [];

//     if (!DharmaName) errMsgArr.push("法名");

//     if (!ShavedMaster) errMsgArr.push("剃度師長德號");

//     if (errMsgArr.length !== 0) {
//       const errMsg = errMsgArr.join("、");
//       next(appError(StatusCodes.BAD_REQUEST, `${errMsg} 未填寫`, next));
//     }
//   };

//   private checkBuddhistFields = (
//     req: GuestRequest,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const { Name } = req.body;

//     if (!Name) {
//       next(appError(StatusCodes.BAD_REQUEST, `俗名未填寫`, next));
//     }
//   };
}
