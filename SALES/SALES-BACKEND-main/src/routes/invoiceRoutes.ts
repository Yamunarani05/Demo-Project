import { Router } from "express";
import {
  authenticateAdmin,
  authenticateAny,
  authenticateEmployee,
} from "../middleware/auth";
import invoiceController from "../controller/invoiceController";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import z from "zod";
import {
  createInvoiceSchema,
  idParamSchema,
  createInvoiceIssueSchema,
  tokenParamSchema,
  updateInvoiceStatusSchema,
  updateInvoiceSchema,
} from "../types/invoiceValidator";
import { paginationQuerySchema } from "../types/leadValidator";
import { auth } from "google-auth-library";

const invoiceRoutes = Router();
console.log("Invoice routes loaded");

invoiceRoutes.use((req, _res, next) => {
  console.log("INVOICE ROUTE HIT:", req.method, req.originalUrl);
  next();
});

// CREATE
invoiceRoutes.post(
  "/",
  authenticateAny,
  validateBody(createInvoiceSchema),
  (req, res) => invoiceController.create(req, res)
);

// LIST
invoiceRoutes.get(
  "/",
  authenticateAny,
  validateQuery(paginationQuerySchema),
  (req, res) => invoiceController.getAll(req, res)
);

// PACKAGES
invoiceRoutes.get(
  "/packages",
  authenticateAny,
  (req, res) => invoiceController.getAllPackages(req, res)
);

// ISSUES LIST
invoiceRoutes.get(
  "/issues",
  authenticateAdmin || authenticateEmployee,
  validateQuery(paginationQuerySchema),
  (req, res) => invoiceController.getAllIssues(req, res)
);

// ISSUE BY ID
invoiceRoutes.get(
  "/issues/:issueId",
  authenticateAny,
  validateParams(z.object({ issueId: z.coerce.number().int().positive() })),
  (req, res) => invoiceController.getIssueById(req, res)
);

// PUBLIC INVOICE BY TOKEN (used by email link & PublicInvoiceView)
invoiceRoutes.get(
  "/public/:token",
  validateParams(tokenParamSchema),
  (req, res) => invoiceController.getInvoiceByToken(req, res)
);

// GET ALL ADDONS
invoiceRoutes.get("/addons", authenticateAny, invoiceController.getAllAddons);

// ADD ADDON TO INVOICE
invoiceRoutes.post(
  "/:invoiceId/addons",
  authenticateAny,
  (req, res) => invoiceController.addAddon(req, res)
);

// GET BY ID (authenticated)


// PUBLIC: CREATE ISSUE FOR INVOICE (client from email)
// PUBLIC CREATE ISSUE (token)
invoiceRoutes.post(
  "/public/:token/issues",
  validateBody(createInvoiceIssueSchema),
  (req, res) => invoiceController.createIssueForInvoice(req, res)
);

// AUTH CREATE ISSUE (id)
invoiceRoutes.post(
  "/:invoiceId/issues",
  authenticateAny,
  validateParams(idParamSchema),
  validateBody(createInvoiceIssueSchema),
  (req, res) => invoiceController.createIssueForInvoice(req, res)
);

// SEND INVOICE (EMAIL) — POST /invoices/:invoiceId/send
// if ?issueId= is present, treat as resend-for-issue
// invoiceRoutes.post(
//   "/:invoiceId/send",
//   authenticateAny,
//   validateParams(idParamSchema),
//   (req, res) => {
//     console.log("ROUTE HIT");

//     if (req.query.issueId) {
//       return invoiceController.sendInvoiceForIssue(req, res);
//     }
//     return invoiceController.sendInvoiceToClient(req, res);
//   }
// );

invoiceRoutes.post(
  "/:invoiceId/send",
  authenticateAny,
  (req, res) => {
    console.log("ROUTE HIT");
    return invoiceController.sendInvoiceToClient(req, res);
  }
);


invoiceRoutes.get(
  "/:invoiceId",
  authenticateAny,
  validateParams(idParamSchema),
  (req, res) => invoiceController.getById(req, res)
);

// PUBLIC: APPROVAL VIA TOKEN — PUT /invoices/:token/status
invoiceRoutes.put(
  "/public/:token/status",

  (req, _res, next) => {
    if (typeof req.body?.status === "string") {
      req.body.status = req.body.status.toLowerCase();
    }
    next();
  },

  validateBody(updateInvoiceStatusSchema),
  invoiceController.InvoiceApproved
);


invoiceRoutes.put(
  "/:invoiceId/update-preview",
  authenticateAny,
  (req, res) => invoiceController.updatePreview(req, res)
);

// UPDATE INVOICE (authenticated)
invoiceRoutes.put(
  "/:invoiceId",
  authenticateAny,
  validateParams(idParamSchema),
  validateBody(updateInvoiceSchema),
  (req, res) => invoiceController.update(req, res)
);

// DELETE
invoiceRoutes.delete("/:invoiceId", authenticateAny, (req, res) =>
  invoiceController.delete(req, res)
);


invoiceRoutes.get(
  "/export/excel",
  authenticateAdmin, 
  (req, res) => invoiceController.downloadInvoiceReportExcel(req, res)
);
invoiceRoutes.put(
  "/:invoiceId/additional",
  authenticateAny,
  (req, res) => invoiceController.upsertInvoiceAdditional(req, res)
);

// Get additional details by invoiceId
invoiceRoutes.get(
  "/:invoiceId/additional",
  authenticateAny,
  (req, res) => invoiceController.getInvoiceAdditional(req, res)
);

// SAVE INVOICE MARKINGS
invoiceRoutes.put(
  "/:invoiceId/markings",
  authenticateAny,
  (req, res) => invoiceController.saveMarkings(req, res)
);

// GET INVOICE MARKINGS
invoiceRoutes.get(
  "/:invoiceId/markings",
  authenticateAny,
  (req, res) => invoiceController.getMarkings(req, res)
);



export default invoiceRoutes;


// import { Router } from "express";
// import { authenticateAny } from "../middleware/auth";
// import invoiceController from "../controller/invoiceController";
// import {
//   validateBody,
//   validateParams,
//   validateQuery,
// } from "../middleware/validation";
// import z from "zod";
// import {
//   createInvoiceSchema,
//   idParamSchema,
//   createInvoiceIssueSchema,
//   tokenParamSchema,
//   updateInvoiceStatusSchema,
//   updateInvoiceSchema,
// } from "../types/invoiceValidator";
// import { paginationQuerySchema } from "../types/leadValidator";

// const invoiceRoutes = Router();

// /* ================= CREATE INVOICE ================= */
// invoiceRoutes.post(
//   "/",
//   authenticateAny,
//   validateBody(createInvoiceSchema),
//   (req, res) => invoiceController.create(req, res)
// );

// /* ================= LIST INVOICES ================= */
// invoiceRoutes.get(
//   "/",
//   authenticateAny,
//   validateQuery(paginationQuerySchema),
//   (req, res) => invoiceController.getAll(req, res)
// );

// /* ================= PACKAGES ================= */
// invoiceRoutes.get(
//   "/packages",
//   authenticateAny,
//   (req, res) => invoiceController.getAllPackages(req, res)
// );

// /* ================= ISSUES ================= */
// invoiceRoutes.get(
//   "/issues",
//   authenticateAny,
//   validateQuery(paginationQuerySchema),
//   (req, res) => invoiceController.getAllIssues(req, res)
// );

// invoiceRoutes.get(
//   "/issues/:issueId",
//   authenticateAny,
//   validateParams(z.object({ issueId: z.coerce.number().int().positive() })),
//   (req, res) => invoiceController.getIssueById(req, res)
// );

// /* ================= GET INVOICE ================= */
// invoiceRoutes.get(
//   "/:invoiceId",
//   authenticateAny,
//   validateParams(idParamSchema),
//   (req, res) => invoiceController.getById(req, res)
// );

// /* ================= CREATE ISSUE ================= */
// invoiceRoutes.post(
//   "/:invoiceId/issues",
//   authenticateAny,
//   validateParams(idParamSchema),
//   validateBody(createInvoiceIssueSchema),
//   (req, res) => invoiceController.createIssueForInvoice(req, res)
// );

// /* ================= SEND INVOICE ================= */
// invoiceRoutes.post(
//   "/:invoiceId/send",
//   authenticateAny,
//   validateParams(idParamSchema),
//   (req, res) => invoiceController.sendInvoiceToClient(req, res)
// );

// /* ================= TOKEN APPROVAL ================= */
// invoiceRoutes.put(
//   "/:token/status",
//   validateParams(tokenParamSchema),
//   validateBody(updateInvoiceStatusSchema),
//   (req, res) => invoiceController.InvoiceApproved(req, res)
// );

// /* ================= UPDATE INVOICE ================= */
// invoiceRoutes.put(
//   "/:invoiceId",
//   authenticateAny,
//   validateParams(idParamSchema),
//   validateBody(updateInvoiceSchema),
//   (req, res) => invoiceController.update(req, res)
// );

// export default invoiceRoutes;