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
