import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../configs/prismaClient";

const managersRouter = Router();

/* GET managers listing. */
managersRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['User']
  res.send("respond with a resource");
});

managersRouter.get(
  "/test",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const manager = await prisma.managers.create({
        data: {
          UserId: 103,
          Email: "a123458@gmail.com",
          Password: "a123458"
        }
      });
      res.send(manager);
    } catch (error) {
      throw new Error("create Error");
    }
  }
);

export { managersRouter };
