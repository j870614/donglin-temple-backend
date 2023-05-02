import { Router, Request, Response, NextFunction } from "express";
import { appError } from "../utils/appError";
import * as axios from 'axios';
import * as querystring  from "querystring";

const usersRouter = Router();

/* GET users listing. */
usersRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['User']
  res.send("respond with a resource");
});

usersRouter.get('/line', (req: Request, res: Response) => {
  const lineChannelID = String(process.env.LINE_CHANNEL_ID);
  const lineChannelSecret = String(process.env.LINE_CHANNEL_SECRET);
  const callbackURL = 'http://localhost:3000/api/users/line/callback';
  const lineState = String(process.env.LINE_STATE);
  const lineNonce = String(process.env.LINE_NONCE);
  const lineLoginURL = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineChannelID}&redirect_uri=${callbackURL}&state=${lineState}&scope=profile%20openid&nonce=${lineNonce}&ui_locales=ch-TW&initial_amr_display=lineqr
  `
  res.redirect(lineLoginURL);
});

usersRouter.get('/line/callback', async (req: Request, res: Response, next: NextFunction) => {
  const {code, state} = req.query;
  const lineState = String(process.env.LINE_STATE);
  if(state === lineState) {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const data = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/api/users/line/callback',
      client_id: String(process.env.LINE_CHANNEL_ID),
      client_secret: String(process.env.LINE_CHANNEL_SECRET),
    };

    const response = await axios.post('https://api.line.me/oauth2/v2.1/token', querystring.stringify(data), { headers });

    const { access_token, id_token } = response.data;
    console.log('id_token:', id_token);
  // // 向 Line 驗證 ID 令牌，以獲取用戶信息
  // const userInfoResponse = await axios.get('https://api.line.me/oauth2/v2.1/verify', {
  //     params: {
  //       id_token,
  //       client_id: LINE_LOGIN_CHANNEL_ID,
  //     },
  //   });
  } else {
    return next(appError(400,'Line login error'));
  }
  
})
// http://localhost:3000/api/users/line/callback
export { usersRouter };
