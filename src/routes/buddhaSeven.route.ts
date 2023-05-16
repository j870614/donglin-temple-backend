import { Router } from "express";
import { BuddhaSevenController } from "../controllers/buddhaSeven.controller";

const buddhaSevenRouter = Router();
const buddhaSevenController = new BuddhaSevenController();

/* GET managers listing. */
buddhaSevenRouter.get("/", buddhaSevenController.getAllBuddhaSeven);

// buddhaSevenRouter.get("/:id", buddhaSevenController.getGuest);

// buddhaSevenRouter.post("/", buddhaSevenController.createUser);


export { buddhaSevenRouter };
