import { Router } from "express";
import { getLeadSummaryReport } from "../controller/reportcontroller";

const router = Router();

router.get("/lead-summary", getLeadSummaryReport);

export default router;
