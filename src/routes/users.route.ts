import { Router } from "express";
import { UsersController } from "../controllers/users.controller";

const usersRouter = Router();
const usersController = new UsersController();

/* GET managers listing. */
usersRouter.get("/", usersController.getAll);

usersRouter.post("/generate", usersController.generate);

// usersRouter.post("/signup", usersController.signUp);

// usersRouter.post("/signin", usersController.signIn);

export { usersRouter };
