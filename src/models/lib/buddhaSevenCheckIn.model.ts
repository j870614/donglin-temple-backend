// export interface BuddhaSevenCheckInRequest {
//   UserId: number;
//   RoomId?: number;
//   BedStayOrderNumber?: number;
//   CheckInDate: Date;
//   CheckOutDate: Date;
//   CheckInDateBreakfast: boolean;
//   CheckInDateLunch: boolean;
//   CheckInDateDinner: boolean;
//   CheckInTime?: Date;
//   CheckInUserId?: number;
//   Status?: string;
//   Remarks?: string;
//   UpdateUserId: number;
// }

export interface BuddhaSevenCheckInUpdateRequest {
  UpdateUserId: number;
  CheckInUserId: number;
  CheckInTime?: Date;
  Remarks?: string;
}

export interface BuddhaSevenCheckInCancelRequest {
  UpdateUserId: number;
  Remarks?: string;
}
