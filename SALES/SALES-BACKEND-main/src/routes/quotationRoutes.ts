import { Router } from "express";
import {
  authenticateAdmin,
  authenticateAny,
  authenticateEmployee
} from "../middleware/auth";
import { uploadQuotationImage } from "../middleware/upload";
import quotationController from "../controller/quotationController";

const quotationRoutes = Router();

/* =========================================================
   IMAGE UPLOAD — ALL ROLES
   ========================================================= */
quotationRoutes.post(
  "/upload-image",
  authenticateAny,
  uploadQuotationImage.single("image"),
  (req, res) => quotationController.uploadImage(req, res)
);

/* =========================================================
   QUOTATION CREATE / UPDATE — ALL ROLES
   ========================================================= */

// Create quotation
quotationRoutes.post(
  "/",
  authenticateAny,
  (req, res) => quotationController.create(req, res)
);

// Update quotation
quotationRoutes.put(
  "/:quotationId",
  authenticateAny,
  (req, res) => quotationController.update(req, res)
);

/* =========================================================
   READ QUOTATIONS — ALL ROLES
   ========================================================= */

   quotationRoutes.get(
  "/view/:token",
  (req, res) => quotationController.viewQuotation(req, res)
);
quotationRoutes.get(
  "/",
  authenticateAny,
  (req, res) => quotationController.getAll(req, res)
);

quotationRoutes.get(
  "/combos",
  authenticateAny,
  (req, res) => quotationController.getComboTypes(req, res)
);


/* =========================================================
   SEND QUOTATION — ALL ROLES
   ========================================================= */

quotationRoutes.post(
  "/send",
  authenticateAny,
  (req, res) => quotationController.sendToClient(req, res)
);

/* =========================================================
   ADMIN-ONLY ACTIONS
   ========================================================= */

// Delete quotation
quotationRoutes.delete(
  "/:quotationId",
  authenticateAny,
  (req, res) => quotationController.deleteQuotation(req, res)
);

quotationRoutes.put(
  "/public/:token/status",
  (req, res) => quotationController.updateApprovalStatus(req, res)
);

// Update approval status
quotationRoutes.put(
  "/:quotationLeadId/status",
  authenticateAdmin,
  (req, res) => quotationController.updateApprovalStatus(req, res)
);

// Update lead
quotationRoutes.put(
  "/leads/:leadId",
  (req, res, next) => {
    console.log("PUT /leads/:leadId HIT");
    next();
  },
  authenticateAny,
  (req, res) => quotationController.updateLead(req, res)
);


quotationRoutes.get("/test", (req,res)=>{
  res.send("Quotation route working");
});

// Delete lead
quotationRoutes.delete(
  "/leads/:leadId",
  authenticateAdmin,
  (req, res) => quotationController.deleteLead(req, res)
);
quotationRoutes.get(
  "/addons",
  // authenticateAny,
  (req, res) => quotationController.listAddons(req, res)
);

// Create addon (Admin only)
quotationRoutes.post(
  "/addons",
  authenticateAdmin,
  (req, res) => quotationController.createAddon(req, res)
);

// Update addon (Admin only)
quotationRoutes.put(
  "/addons/:id",
  authenticateAdmin,
  (req, res) => quotationController.updateAddon(req, res)
);

// Delete addon (Admin only – soft delete)
quotationRoutes.delete(
  "/addons/:id",
  authenticateAdmin,
  (req, res) => quotationController.deleteAddon(req, res)
);

/* =========================================================
   LEAD ADDONS — ALL ROLES
   ========================================================= */

// Add addon to lead
quotationRoutes.post(
  "/leads/:leadId/addons",
  // authenticateAny,
  (req, res) => quotationController.addAddonToLead(req, res)
);

// List addons for a lead
quotationRoutes.get(
  "/leads/:leadId/addons",
  authenticateAny,
  (req, res) => quotationController.listLeadAddons(req, res)
);

// Update lead addon quantity
quotationRoutes.put(
  "/leads/:leadId/addons/:addonServiceId",
  authenticateAny,
  (req, res) => quotationController.updateLeadAddon(req, res)
);

// Remove addon from lead
quotationRoutes.delete(
  "/leads/:leadId/addons/:addonServiceId",
  authenticateAny,
  (req, res) => quotationController.removeLeadAddon(req, res)
);



export default quotationRoutes;
