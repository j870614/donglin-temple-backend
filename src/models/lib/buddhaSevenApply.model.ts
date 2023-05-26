export interface BuddhaSevenApplyRequest {
  UserId: number;
  RoomId?: number;
  BedStayOrderNumber?: number;
  CheckInDate: Date;
  CheckOutDate: Date;
  CheckInDateBreakfast: boolean;
  CheckInDateLunch: boolean;
  CheckInDateDinner: boolean;
  CheckInTime?: Date;
  CheckeInUserId?: number;
  Status?: string;
  Remarks?: string;
  UpdateUserId: number;
}