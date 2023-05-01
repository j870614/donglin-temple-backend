import { Router, Request, Response, NextFunction } from "express";
import { appError } from "../utils/appError";

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

usersRouter.get('/line/callback',(req: Request, res: Response, next: NextFunction) => {
    const { code, state} = req.query;
    const lineState = String(process.env.LINE_STATE);
    if(state === lineState) {
      // console.log('code:', code);
      res.send({
        state: true,
      })
    } else {
      return next(appError(400,'Line login error'));
    }
  
})
// http://localhost:3000/api/users/line/callback
export { usersRouter };
