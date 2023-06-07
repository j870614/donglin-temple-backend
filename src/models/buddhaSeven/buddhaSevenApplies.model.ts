import { BuddhaSevenApplyStatusValues } from "src/enums/buddhaSevenApplies.enum";

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

export interface BuddhaSevenApplyGetManyRequest {
  year?: number;
  month?: number;
  order?: "asc" | "desc";
  take?: number;
  skip?: number;
  status?: BuddhaSevenApplyStatusValues;
}
