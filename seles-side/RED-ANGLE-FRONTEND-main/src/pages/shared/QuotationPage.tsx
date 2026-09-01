import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";


interface Props {
  role: "admin" | "employee" | "partner";
  leadId?: number;
}

const QuotationPage: React.FC<Props> = ({ role }) => {
  const { leadId } = useParams<{ leadId?: string }>();

  return (
    <div className="fixed inset-0 bg-gray-50 flex overflow-hidden">
      {/* Sidebar auto-detects role from URL */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Shared quotation page */}
        <QuotationPage
          role={role}
          leadId={leadId ? Number(leadId) : undefined}
        />
      </div>
    </div>
  );
};

export default QuotationPage;