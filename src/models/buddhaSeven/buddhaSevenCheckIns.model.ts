export interface BuddhaSevenApplyCheckInRequest {
  /**
   * 修改者 Id
   */
  UpdateUserId: number;
  /**
   * Check-in 者 Id (同修改者)
   */
  CheckInUserId: number;
  /**
   * Check-in 時間 (選填)
   */
  CheckInTime?: Date;
  /**
   * 註解
   */
  Remarks?: string;
}
