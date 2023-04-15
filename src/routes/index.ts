import { Router, Request, Response, NextFunction } from "express";

const indexRouter = Router();
const test = "test message";

/* GET home page. */
indexRouter.get("/", (_req: Request, res: Response, next: NextFunction) => {
  res.send(test);
});

export { indexRouter };
