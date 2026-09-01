import { useParams,useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import { exportToExcel } from "../../utils/excelExport";

type Stage = "Lead" | "Quotation" | "Confirmation" | "Finalised";

interface LeadDetails {
  leadId: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  eventType: string;
  location?: string;
  address?: string;
  eventDate?: string;
  createdAt?: string;
  currentStage: Stage;
  leadSerialNumber?: string;
  lead_serial_number?: string;
}

const buildConfirmationExcelRows = (lead: LeadDetails) => {
  return [
    {
      "Lead ID": lead.leadSerialNumber || lead.lead_serial_number || `RAS - ${lead.leadId}`,
      "Lead Name": `${lead.firstName} ${lead.lastName}`,
      Email: lead.email,
      Phone: lead.contactNumber,
      "Event Type": lead.eventType,
      Location: lead.address || lead.location || "—",
      "Event Date": lead.eventDate
        ? new Date(lead.eventDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
      "Current Stage": lead.currentStage,
      "Created On": lead.createdAt
        ? new Date(lead.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
  ];
};

const PartnerConfirmationPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leadId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchLead = async () => {
      try {
        const res = await api.get(`/leads/${leadId}`, {
          signal: controller.signal,
        });
        setLead(res.data?.data ?? null);
      } catch {
        setLead(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
    return () => controller.abort();
  }, [leadId]);

  const handleStageClick = (stage: Stage) => {
  if (!leadId) return;

  switch (stage) {
    case "Lead":
      navigate(`/partner/leads/${leadId}`);
      break;

    case "Quotation":
      navigate(`/partner/leads/${leadId}/quotation`);
      break;

    case "Confirmation":
      // already here
      break;

   default:
    return;
  }
};


  const moveToFinalize = async () => {
    if (!leadId) return;

    try {
      setUpdating(true);
      setError("");

      await api.put(`/quotations/leads/${leadId}`, {
        currentStage: "Finalised",
      });

      setLead((prev) =>
        prev ? { ...prev, currentStage: "Finalised" } : prev
      );
    } catch (err) {
      setError("Failed to move lead to Finalised stage");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = () => {
    if (!lead) {
      alert("No lead data to download");
      return;
    }

    const rows = buildConfirmationExcelRows(lead);

    exportToExcel(
      rows,
      `confirmation_lead_${String(lead.leadId).padStart(5, "0")}`,
      [
        "Lead ID",
        "Lead Name",
        "Email",
        "Phone",
        "Event Type",
        "Location",
        "Event Date",
        "Current Stage",
        "Created On",
      ],
      "Partner Confirmation Report" // 👈 HERE
    );
  };

  if (loading) return <div className="p-10">Loading…</div>;
  if (!lead) return <div className="p-10">Lead not found</div>;

  const fullName = `${lead.firstName} ${lead.lastName}`;
  const isFinalised = lead.currentStage === "Finalised";

  return (
    <div className="fixed inset-0 flex bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                {lead.firstName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{fullName}</h2>
                <p className="text-gray-500">{lead.eventType}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500 text-right">
              <p>
                Event Date:{" "}
                {lead.eventDate
                  ? new Date(lead.eventDate).toLocaleDateString()
                  : "—"}
              </p>
              <p>
                Created:{" "}
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleTimeString()
                  : "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-white rounded-2xl shadow p-6">
            <Info label="Lead ID" value={lead.leadSerialNumber || lead.lead_serial_number || `RAS - ${lead.leadId}`} />
            <Info label="Email" value={lead.email} />
            <Info label="Contact" value={lead.contactNumber} />
            <Info label="Event Type" value={lead.eventType} />
            <Info label="Location" value={lead.address || lead.location || "—"} />
            <Info label="Current Stage" value={lead.currentStage} />
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold mb-6">Status Timeline</h3>

          <div className="flex items-center justify-between">
  <Step
    title="Lead"
    active
    onClick={() => handleStageClick("Lead")}
  />

  <Line active />

  <Step
    title="Quotation"
    active
    onClick={() => handleStageClick("Quotation")}
  />

  <Line active />

  <Step
    title="Confirmation"
    active
    onClick={() => handleStageClick("Confirmation")}
  />

  <Line active={isFinalised} />

 <Step
    title="Finalised"
    active={isFinalised}
  />
</div>

          </div>

          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={handleDownload}
              className="px-8 py-3 rounded-xl bg-purple-600 text-white shadow"
            >
              Download
            </button>

            {isFinalised ? (
              <button
                disabled
                className="px-8 py-3 rounded-xl bg-green-600 text-white opacity-80 cursor-not-allowed"
              >
                Completed
              </button>
            ) : (
              <button
                onClick={moveToFinalize}
                disabled={updating}
                className="px-8 py-3 rounded-xl bg-purple-600 text-white shadow"
              >
                {updating ? "Updating…" : "Move to Finalize"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerConfirmationPage;

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="border rounded-xl p-4 bg-gray-50">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const Step = ({
  title,
  active,
  onClick,
}: {
  title: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center min-w-[90px] cursor-pointer"
  >
    <div
      className={`w-4 h-4 rounded-full ${
        active ? "bg-purple-600" : "bg-gray-400"
      }`}
    />
    <p className="text-sm mt-2">{title}</p>
  </div>
);


const Line = ({ active }: { active?: boolean }) => (
  <div
    className={`flex-1 h-[2px] mx-2 ${
      active ? "bg-purple-600" : "bg-gray-300"
    }`}
  />
);
