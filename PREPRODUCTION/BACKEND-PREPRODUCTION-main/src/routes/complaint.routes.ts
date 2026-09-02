import express from "express";
import { getComplaints, resolveComplaint } from "../controllers/complaint.controller";

const router = express.Router();

router.get("/operational-manager/complaints", getComplaints);
router.patch("/operational-manager/complaints/:id/status", resolveComplaint);

export default router;
