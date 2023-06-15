// 將 Line code 向 Line API 驗證後回傳物件 
export interface LineResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

// access_token 換取 Line user info 回傳物價
export interface LineUserInfoResponse {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string; 
}

// Axios 回傳之物件
export interface AxiosResponse<T> {
  data: T;
  status: number;
}