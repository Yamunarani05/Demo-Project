import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import { Search } from "lucide-react";
import CreateQuotationModal from "../../components/quotation/CreateQuotationModal";
import SendQuotationModal from "../../components/quotation/SendQuotationModal";

import { QuotationsAPI } from "../../api/quotations.api";
import type {
  QuotationPackage,
  InvoicePackage,
} from "../../api/quotations.api";

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("data:")) return imageUrl;

  const normalizedUrl = imageUrl.replace(/\\/g, "/");
  const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:9000";
  return `${base.replace(/\/$/, "")}/${normalizedUrl.replace(/^\/+/, "")}`;
};

const EmployeeQuotationPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  const [services, setServices] = useState<InvoicePackage[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const [packages, setPackages] = useState<QuotationPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<QuotationPackage | null>(null);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSend, setShowSend] = useState(false);

  /* -----------------------------
     LOAD AVAILABLE SERVICES
  ----------------------------- */
  useEffect(() => {
    const loadServices = async () => {
      const data = await QuotationsAPI.getInvoicePackages();
      setServices(data);

      if (data.length > 0) {
        setSelectedService(data[0].id);
      }
    };

    loadServices();
  }, []);

  /* -----------------------------
     LOAD QUOTATION PACKAGES
  ----------------------------- */
  useEffect(() => {
    if (!selectedService) return;

    const loadPackages = async () => {
      const list = await QuotationsAPI.getPackages(1, 50, selectedService);
      setPackages(list);
    };

    loadPackages();
  }, [selectedService]);

  /* -----------------------------
     FILTER BY SEARCH
  ----------------------------- */
  const filtered = packages.filter(
    (p) =>
      p.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (!leadId) return null;

  return (
    <div className="fixed inset-0 flex bg-gray-50 overflow-hidden">
      <Sidebar forceOpen />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT */}
          <aside className="w-64 bg-white border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Available Services</h3>

            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedService(s.id)}
                className={`w-full text-left px-3 py-2 rounded mb-2 text-sm ${selectedService === s.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 hover:bg-purple-100"
                  }`}
              >
                {s.packageTitle}
              </button>
            ))}
          </aside>

          {/* RIGHT */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h1 className="text-xl font-semibold">Quotation Packages</h1>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Create Quotation
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotation packages"
                className="pl-10 pr-4 py-2 border rounded w-full"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-500 text-center mt-20">
                No quotation packages found
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filtered.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition"
                  >
                    {/* IMAGE */}
                    <div className="h-40 bg-black flex items-center justify-center">
                      {pkg.imageUrl ? (
                        <img
                          src={resolveImageUrl(pkg.imageUrl)}
                          alt={pkg.serviceName}
                          className="max-h-full max-w-full object-contain cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              resolveImageUrl(pkg.imageUrl),
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        />
                      ) : (
                        <span className="text-3xl text-white">📸</span>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowSend(true);
                      }}
                    >
                      <h3 className="font-semibold">{pkg.serviceName}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {pkg.description || "No description"}
                      </p>
                      <p className="mt-2 font-bold text-purple-600">
                        ₹ {pkg.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* CREATE */}
      {showCreate && (
        <CreateQuotationModal
          leadId={Number(leadId)}
          onClose={() => setShowCreate(false)}
          onSuccess={() => setShowCreate(false)}
        />
      )}

      {/* SEND */}
      {showSend && selectedPackage && (
        <SendQuotationModal
          leadId={Number(leadId)}
          quotation={selectedPackage}
          onClose={() => setShowSend(false)}
          onSuccess={() => {
            setShowSend(false);
            navigate(`/employee/leads/${leadId}`);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeQuotationPage;