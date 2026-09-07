import { Router } from "express";
import { updateClientRequirementsController } from "../controllers/clientRequirements.controller";

const router = Router();

router.patch("/:leadId/client-requirements", updateClientRequirementsController);

export default router;
