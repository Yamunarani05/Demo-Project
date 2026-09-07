import PaymentController from "../controller/paymentController";
import { uploadPaymentProof } from "../middleware/uploadPaymentProof";
import { authenticateAdmin } from "../middleware/auth";
import { Router } from "express";

const Paymentrouter = Router();

Paymentrouter.post("/add", uploadPaymentProof.single("proof"), PaymentController.addPayment.bind(PaymentController));
Paymentrouter.put("/verify", authenticateAdmin, PaymentController.verifyPayment.bind(PaymentController));
Paymentrouter.get("/earnings/monthly", authenticateAdmin, PaymentController.getMonthlyEarnings.bind(PaymentController));
Paymentrouter.get("/earnings/:year/:month", authenticateAdmin, PaymentController.getPaymentsByMonth.bind(PaymentController));
Paymentrouter.get("/earnings/excel", authenticateAdmin, PaymentController.downloadPaymentsExcel.bind(PaymentController));
Paymentrouter.get(
  "/invoice/:invoiceId",
  PaymentController.getPaymentsByInvoice.bind(PaymentController)
);
Paymentrouter.get(
  "/invoice/:invoiceId/summary",
  authenticateAdmin,
  PaymentController.getInvoiceAmountSummary.bind(PaymentController)
);

export default Paymentrouter;