import { Router } from "express";
import { ManagersController } from "../controllers/managers.controller";

const managersRouter = Router();
const managersController = new ManagersController();

/* GET managers listing. */
// managersRouter.get("/", managersController.getAll);

// managersRouter.post("/generate", managersController.generate);

// managersRouter.post("/signup", managersController.signUp);

managersRouter.post("/signin", managersController.signIn);

export { managersRouter };
