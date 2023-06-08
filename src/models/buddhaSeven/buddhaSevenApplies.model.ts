import { BuddhaSevenApplyStatusValues } from "../../enums/buddhaSevenApplies.enum";

export interface BuddhaSevenApplyGetManyRequest {
  /**
   * 查詢該年度之佛七預約報名表，預設為本年度
   */
  year?: number;
  /**
   * 查詢該月份之佛七預約報名表，預設為當月
   */
  month?: number;
  /**
   * 正序("asc") / 倒序("desc")，預設為正序排列
   */
  order?: "asc" | "desc";
  /**
   * 顯示數量，預設為 100 筆
   */
  take?: number;
  /**
   * 略過數量
   */
  skip?: number;
  /**
   * 目標狀態
   */
  status?: BuddhaSevenApplyStatusValues;
}
export interface BuddhaSevenApplyCreateRequest {
  UserId: number;
  CheckInDate: Date;
  CheckOutDate: Date;
  CheckInDateBreakfast: boolean;
  CheckInDateLunch: boolean;
  CheckInDateDinner: boolean;
  Remarks?: string;
  UpdateUserId: number;
}

export interface BuddhaSevenApplyCancelRequest {
  /**
   * 修改者 Id
   */
  UpdateUserId: number;
  /**
   * 註解
   */
  Remarks?: string;
}

export interface BuddhaSevenApplyCheckDate {
  UserId: number;
  CheckInDate: Date;
  CheckOutDate: Date;
}
