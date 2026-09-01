import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ChangeEvent } from "react";

import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import dashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import CreateQuotationModal from "../../components/quotation/CreateQuotationModal";
import SendQuotationModal from "../../components/quotationmodal/quotation_modal";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";

/* ================= TYPES ================= */

interface ComboType {
  id: number;
  comboName: string;
  description?: string;
}

interface QuotationPackage {
  id: number;
  serviceName: string;
  description?: string;
  quantity?: number;
  price?: number;
}

/* ================= COMPONENT ================= */

const PartnerQuotation = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [combos, setCombos] = useState<ComboType[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<number | null>(null);

  const [packages, setPackages] = useState<QuotationPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<QuotationPackage | null>(null);

  const [loadingCombos, setLoadingCombos] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ================= HANDLERS ================= */

  const handleChoosePdf = () => {
    fileInputRef.current?.click();
  };

  const handleUploadPdf = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // adjust endpoint/field names if needed
      await api.post("/quotations/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // optional: refresh quotations after upload
      // fetchPackages();
    } catch (err) {
      console.error("Failed to upload PDF", err);
      alert("Upload failed. Please try again.");
    } finally {
      e.target.value = "";
    }
  };

  /* ================= FETCH COMBOS ================= */

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoadingCombos(true);

        const res = await api.get("/quotations/combos");
        const data: ComboType[] = res.data?.data ?? [];

        setCombos(data);

        if (data.length > 0) {
          setSelectedCombo(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load combos", err);
        setCombos([]);
      } finally {
        setLoadingCombos(false);
      }
    };

    fetchCombos();
  }, []);

  /* ================= FETCH PACKAGES ================= */

  const fetchPackages = useCallback(async () => {
    if (!selectedCombo) return;

    try {
      setLoadingPackages(true);

      const res = await api.get("/quotations", {
        params: {
          combo: selectedCombo,
          page: 1,
          limit: 20,
        },
      });

      setPackages(res.data?.data ?? []);
    } catch (err) {
      console.error("Failed to load quotation packages", err);
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  }, [selectedCombo]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (!leadId) return null;

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 flex bg-[#F4F3F8]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 flex overflow-hidden">
          {/* ================= LEFT PANEL ================= */}
          <aside className="w-72 bg-white/70 border-r border-purple-100 px-4 py-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">
                Available Services
              </h3>
              <button className="text-xs text-gray-500 hover:text-gray-700">
                ▾
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {loadingCombos && (
                <p className="text-xs text-gray-500">Loading combos…</p>
              )}

              {!loadingCombos &&
                combos.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => {
                      setSelectedCombo(combo.id);
                      setSelectedPackage(null);
                    }}
                    className={`w-full text-left rounded-xl px-4 py-3 text-xs transition shadow-sm ${
                      selectedCombo === combo.id
                        ? "bg-[#EFEAFF] border border-purple-500 text-purple-800"
                        : "bg-white border border-transparent hover:border-purple-200 hover:bg-purple-50 text-gray-800"
                    }`}
                  >
                    <div className="font-semibold text-[13px]">
                      {combo.comboName}
                    </div>
                    {combo.description && (
                      <div className="mt-1 text-[11px] text-gray-500 line-clamp-2">
                        {combo.description}
                      </div>
                    )}
                    <span className="mt-2 inline-block text-[11px] text-purple-600">
                      View details &gt;
                    </span>
                  </button>
                ))}
            </div>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <main className="flex-1 px-10 py-8 overflow-y-auto">
            {/* top actions + search */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                QUOTATION
              </h1>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-72 rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    readOnly
                  />
                 
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 rounded-lg bg-purple-600 text-sm font-medium text-white shadow hover:bg-purple-700"
                >
                  Create New
                </button>

                <button
                  type="button"
                  onClick={handleChoosePdf}
                  className="px-5 py-2.5 rounded-lg bg-white text-sm font-medium text-purple-700 border border-purple-200 shadow-sm hover:bg-purple-50"
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleUploadPdf}
                />
              </div>
            </div>

            {loadingPackages && (
              <p className="text-sm text-gray-500">Loading packages…</p>
            )}

            {!loadingPackages && packages.length === 0 && (
              <div className="mt-20 text-center text-sm text-gray-500">
                No quotation packages available.
                <br />
                Create a new quotation to continue.
              </div>
            )}

            {/* cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setShowSendModal(true);
                  }}
                  className="group cursor-pointer rounded-2xl bg-white shadow-sm hover:shadow-lg transition overflow-hidden border border-transparent hover:border-purple-200"
                >
                  <div className="h-32 bg-gradient-to-r from-[#F4E7FF] via-[#F4E7FF] to-[#E6F3FF] flex items-center justify-center">
                    <span className="text-3xl">📷</span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[15px] text-gray-900">
                        {pkg.serviceName}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-500 min-h-[32px]">
                      {pkg.description || "—"}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-semibold text-purple-700">
                        Rs. {pkg.price ?? 0}
                      </span>

                      <span className="text-[11px] rounded-full border border-gray-300 px-3 py-1 text-gray-600 group-hover:border-purple-400 group-hover:text-purple-600">
                        Click to Send
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ================= MODALS ================= */}

     {showCreateModal && (
  <CreateQuotationModal
    leadId={Number(leadId)}
    onClose={() => setShowCreateModal(false)}
    onSuccess={() => {
      setShowCreateModal(false);
      fetchPackages();
    }}
  />
)}


{showSendModal && selectedPackage && (
  <SendQuotationModal
    leadId={String(leadId)}
    quotation={selectedPackage}
    onClose={() => setShowSendModal(false)}
    onSuccess={() => {
      setShowSendModal(false);
      navigate(`/partner/leads/${leadId}`);
    }}
  />
)}




    </div>
  );
};

export default PartnerQuotation;
