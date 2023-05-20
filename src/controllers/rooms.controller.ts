/* eslint-disable class-methods-use-this */

import { StatusCodes } from "http-status-codes";
import {
  // BodyProp,
  Controller,
  // Example,
  Get,
  // Post,
  Query,
  Path,
  Res,
  Response,
  Route,
  // Security,
  SuccessResponse,
  Tags
} from "tsoa";
// import { managers } from "@prisma/client";
import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import { prisma } from "../configs/prismaClient";

@Tags("Room - 寮房狀態")
@Route("/api/rooms")
export class RoomsController extends Controller {
  /**
   * 取得所有寮房狀態
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
    const allRooms = await prisma.rooms.findMany({
      orderBy: { Id: order },
      take,
      skip
    });

    return responseSuccess("查詢成功", { rooms: allRooms });
  }

  /**
   *
   * 取得單一寮房狀態
   */
  @Get("{id}")
  @SuccessResponse(StatusCodes.OK, "查詢成功")
  @Response(StatusCodes.BAD_REQUEST, "查無 id")
  public async getRoom(
    @Path() id: number,
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const room = await prisma.rooms.findUnique({
      where: {
        Id: id
      }
    });

    if (!room) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此 Room Id"
      });
    }

    return responseSuccess("查詢成功", { room });
  }
}
