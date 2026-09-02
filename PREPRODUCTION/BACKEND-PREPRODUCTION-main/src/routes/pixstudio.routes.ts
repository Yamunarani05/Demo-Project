import { Router } from "express";
import {
    submitPixstudioDataController,
    getPixstudioStatsController
} from "../controllers/pixstudio.controller";

const router = Router();

router.post("/submit", submitPixstudioDataController);
router.get("/stats", getPixstudioStatsController);

export default router;
