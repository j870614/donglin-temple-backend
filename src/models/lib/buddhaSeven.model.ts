import { BuddhaSevenStatusValues } from "../../enums/buddhaSeven.enum";

/**
 * @example {
 *  "StartSevenDate": "2023-01-01",
    "CompleteDate": "2023-01-07",
    "Remarks":"前端新增測試"
 * }
 */
export interface BuddhaSeven {
  StartSevenDate: Date;
  CompleteDate: Date;
  Remarks?: string | null;
}

export interface BuddhaSevenGetManyRequest {
  year?: number;
  month?: number;
  order?: "asc" | "desc";
  take?: number;
  skip?: number;
  status?: BuddhaSevenStatusValues;
}
