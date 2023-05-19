import { Router } from "express";
import { RoomsController } from "../controllers/rooms.controller";

const roomsRouter = Router();
const roomsController = new RoomsController();

/* GET managers listing. */
// // guestsRouter.get("/", guestsController.getAll);

// guestsRouter.get("/:id", guestsController.getGuest);

// guestsRouter.post("/", guestsController.createUser);

export { roomsRouter };
