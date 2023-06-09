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
  @Response(StatusCodes.BAD_REQUEST, "查無此 Room Id")
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
    message: "寮房分配成功",
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

  /**
   * 更改佛七報名表的寮房
   * @param id 報名序號
   * @param newRoomId 新的寮房 ID
   */
  @Patch("/room-change")
  @SuccessResponse(StatusCodes.OK, "更改寮房成功")
  @Response(StatusCodes.BAD_REQUEST, "查無佛七報名資料或寮房資料不符合條件")
  @Example({
    status: true,
    message: "更改寮房成功",
    data: {
      oldRoom: {
        Id: 50702,
        DormitoryAreaId: 5,
        BuildingId: 7,
        ShareId: 2,
        RoomType: 1,
        IsMale: true,
        TotalBeds: 2,
        ReservedBeds: 1,
        IsActive: true,
        UpdateAt: "2023-05-15T23:56:32.000Z"
      },
      newRoom: {
        Id: 50701,
        DormitoryAreaId: 5,
        BuildingId: 7,
        ShareId: 1,
        RoomType: 1,
        IsMale: true,
        TotalBeds: 2,
        ReservedBeds: 2,
        IsActive: true,
        UpdateAt: "2023-05-15T23:56:32.000Z"
      },
      oldBuddhaSevenApply: {
        Id: 15,
        UserId: 13,
        Name: "王某某",
        DharmaName: "普某",
        IsMonk: false,
        IsMale: true,
        StayIdentity: 3,
        StayIdentityName: "佛七蓮友",
        Mobile: "0911123123",
        Phone: "039590000",
        EatBreakfast: false,
        EatLunch: false,
        EatDinner: true,
        RoomId: 50702,
        BedStayOrderNumber: 1,
        CheckInDate: "2023-06-21T00:00:00.000Z",
        CheckOutDate: "2023-06-27T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        CheckInUserName: null,
        CheckInUserDharmaName: null,
        CheckInUserIsMale: null,
        Status: "已報名佛七",
        Remarks: null,
        UpdateUserId: 11,
        UpdateUserName: null,
        UpdateUserDharmaName: "普某",
        UpdateUserIsMale: true,
        UpdateAt: "2023-06-08T12:34:11.000Z"
      },
      newBuddhaSevenApply: {
        Id: 15,
        UserId: 13,
        RoomId: 50701,
        BedStayOrderNumber: 2,
        CheckInDate: "2023-06-21T00:00:00.000Z",
        CheckOutDate: "2023-06-27T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        Status: "已報名佛七",
        Remarks: null,
        UpdateUserId: 11,
        UpdateAt: "2023-06-08T12:35:04.000Z"
      },
      changeOldBedStayOrderNumber: [
        {
          Id: 20,
          UserId: 13,
          RoomId: 50702,
          BedStayOrderNumber: 2,
          CheckInDate: "2023-07-01T00:00:00.000Z",
          CheckOutDate: "2023-07-07T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: null,
          CheckInUserId: null,
          Status: "已報名佛七",
          Remarks: null,
          UpdateUserId: 11,
          UpdateAt: "2023-06-08T12:34:40.000Z"
        }
      ],
      changeNewBedStayOrderNumber: [
        {
          Id: 20,
          UserId: 13,
          RoomId: 50702,
          BedStayOrderNumber: 1,
          CheckInDate: "2023-07-01T00:00:00.000Z",
          CheckOutDate: "2023-07-07T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: null,
          CheckInUserId: null,
          Status: "已報名佛七",
          Remarks: null,
          UpdateUserId: 11,
          UpdateAt: "2023-06-08T12:35:05.000Z"
        }
      ]
    }
  })
  public async changeBuddhaSevenRoom(
    @Body() request: { id: number; newRoomId: number },
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { id, newRoomId } = request;
    // 取得佛七報名資料
    const buddhaSevenApply = await prisma.buddha_seven_apply_view.findUnique({
      where: { Id: id }
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此報名序號"
      });
    }

    // 若原本沒有 RoomId
    if (buddhaSevenApply.RoomId === null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "佛七報名資料的寮房 ID 為空，請使用安排寮房的 API "
      });
    }
    // 取得舊的寮房資料
    const oldRoom = await prisma.rooms_view.findUnique({
      where: { RoomId: buddhaSevenApply.RoomId }
    });

    // 取得新的寮房資料
    const newRoom = await prisma.rooms_view.findUnique({
      where: { RoomId: newRoomId }
    });

    // 檢查新舊寮房在不再
    if (!oldRoom || !newRoom) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無寮房資料"
      });
    }

    // 檢查寮房性別是否符合報名表
    if (oldRoom.GenderName !== newRoom.GenderName) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "新寮房性別與報名表不相符"
      });
    }

    // 檢查新的寮房是否有變更
    if (newRoom.RoomId === oldRoom.RoomId) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "新的寮房與原寮房相同，請選擇不同的寮房"
      });
    }

    // 檢查新的寮房是否已滿
    if (!newRoom.IsActive || newRoom.ReservedBeds === newRoom.TotalBeds) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "新寮房已滿房"
      });
    }

    // 檢查新的寮房是否為一般寮房
    if (newRoom.RoomTypeName !== "一般寮房") {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "新寮房不是一般寮房"
      });
    }

    // 更新舊的寮房資料
    const updatedOldRoom = await prisma.rooms.update({
      where: { Id: oldRoom.RoomId },
      data: {
        ReservedBeds: oldRoom.ReservedBeds - 1
      }
    });

    // 更新新的寮房資料
    const updatedNewRoom = await prisma.rooms.update({
      where: { Id: newRoom.RoomId },
      data: {
        ReservedBeds: newRoom.ReservedBeds + 1
      }
    });

    // 更新佛七報名資料的寮房 ID
    const updatedBuddhaSevenApply = await prisma.buddha_seven_apply.update({
      where: { Id: buddhaSevenApply.Id },
      data: {
        RoomId: newRoom.RoomId,
        BedStayOrderNumber: updatedNewRoom.ReservedBeds
      }
    });

    let changeOldBedStayOrderNumber = null;
    let changeNewBedStayOrderNumber = null;
    // 如果佛七報名舊寮房的 BedStayOrderNumber 為 1 的住戶更換房間，則將舊寮房的 BedStayOrderNumber 為 2 的住戶設為 1
    if (buddhaSevenApply.BedStayOrderNumber === 1) {
      changeOldBedStayOrderNumber = await prisma.buddha_seven_apply.findMany({
        where: {
          RoomId: oldRoom.RoomId,
          BedStayOrderNumber: 2
        }
      });

      await prisma.buddha_seven_apply.updateMany({
        where: {
          RoomId: oldRoom.RoomId,
          BedStayOrderNumber: 2
        },
        data: {
          BedStayOrderNumber: 1
        }
      });

      changeNewBedStayOrderNumber = await prisma.buddha_seven_apply.findMany({
        where: {
          RoomId: oldRoom.RoomId,
          BedStayOrderNumber: 1
        }
      });
    }

    return {
      status: true,
      message: "更改寮房成功",
      data: {
        oldRoom: updatedOldRoom,
        newRoom: updatedNewRoom,
        oldBuddhaSevenApply: buddhaSevenApply,
        newBuddhaSevenApply: updatedBuddhaSevenApply,
        changeOldBedStayOrderNumber:
          buddhaSevenApply.BedStayOrderNumber === 1
            ? changeOldBedStayOrderNumber
            : null,
        changeNewBedStayOrderNumber:
          buddhaSevenApply.BedStayOrderNumber === 1
            ? changeNewBedStayOrderNumber
            : null
      }
    };
  }

  /**
 * 取消佛七報名寮房
 * @param id 報名序號
 */
  @Patch("/room-cancel")
  @SuccessResponse(StatusCodes.OK, "取消寮房成功")
  @Response(StatusCodes.BAD_REQUEST, "查無佛七報名資料或寮房資料不符合條件")
  @Example({
    status: true,
    message: "取消寮房成功",
    data: {
      oldRoom: {
        RoomId: 50702,
        DormitoryAreaId: 5,
        DormitoryAreaName: "其他",
        BuildingId: 7,
        BuildingName: "G",
        ShareId: 2,
        RoomType: 1,
        RoomTypeName: "一般寮房",
        IsMale: true,
        GenderName: "男",
        TotalBeds: 2,
        ReservedBeds: 2,
        IsActive: true,
        UpdateAt: "2023-05-15T23:56:32.000Z"
      },
      newRoom: {
        Id: 50702,
        DormitoryAreaId: 5,
        BuildingId: 7,
        ShareId: 2,
        RoomType: 1,
        IsMale: true,
        TotalBeds: 2,
        ReservedBeds: 1,
        IsActive: true,
        UpdateAt: "2023-05-15T23:56:32.000Z"
      },
      oldBuddhaSevenApply: {
        Id: 15,
        UserId: 13,
        RoomId: 50702,
        BedStayOrderNumber: 1,
        CheckInDate: "2023-06-21T00:00:00.000Z",
        CheckOutDate: "2023-06-27T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        Status: "已報名佛七",
        Remarks: null,
        UpdateUserId: 11,
        UpdateAt: "2023-06-06T12:25:02.000Z"
      },
      newBuddhaSevenApply: {
        Id: 15,
        UserId: 13,
        RoomId: null,
        BedStayOrderNumber: 1,
        CheckInDate: "2023-06-21T00:00:00.000Z",
        CheckOutDate: "2023-06-27T00:00:00.000Z",
        CheckInDateBreakfast: true,
        CheckInDateLunch: true,
        CheckInDateDinner: true,
        CheckInTime: null,
        CheckInUserId: null,
        Status: "已報名佛七",
        Remarks: null,
        UpdateUserId: 11,
        UpdateAt: "2023-06-08T12:19:12.000Z"
      },
      changeOldBedStayOrderNumber: [
        {
          Id: 20,
          UserId: 13,
          RoomId: 50702,
          BedStayOrderNumber: 2,
          CheckInDate: "2023-07-01T00:00:00.000Z",
          CheckOutDate: "2023-07-07T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: null,
          CheckInUserId: null,
          Status: "已報名佛七",
          Remarks: null,
          UpdateUserId: 11,
          UpdateAt: "2023-06-06T12:26:21.000Z"
        }
      ],
      changeNewBedStayOrderNumber: [
        {
          Id: 20,
          UserId: 13,
          RoomId: 50702,
          BedStayOrderNumber: 1,
          CheckInDate: "2023-07-01T00:00:00.000Z",
          CheckOutDate: "2023-07-07T00:00:00.000Z",
          CheckInDateBreakfast: true,
          CheckInDateLunch: true,
          CheckInDateDinner: true,
          CheckInTime: null,
          CheckInUserId: null,
          Status: "已報名佛七",
          Remarks: null,
          UpdateUserId: 11,
          UpdateAt: "2023-06-08T12:19:15.000Z"
        }
      ]
    }
  })
  public async cancelBuddhaSevenRoom(
    @Body() request: { id: number },
    @Res()
    errorResponse: TsoaResponse<
      StatusCodes.BAD_REQUEST,
      { status: false; message?: string }
    >
  ) {
    const { id } = request;

    // 取得佛七報名資料和關聯的寮房資料
    const buddhaSevenApply = await prisma.buddha_seven_apply.findUnique({
      where: { Id: id },
    });

    if (!buddhaSevenApply) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無此報名序號",
      });
    }

    if (buddhaSevenApply.RoomId === null) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "佛七報名資料的寮房資料不存在"
      });
    }

    const oldRoom = await prisma.rooms_view.findUnique({
      where: { RoomId: buddhaSevenApply.RoomId }
    });

    if (!oldRoom) {
      return errorResponse(StatusCodes.BAD_REQUEST, {
        status: false,
        message: "查無寮房資料"
      });
    }

    // 更新佛七報名資料，將房間 ID 設為 null，表示取消寮房，同時 BedStayOrderNumber 也設為 0
    const newBuddhaSeven = await prisma.buddha_seven_apply.update({
      where: { Id: id },
      data: { RoomId: null, BedStayOrderNumber: null },
    });

    // 更新舊寮房的 ReservedBeds
    const newRoom = await prisma.rooms.update({
      where: { Id: oldRoom.RoomId },
      data: { ReservedBeds: oldRoom.ReservedBeds - 1 },
    });

    let changeOldBedStayOrderNumber = null;
    let changeNewBedStayOrderNumber = null;

    // 檢查取消的佛七報名資料的 BedStayOrderNumber 是否為 1
    if (buddhaSevenApply.BedStayOrderNumber === 1) {
      // 尋找舊寮房的 BedStayOrderNumber 為 2 的佛七報名資料
      changeOldBedStayOrderNumber = await prisma.buddha_seven_apply.findMany({
        where: {
          RoomId: oldRoom.RoomId,
          BedStayOrderNumber: 2,
        },
      });

      // 更新舊寮房的 BedStayOrderNumber 為 1
      await prisma.buddha_seven_apply.updateMany({
        where: {
          RoomId: oldRoom.RoomId,
          BedStayOrderNumber: 2,
        },
        data: {
          BedStayOrderNumber: 1,
        },
      });

      // 尋找舊寮房的 BedStayOrderNumber 為 1 的佛七報名資料
      changeNewBedStayOrderNumber = await prisma.buddha_seven_apply.findMany({
        where: {
          RoomId: oldRoom.RoomId,
          BedStayOrderNumber: 1,
        },
      });
    }

    return {
      status: true,
      message: "取消寮房成功",
      data: {
        oldRoom,
        newRoom,
        oldBuddhaSevenApply: buddhaSevenApply,
        newBuddhaSevenApply: newBuddhaSeven,
        changeOldBedStayOrderNumber:
          buddhaSevenApply.BedStayOrderNumber === 1
            ? changeOldBedStayOrderNumber
            : null,
        changeNewBedStayOrderNumber:
          buddhaSevenApply.BedStayOrderNumber === 1
            ? changeNewBedStayOrderNumber
            : null
      },
    };
  }
}
