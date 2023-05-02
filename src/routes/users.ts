import { Router, Request, Response, NextFunction } from "express";

const usersRouter = Router();

/* GET users listing. */
usersRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['User']
  res.send("respond with a resource");
});

export { usersRouter };
