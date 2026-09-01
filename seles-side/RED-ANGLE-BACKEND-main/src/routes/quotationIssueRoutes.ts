import { Router } from "express";
import quotationIssueController from "../controller/quotationIssueController";
import { authenticateAdmin, authenticateEmployee, authenticatePartner } from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { createQuotationIssueSchema, quotationIssuePaginationSchema, quotationLeadIdParamSchema, issueIdParamSchema, updateQuotationIssueSchema } from "../types/quotationIssueValidator";

const quotationIssueRoutes = Router();

quotationIssueRoutes.post(
  "/token/:token",
  validateBody(
    createQuotationIssueSchema.omit({ quotationLeadId: true })
  ),
  quotationIssueController.createByToken
);

quotationIssueRoutes.post(
  "/",
  authenticateAdmin,
  validateBody(createQuotationIssueSchema),
  quotationIssueController.create
);

quotationIssueRoutes.get(
  "/",
  authenticateAdmin,
  validateQuery(quotationIssuePaginationSchema),
  quotationIssueController.getAll
);

quotationIssueRoutes.get(
  "/lead/:quotationLeadId",
  authenticateAdmin,
  validateParams(quotationLeadIdParamSchema),
  quotationIssueController.getIssuesByQuotationLead
);

quotationIssueRoutes.get(
  "/:issueId",
  authenticateAdmin,
  validateParams(issueIdParamSchema),
  quotationIssueController.getById
);

quotationIssueRoutes.put(
  "/:issueId",
  authenticateAdmin,
  validateParams(issueIdParamSchema),
  validateBody(updateQuotationIssueSchema),
  quotationIssueController.update
);

quotationIssueRoutes.delete(
  "/:issueId",
  authenticateAdmin,
  validateParams(issueIdParamSchema),
  quotationIssueController.delete
);

export default quotationIssueRoutes;
