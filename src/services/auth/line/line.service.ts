import { StatusCodes } from "http-status-codes";
import  axios from 'axios';
import  querystring  from "querystring";
import { TsoaResponse } from "src/utils/responseTsoaError";

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

  const lineResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', querystring.stringify(data), { headers });

  const { access_token } = lineResponse.data;

  // 向 Line 獲取用戶信息
  const userInfoResponse = await axios.get('https://api.line.me/v2/profile', {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });

  console.log(userInfoResponse.data);
};