export interface BuddhaSevenApplyCheckInUpdateRequest {
  UpdateUserId: number;
  CheckInUserId: number;
  CheckInTime?: Date;
  Remarks?: string;
}

export interface BuddhaSevenApplyCheckInCancelRequest {
  UpdateUserId: number;
  Remarks?: string;
}
