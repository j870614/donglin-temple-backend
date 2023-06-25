export interface SignUpByEmailRequest {
  /**
   * 註冊人的 UserId，與 QRCode 則一填寫
   */
  UserId?: number;
  Email: string;
  Password: string;
  ConfirmPassword: string;
}

export interface SignInByEmailRequest {
  Email: string;
  Password: string;
}

/**
 * 產生註冊碼用的請求物件
 * @example
 * {
 *   "AuthorizeUserId": 4,
 *   "UserId": 45, 
 *   "ChurchName":"知客",
 *   "DeaconName": "知客志工"
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
   * 堂口名稱
   * - 目前只開放：[知客, 寮房]
   */
  ChurchName: string;
  /**
   * QRCode 使用者的管理權限等級
   * - 執事名稱：[知客師, 總知客, 副總知客, 知客志工, 寮房, 系統管理員]
   */
  DeaconName: string;
}

/**
 * 管理者權限資料變更請求物件
 */
export interface ManagerAuthRequest {
  /**
   * 被修改人的 UserId
   * - 唯一值
   * @minimum 0 
   */
  UserId: number;
  /**
   * 堂口名稱
   * - 目前只開放：[知客, 寮房]
   */
  ChurchName: string | undefined;
  /**
   * 管理權者權限等級
   * - 執事名稱：[知客師, 總知客, 副總知客, 知客志工, 寮房, 系統管理員]
   */
  DeaconName: string | undefined;
  /**
   * 是否啟用
   */
  IsActive: boolean | undefined;
}

/**
 * 修改管理者角色 prisma update data
 */
export interface UpdateDBManagersRole {
  /**
   * 堂口名稱
   * - 目前只開放：[知客, 寮房]
   */
  ChurchId: number | undefined;
  /**
   * 管理權者權限等級
   * - 執事名稱：[知客師, 總知客, 副總知客, 知客志工, 寮房, 系統管理員]
   */
  DeaconId: number | undefined;
  /**
   * 授權人 UserId
   */
  AuthorizeUserId: number;
  /**
   * 是否啟用
   */
  IsActive: boolean | undefined;
  /**
   * 資料更新時間（由系統提供）
   */
  UpdateAt: Date;
}