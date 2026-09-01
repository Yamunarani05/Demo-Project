import express from "express";
import ClientInvoiceController from "../controller/clientInvoiceController";

const router = express.Router();

router.get("/", ClientInvoiceController.getInvoices);
router.get("/lead/:leadId", ClientInvoiceController.getInvoicesByLead);
router.patch("/:id/approve", ClientInvoiceController.approveInvoice);
router.put("/public/:token/status", ClientInvoiceController.updatePublicInvoiceStatus);
router.post("/:id/issue", ClientInvoiceController.raiseIssue);

export default router;
