/**
 * @example {
 *  "StartSevenDate": "2023-01-01",
 *  "CompleteDate": "2023-01-07",
 *  "Remarks":"前端新增測試"
 * }
 */
export interface BuddhaSevenPeriodCreateRequest {
  /**
   * 佛七期數起始時間
   */
  StartSevenDate: "2023-01-01";
  /**
   * 佛七期數結束時間
   */
  CompleteDate: "2023-01-07";
  /**
   * 註解 (選填)
   */
  Remarks?: "前端新增測試";
}
