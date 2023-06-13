import { StatusCodes } from "http-status-codes";
import  axios from 'axios';
import  querystring  from "querystring";
import { TsoaResponse } from "src/utils/responseTsoaError";
import prisma from '../configs/prismaClient';
  
export async function lineCallback (
  code:string, 
  state:string, 
  errorResponse: TsoaResponse<
  StatusCodes.BAD_REQUEST,
  { status: false; message?: string }
>
) {
  const lineState = String(process.env.LINE_STATE);
  if(state !== lineState) {
    return errorResponse(StatusCodes.BAD_REQUEST, {
      status: false,
      message: "Line 登入錯誤"
    });
  } 

  // 拿 code 換成 access_token
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const data = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'http://localhost:3000/api/managers/line/callback',
    client_id: String(process.env.LINE_CHANNEL_ID),
    client_secret: String(process.env.LINE_CHANNEL_SECRET),
  };

  const lineResponse: AxiosResponse<LineResponse> = await axios.post('https://api.line.me/oauth2/v2.1/token', querystring.stringify(data), { headers });

  // 向 Line 獲取用戶資訊
  const userInfoResponse: AxiosResponse<LineUserInfoResponse> = await axios.get('https://api.line.me/v2/profile', {
    headers: {
      'Authorization': `Bearer ${lineResponse.data.access_token}`
    }
  });
  
  const { userId } = userInfoResponse.data;

  const manager = await prisma.managers.findUnique({
    where: { 
      Line: userId,
    }
  });

  console.log(manager);
  console.log(userInfoResponse.data);

  if (!manager) {
    return errorResponse(StatusCodes.BAD_REQUEST, {
      status: false,
      message: "尚未註冊或綁定 Line 帳號登入，請洽系統管理員"
    });
  }

  return console.log(userInfoResponse.data);
};



interface LineResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface LineUserInfoResponse {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string; 
}

interface AxiosResponse<T> {
  data: T;
  status: number;
}