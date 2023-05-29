export interface SignUpByEmailRequest {
  /**
   * 註冊人的 UserId，與 QRCode 則一填寫
   */
  UserId?: number;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  /**
   * 註冊碼：與 UserId 則一填寫<br>有給的話，會自動寫入 QRCodeRequest 的資訊
   */
  QRCode?: string
}

export interface SignInByEmailRequest {
  Email: string;
  Password: string;
}

/**
 * 產生註冊碼用的請求物件
 * @example
 * {
 *   "AuthorizeUserId": 1,
 *   "UserId": 45,
 *   "DeaconName": "知客師"
 * }
 */
export interface QRCodeRequest {
  /**
   * 授權人 UserId（要生 QRCode 的人）
   * @minimum 0
   */
  AuthorizeUserId: number;
  /**
   * QRCode 使用者的 UserId
   * - 唯一值，要在資料表[users]建過資料
   * - 要資料表[managers]沒建過的
   * @minimum 0 
   */
  UserId: number;
  /**
   * QRCode 使用者的管理權限等級
   * - 執事名稱：知客師, 總知客, 副總知客, 知客志工, 寮房, 系統管理員
   */
  DeaconName: string;
}