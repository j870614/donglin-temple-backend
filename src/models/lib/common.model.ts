export interface GetManyRequest {
  order?: "asc" | "desc";
  take?: number;
  skip?: number;
}

/**
 * 錯誤訊息物件
 */
export interface ErrorData {
  status: false; 
  message?: string | undefined;
}