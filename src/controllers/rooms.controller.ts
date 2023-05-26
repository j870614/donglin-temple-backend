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
    const rooms = await prisma.rooms.findMany({
      orderBy: { Id: order },
      take,
      skip
    });
    const viewType = await prisma.room_type_list.findMany({});
    const viewRoomData = await prisma.rooms_view.findMany({});
    const roomsDormitoryAreaBuildingList=await prisma.rooms_dormitory_area_building_list.findMany({});

    const mergedData=rooms.map(room=>{
      const viewRoom=viewRoomData.find(view => view.RoomId === room.Id);
      const roomType=viewType.find(type => type.RoomType === room.RoomType);
      const viewAreaBuildList=roomsDormitoryAreaBuildingList.find(buildList=>buildList.Id === room.Id);
      return {
        ...room,
        ...viewRoom,
        ...roomType,
        ...viewAreaBuildList
      }
    })
    return responseSuccess("查詢成功", { rooms: mergedData });
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
    let mergedData;

    const room = await prisma.rooms.findUnique({
      where: {
        Id: id
      }
    });
    if (room) {
      const viewType = await prisma.room_type_list.findMany({
        where: {
          RoomType: room.RoomType
        }
      });
      const viewRoomData = await prisma.rooms_view.findMany({
        where: {
          RoomId: room.Id
        }
      });
    
      const viewRoomAreaBuildList = await prisma.rooms_dormitory_area_building_list.findMany({
        where: {
          Id: room.Id
        }
      });
    
      const viewRoom = viewRoomData.find(view => view.RoomId === room.Id);
      const roomType = viewType.find(type => type.RoomType === room.RoomType);
      const viewAreaBuildList = viewRoomAreaBuildList.find(buildList => buildList.Id === room.Id);
    
      mergedData = {
        ...(room || {}),
        ...(viewRoom || {}),
        ...(roomType || {}),
        ...(viewAreaBuildList || {})
      };

    } else {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此 Room Id"
      });
    }

    return responseSuccess("查詢成功", { mergedData });
  }


}
