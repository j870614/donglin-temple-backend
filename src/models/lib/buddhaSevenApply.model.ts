export interface BuddhaSevenApplyRequest {
  UserId: number;
  CheckInDate: Date;
  CheckOutDate: Date;
  CheckInDateBreakfast: boolean;
  CheckInDateLunch: boolean;
  CheckInDateDinner: boolean;
  Remarks?: string;
  UpdateUserId: number;
}