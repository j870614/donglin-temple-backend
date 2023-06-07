export enum BuddhaSevenApplyStatus {
  APPLIED = "已報名佛七",
  CHECKED_IN = "已報到佛七",
  ROOM_APPLIED = "寮房已確認",
  ROOM_CHECKED_OUT = "已離單",
  NOT_CHECKED_IN = "無故未報到",
  UPDATED = "已更新掛單期間",
  CANCELLED = "已取消掛單"
}

export type BuddhaSevenApplyStatusKeys = keyof typeof BuddhaSevenApplyStatus;

export type BuddhaSevenApplyStatusValues =
  (typeof BuddhaSevenApplyStatus)[keyof typeof BuddhaSevenApplyStatus];
