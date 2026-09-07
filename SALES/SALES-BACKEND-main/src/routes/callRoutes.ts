import { Router } from "express";
import { CallController } from "../controller/callController";
import {
  authenticateAny,
  authenticateAdmin,
  authenticateEmployee,
} from "../middleware/auth";

const callRoutes = Router();

// --------------------------
// CREATE CALL
// --------------------------
callRoutes.post(
  "/",
  authenticateAny,
  CallController.createCall
);

// --------------------------
// GET LATEST REQUIREMENT FOR LEAD
// --------------------------
callRoutes.get(
  "/lead/:leadId/latest-requirement",
  authenticateAny,
  CallController.getLatestRequirementForLead
);


// --------------------------
// GET CALL BY ID
// --------------------------
callRoutes.get(
  "/:callId",
  authenticateAny,
  CallController.getCallById
);

// --------------------------
// GET ALL CALLS FOR SPECIFIC LEAD
// --------------------------
callRoutes.get(
  "/lead/:leadId/all",
  authenticateAny,
  CallController.getCallsForLead
);

// --------------------------
// GET CALLS BY LEAD ID (Legacy)
// --------------------------
callRoutes.get(
  "/lead/:leadId",
  authenticateAny,
  CallController.getCallsByLeadId
);

// --------------------------
// GET PENDING CALLS FOR LEAD
// --------------------------
callRoutes.get(
  "/lead/:leadId/pending",
  authenticateAny,
  CallController.getPendingCallsForLead
);

// --------------------------
// GET COMPLETED CALLS FOR LEAD
// --------------------------
callRoutes.get(
  "/lead/:leadId/completed",
  authenticateAny,
  CallController.getCompletedCallsForLead
);

// --------------------------
// GET CALL COUNT FOR LEAD
// --------------------------
callRoutes.get(
  "/lead/:leadId/count",
  authenticateAny,
  CallController.getCallCountForLead
);

// --------------------------
// UPDATE CALL
// --------------------------
callRoutes.put(
  "/:callId",
  authenticateAny,
  CallController.updateCall
);

// --------------------------
// MARK CALL AS TAKEN
// --------------------------
callRoutes.patch(
  "/:callId/mark-taken",
  authenticateAny,
  CallController.markCallAsTaken
);

// --------------------------
// DELETE CALL
// --------------------------
callRoutes.delete(
  "/:callId",
  authenticateAdmin,
  CallController.deleteCall
);

export default callRoutes;
