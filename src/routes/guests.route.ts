import { Router } from "express";
import { GuestsController } from "../controllers/guests.controller";

const guestsRouter = Router();
const guestsController = new GuestsController();

/* GET managers listing. */
guestsRouter.get("/", guestsController.getAll);

guestsRouter.get("/:id", guestsController.getGuest);


export { guestsRouter };
