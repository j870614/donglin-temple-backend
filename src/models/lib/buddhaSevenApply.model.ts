export interface BuddhaSevenApplyRequest {
  UserId: number
  RoomId?: number
  BedStayOrderNumber?: number | null
  CheckInDate: Date | null
  CheckOutDate: Date | null
  CheckInDateBreakfast: boolean | null
  CheckInDateLunch: boolean | null
  CheckInDateDinner: boolean | null
  CheckInTime?: Date | null
  CheckeInUserId?: number
  Status?: string | null
  Remarks?: string | null
  UpdateUserId: number
}