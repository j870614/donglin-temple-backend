import { Router, Request, Response } from "express";

const indexRouter = Router();

/* GET home page. */
indexRouter.get("/", (req: Request, res: Response) => {
  // #swagger.tags = ['Index']
  res.send("index get");
});

indexRouter.post("/post", (req: Request, res: Response) => {
  // #swagger.tags = ['Index']
  res.send("index post");
});

indexRouter.put("/", (req: Request, res: Response) => {
  // #swagger.tags = ['Index']
  res.send("index put");
});

indexRouter.delete("/", (req: Request, res: Response) => {
  // #swagger.tags = ['Index']
  res.send("index delete");
});

export { indexRouter };
