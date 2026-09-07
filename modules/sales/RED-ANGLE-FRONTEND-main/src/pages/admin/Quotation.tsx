import { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import { Eye, X } from "lucide-react";
import { CallsAPI } from "../../api/calls.api";
import type { CallRequirement } from "../../api/calls.api";
import SendQuotationModal from "../../components/AdminSendQuotationModal";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import AdminCreateQuotationModal from "../../components/AdminCreateQuotationModal";
import AdminCreatePackageModal from "../../components/AdminCreatePackageModal";


import type {
  InvoicePackage,
  QuotationPackage,
} from "../../api/quotations.api";
import { QuotationsAPI } from "../../api/quotations.api";
import { isUnauthorizedDemoPortal } from "../../utils/demoAuth";

/* ================= COMPONENT ================= */

const Quotation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { leadId } = useParams<{ leadId?: string }>();
  const [searchParams] = useSearchParams();

  const role = location.pathname.startsWith("/admin")
    ? "admin"
    : location.pathname.startsWith("/employee")
      ? "employee"
      : "partner";

  const isEmployeeOrPartner =
    role === "employee" || role === "partner";

  const effectiveLeadId =
    (leadId && Number(leadId)) ||
    (searchParams.get("leadId")
      ? Number(searchParams.get("leadId"))
      : null);

  const navState = location.state as {
    taskId?: number;
    taskName?: string;
    leadSerialNumber?: string;
    eventType?: string;
    eventDate?: string;
  } | null;

  const currentTaskId =
    navState?.taskId ||
    (searchParams.get("taskId") ? Number(searchParams.get("taskId")) : undefined);
  const currentTaskName =
    navState?.taskName ||
    searchParams.get("taskName") ||
    undefined;

  /* ================= STATE ================= */

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [sendQuotation, setSendQuotation] =
    useState<QuotationPackage | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [invoicePackages, setInvoicePackages] =
    useState<InvoicePackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<InvoicePackage | null>(null);

  const [myQuotations, setMyQuotations] =
    useState<QuotationPackage[]>([]);

  const [requirement, setRequirement] =
    useState<CallRequirement | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<InvoicePackage | null>(null);
  const [expandedPackageId, setExpandedPackageId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedPackageId(prev => (prev === id ? null : id));
  };



  /* ================= LOAD DATA ================= */

  // 🔹 Creator-based quotations (ADMIN / EMPLOYEE / PARTNER)
  useEffect(() => {
    const loadMyQuotations = async () => {
      try {
        const list = await QuotationsAPI.getAdminQuotations();
        setMyQuotations(list);
      } catch {
        setMyQuotations([]);
      }
    };

    loadMyQuotations();
  }, [role]);

  const DEMO_PACKAGES_DATA: InvoicePackage[] = [
    {
      id: 1,
      packageTitle: "Basic Photography Package",
      packageType: "Basic",
      price: 30000,
      items: [
        { id: 1, name: "Traditional Photography", category: "Service", quantity: 1, price: 15000 },
        { id: 2, name: "Photo Album 30 Pages", category: "Deliverable", quantity: 1, price: 15000 },
      ],
    },
    {
      id: 2,
      packageTitle: "Standard Candid & Traditional Combo",
      packageType: "Standard",
      price: 45000,
      items: [
        { id: 3, name: "Candid Photography", category: "Service", quantity: 1, price: 25000 },
        { id: 4, name: "Traditional Video Coverage", category: "Service", quantity: 1, price: 20000 },
      ],
    },
    {
      id: 3,
      packageTitle: "Premium Cinematic Wedding Story",
      packageType: "Premium",
      price: 75000,
      items: [
        { id: 5, name: "Cinematic Film & Teaser", category: "Service", quantity: 1, price: 40000 },
        { id: 6, name: "Drone Aerial Shoots (4K)", category: "Drone", quantity: 1, price: 15000 },
        { id: 7, name: "Premium Leather Photobook", category: "Deliverable", quantity: 2, price: 20000 },
      ],
    },
  ];

  // 🔹 Invoice packages
  useEffect(() => {
    const fetchPackages = async () => {
      if (localStorage.getItem("isDemoPortal") === "true") {
        setInvoicePackages(DEMO_PACKAGES_DATA);
        return;
      }

      try {
        const data = await QuotationsAPI.getInvoicePackages();
        if (Array.isArray(data) && data.length > 0) {
          setInvoicePackages(data);
        } else {
          setInvoicePackages(DEMO_PACKAGES_DATA);
        }
      } catch {
        setInvoicePackages(DEMO_PACKAGES_DATA);
      }
    };
    fetchPackages();
  }, []);

  // 🔹 Lead requirement (employee / partner only)
  useEffect(() => {
    if (!effectiveLeadId || !isEmployeeOrPartner) return;

    const loadRequirement = async () => {
      if (localStorage.getItem("isDemoPortal") === "true") {
        setRequirement({
          id: 1,
          leadId: effectiveLeadId,
          eventDate: "2026-09-25",
          eventType: "Wedding Photography",
          guestCount: "500",
          budget: "75000",
          location: "Chennai, Tamil Nadu",
          notes: "Client looking for candid photography + cinematic teaser reel.",
        } as any);
        return;
      }

      try {
        const data =
          await CallsAPI.getLatestRequirementForLead(effectiveLeadId);
        setRequirement(data);
      } catch {
        setRequirement(null);
      }
    };

    loadRequirement();
  }, [effectiveLeadId, isEmployeeOrPartner]);

  /* ================= HELPERS ================= */

  const resolveImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("data:")) return imageUrl;

    const normalizedUrl = imageUrl.replace(/\\/g, "/");
    const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:9000";
    return `${base.replace(/\/$/, "")}/${normalizedUrl.replace(/^\/+/, "")}`;
  };

  const formatPrice = (price: number) =>
    `Rs. ${price.toLocaleString("en-IN")}`;

  const filteredPackages = invoicePackages.filter((pkg) =>
    pkg.packageTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">


      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">

        <Header />

        <main className="flex-1 overflow-y-auto p-6">

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 rounded-md border text-sm"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Quotations</h1>
          </div>

          {/* REQUIREMENT */}
          {isEmployeeOrPartner && requirement && (
            <div className="mb-6 bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">
                Latest Requirement
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {requirement.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">


            {/* INBUILT PACKAGES */}
            <div className="pr-3 overflow-y-auto">


              <h2 className="text-xl font-bold mb-4">
                Inbuilt Packages
              </h2>

              <input
                type="text"
                placeholder="Search packages…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-6 border rounded px-3 py-2 w-80"
              />

              <button
                onClick={() => {
                  setEditingPackage(null);
                  setShowPackageModal(true);
                }}
                className="mb-4 bg-purple-600 text-white px-4 py-2 rounded"
              >
                + Create Package
              </button>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => toggleExpand(pkg.id)}
                    className="bg-white rounded-xl shadow overflow-hidden cursor-pointer transition-all duration-300"
                  >
                    {/* COLLAPSED HEADER */}
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">
                          {pkg.packageTitle}
                        </h3>
                        <p className="text-purple-600 font-semibold text-sm">
                          {formatPrice(Number(pkg.price))}
                        </p>
                      </div>

                      <span className="text-gray-400 text-lg">
                        {expandedPackageId === pkg.id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* EXPANDED CONTENT */}
                    {expandedPackageId === pkg.id && (
                      <div className="border-t">

                        {/* IMAGE */}
                        {pkg.imageUrl && (
                          <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                            <img
                              src={resolveImageUrl(pkg.imageUrl)}
                              alt={pkg.packageTitle}
                              className="h-full w-full object-contain"
                            />

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(resolveImageUrl(pkg.imageUrl)!);
                              }}
                              className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:bg-white"
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                        )}

                        {/* ACTIONS */}
                        <div className="p-4 flex flex-col gap-2">

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!confirm("Delete this package?")) return;

                              await QuotationsAPI.deletePackage(pkg.id);
                              const refreshed = await QuotationsAPI.getInvoicePackages();
                              setInvoicePackages(refreshed);
                            }}
                            className="w-full bg-red-600 text-white rounded py-2"
                          >
                            Delete Package
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPackage(pkg);
                              setShowCreateModal(true);
                            }}
                            className="w-full bg-purple-600 text-white rounded py-2"
                          >
                            Create Quotation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                ))}
              </div>
            </div>

            {/* CREATED QUOTATIONS */}
            <div className="pl-3 border-l overflow-y-auto">


              <h2 className="text-xl font-bold mb-4">
                Created Quotations
              </h2>

              {myQuotations.length === 0 ? (
                <p className="text-gray-500">
                  No quotations created yet
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {myQuotations.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white border rounded-lg overflow-hidden flex flex-col"
                    >
                      {q.imageUrl && (
                        <div className="relative h-40 bg-gray-100 group flex items-center justify-center">
                          <img
                            src={resolveImageUrl(q.imageUrl)}
                            alt={q.serviceName}
                            className="h-full w-full object-contain"
                          />

                          {/* Eye overlay */}
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage(resolveImageUrl(q.imageUrl)!)
                            }
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow hover:bg-white"
                            aria-label="View image"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      )}


                      <div className="p-4">
                        <h3 className="font-semibold">
                          {q.serviceName}
                        </h3>

                        <p className="text-purple-600 font-bold mt-2">
                          {formatPrice(q.price * (q.quantity ?? 1))}
                        </p>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => setSendQuotation(q)}
                            className="flex-1 bg-emerald-600 text-white rounded py-2 text-sm"
                          >
                            Send Quotation
                          </button>

                          <button
                            onClick={async () => {
                              if (!confirm("Delete this quotation?")) return;
                              await QuotationsAPI.deleteQuotation(q.id);
                              setMyQuotations(await QuotationsAPI.getAdminQuotations());
                            }}
                            className="bg-red-600 text-white rounded py-2 px-3 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isUnauthorizedDemoPortal() && effectiveLeadId && (
            <div className="flex justify-end pt-4 pb-6">
              <button
                onClick={() => {
                  const targetConfirmation =
                    role === "partner"
                      ? `/partner/leads/${effectiveLeadId}/confirmation`
                      : `/employee/leads/${effectiveLeadId}/confirmation`;
                  navigate(targetConfirmation, {
                    state: {
                      leadSerialNumber: navState?.leadSerialNumber,
                      taskId: currentTaskId,
                      taskName: currentTaskName,
                      dueDate: navState?.eventDate,
                    },
                  });
                }}
                className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md transition flex items-center gap-2"
              >
                <span>Continue</span>
                <span>&rarr;</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-gray-200"
              aria-label="Close preview"
            >
              ✕
            </button>

            <img
              src={previewImage}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded"
              alt="Preview"
            />
          </div>
        </div>
      )}


      {/* CREATE MODAL */}
      {showCreateModal && selectedPackage && (
        <AdminCreateQuotationModal
          invoicePackages={invoicePackages}
          initialPackageId={selectedPackage.id}
          onClose={() => setShowCreateModal(false)}
          onSave={async (form, imageFile, items) => {
            const imageUrl = imageFile
              ? await QuotationsAPI.uploadQuotationImage(imageFile)
              : undefined;

            await QuotationsAPI.createQuotation({
              packageId: form.packageId!,
              quantity: Number(form.quantity || 1),
              description: form.description || undefined,
              terms: Number(form.paymentTerms || 30),
              imageUrl,
              items,
            });

            // 🔥 Refresh creator-based list
            setMyQuotations(
              await QuotationsAPI.getAdminQuotations()
            );

            setShowCreateModal(false);
          }}
        />
      )}

      {showPackageModal && (
        <AdminCreatePackageModal
          initialData={editingPackage}
          onClose={() => setShowPackageModal(false)}
          onSave={async (data) => {
            if (editingPackage) {
              await QuotationsAPI.updatePackage(editingPackage.id, {
                packageTitle: data.packageTitle,
                packageType: data.packageType,
                price: Number(data.price),
                imageFile: data.imageFile,
                items: data.items,
                imageUrl: editingPackage.imageUrl ?? undefined,
              });
            } else {
              await QuotationsAPI.createPackage({
                packageTitle: data.packageTitle,
                packageType: data.packageType,
                price: Number(data.price),
                imageFile: data.imageFile,
                items: data.items,
              });
            }

            const refreshed = await QuotationsAPI.getInvoicePackages();
            setInvoicePackages(refreshed);

            setShowPackageModal(false);
          }}
        />
      )}

      {sendQuotation && (
        <SendQuotationModal
          package={sendQuotation}
          taskName={currentTaskName}
          taskId={currentTaskId}
          onClose={() => setSendQuotation(null)}
          onSend={() => setSendQuotation(null)}
        />
      )}
    </div>
  );
};

export default Quotation;
