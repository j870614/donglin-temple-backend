export enum BuddhaSevenStatus {
  APPLIED = "已報名佛七", // 新登錄報名
  CHECKED_IN = "已報到佛七", // 已報到
  ROOM_APPLIED = "寮房已確認", // 寮房已確認
  ROOM_CHECKED_OUT = "已離單", // 已離單
  NOT_CHECKED_IN = "無故未報到", // 無故未報到
  UPDATED = "已更新掛單期間", // 以更新資料
  CANCELLED = "已取消掛單" // 取消掛單？
}

export type BuddhaSevenStatusKeys = keyof typeof BuddhaSevenStatus;

export type BuddhaSevenStatusValues =
  (typeof BuddhaSevenStatus)[keyof typeof BuddhaSevenStatus];
// 新登錄報名、寮房已確認、已報到、已離單、取消掛單、未報到
