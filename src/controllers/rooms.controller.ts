/* eslint-disable class-methods-use-this */
import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Example,
  Get,
  Query,
  Path,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  Patch
} from "tsoa";
// import { managers } from "@prisma/client";
import { TsoaResponse } from "src/utils/responseTsoaError";
import { responseSuccess } from "../utils/responseSuccess";
import prisma from "../configs/prismaClient";

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
    const roomsDormitoryAreaBuildingList =
      await prisma.rooms_dormitory_area_building_list.findMany({});

    const mergedData = rooms.map((room) => {
      const viewRoom = viewRoomData.find((view) => view.RoomId === room.Id);
      const roomType = viewType.find((type) => type.RoomType === room.RoomType);
      const viewAreaBuildList = roomsDormitoryAreaBuildingList.find(
        (buildList) => buildList.Id === room.Id
      );
      return {
        ...room,
        ...viewRoom,
        ...roomType,
        ...viewAreaBuildList
      };
    });
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

      const viewRoomAreaBuildList =
        await prisma.rooms_dormitory_area_building_list.findMany({
          where: {
            Id: room.Id
          }
        });

      const viewRoom = viewRoomData.find((view) => view.RoomId === room.Id);
      const roomType = viewType.find((type) => type.RoomType === room.RoomType);
      const viewAreaBuildList = viewRoomAreaBuildList.find(
        (buildList) => buildList.Id === room.Id
      );

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

  /**
   * 幫佛七報名 安排寮房
   * @param id 報名序號
   * @param roomId 寮房序號
   */
  @Patch("room-arrange")
  @SuccessResponse(StatusCodes.OK, "寮房分配成功")
  @Response(StatusCodes.BAD_REQUEST, "無法分配寮房")
  @Example({
    status: true,
    message: "安排寮房成功",
    data: {
      room: {
        Id: 50704,
        DormitoryAreaId: 5,
        BuildingId: 7,
        ShareId: 4,
        RoomType: 1,
        IsMale: true,
        TotalBeds: 2,
        ReservedBeds: 1,
        IsActive: true,
        UpdateAt: "2023-05-15T23:56:33.000Z",
        RoomId: 50704,
        DormitoryAreaName: "其他",
        BuildingName: "G",
        RoomTypeName: "一般寮房",
        GenderName: "男"
      },
      buddhaSevenApply: {
        Id: 1,
        UserId: 11,
        Name: null,
        DharmaName: "普某",
        IsMonk: true,
        IsMale: true,
        Mobile: "0901123123",
        Phone: "0395123123",
        RoomId: 50704,
        BedStayOrderNumber: 2,
        CheckInDate: "2023-06-11T00:00:00.000Z",
        CheckOutDate: "2023-06-17T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        CheckInUserName: null,
        CheckInUserDharmaName: null,
        CheckInUserIsMale: null,
        Status: "已取消",
        Remarks: "修改測試",
        UpdateUserId: 11,
        UpdateUserName: null,
        UpdateUserDharmaName: "普某",
        UpdateUserIsMale: true,
        UpdateAt: "2023-05-27T13:58:10.000Z"
      }
    }
  })
  public async assignRoom(
    @Body() request: { id: number; roomId: number },
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { id, roomId } = request;

    //  根據 Id 取得報名人資料
    const buddhaSevenApply = await prisma.buddha_seven_apply_view.findUnique({
      where: {
        Id: id
      }
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此報名序號"
      });
    }

    // 根據 roomId 取得寮房資料
    const room = await prisma.rooms.findUnique({
      where: {
        Id: roomId
      }
    });

    if (!room) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此寮房序號"
      });
    }

    // 檢查是否已經安排過寮房
    if (buddhaSevenApply.RoomId) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "已經安排過寮房"
      });
    }

    // 檢查佛七報名表性別與寮房性別是否相同
    if (buddhaSevenApply.IsMale !== room.IsMale) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "報名者性別與寮房性別不相符"
      });
    }

    // 檢查寮房是否已滿房
    const availableBeds = room.TotalBeds - room.ReservedBeds;
    if (availableBeds <= 0) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "寮房已滿"
      });
    }

    // 檢查寮房是否為一般寮房
    if (room.RoomType !== 1) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "寮房非一般寮房"
      });
    }

    // 根據可住人數更新寮房資料
    const updatedRoom = await prisma.rooms.update({
      where: {
        Id: roomId
      },
      data: {
        ReservedBeds: room.ReservedBeds + 1
      }
    });

    //  更新 buddha_seven_apply 的 RoomId 和 BedStayOrderNumber
    const updatedBuddhaSevenApply = await prisma.buddha_seven_apply.update({
      where: {
        Id: id
      },
      data: {
        RoomId: updatedRoom.Id,
        BedStayOrderNumber: updatedRoom.ReservedBeds
      }
    });

    return responseSuccess("寮房分配成功", {
      room: updatedRoom,
      buddhaSevenApply: updatedBuddhaSevenApply
    });
  }
}
