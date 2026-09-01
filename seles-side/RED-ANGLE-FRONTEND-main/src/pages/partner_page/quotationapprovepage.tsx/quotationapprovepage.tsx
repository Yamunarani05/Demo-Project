import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../api/api";

const QuotationApprovePage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Processing your approval...");

  useEffect(() => {
    const token = searchParams.get("id");
    if (!token) {
      setMessage("Invalid approval link.");
      return;
    }

    const approve = async () => {
      try {
        

        const res = await api.post("/quotations/approve", {
          token,
          status: "approved",
        });

        
        setMessage("Thank you! Your quotation has been approved.");
      } catch (e: any) {
        console.error("Approve error:", e?.response || e);
        setMessage(
          e?.response?.data?.message || "Failed to approve quotation."
        );
      }
    };

    approve();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-xl font-semibold text-gray-800">{message}</h1>
    </div>
  );
};

export default QuotationApprovePage;
