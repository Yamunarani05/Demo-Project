import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QuotationPublicAPI } from "../../api/quotationPublic.api";
import RaiseIssueModal from "./RaiseIssueModal";
import { Eye } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

type AddOnService = {
  id: number;
  name: string;
  unitLabel: string;
  defaultQty: number;
  price: number;
};

const ADDON_CATEGORIES = [
  "Wedding",
  "Reception",
  "Engagement",
  "Rituals",
  "Extra Complementary",
] as const;

type AddonCategory = (typeof ADDON_CATEGORIES)[number];

type SelectedAddOn = AddOnService & {
  qty: number;
  category: AddonCategory;
};

const PublicQuotationView = () => {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<"approved" | "rejected" | null>(null);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const [addOnServices, setAddOnServices] = useState<AddOnService[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [selectedAddOnId, setSelectedAddOnId] = useState<number | "">("");
  const [addOnQty, setAddOnQty] = useState<number>(1);
  const [addOnCategory, setAddOnCategory] = useState<AddonCategory>("Wedding");

  const [leadId, setLeadId] = useState<number | null>(null);

  /* ================= Fetch quotation ================= */
  useEffect(() => {
    if (!token) return;

    QuotationPublicAPI.viewQuotation(token)
      .then((res) => {
        const responseData = res.data.data;
        setData(responseData);
        setStatus(responseData.status);
        setLeadId(Number(responseData.lead?.leadId));

      })
      .catch(() => setError("This quotation link is invalid or expired"))
      .finally(() => setLoading(false));
  }, [token]);

  /* ================= Fetch add-ons ================= */
  useEffect(() => {
    QuotationPublicAPI.getAddOns()
      .then((res) => {
        const addons = res.data.data.map((a: any) => ({
          id: a.id,
          name: a.name,
          unitLabel: a.unitLabel,
          defaultQty: a.defaultQty,
          price: Number(a.price),
        }));
        setAddOnServices(addons);
      })
      .catch(() => console.error("Failed to load add-ons"));
  }, []);

  /* ================= Image preview scroll lock ================= */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowImagePreview(false);
    };

    if (showImagePreview) window.addEventListener("keydown", handleEsc);

    const html = document.documentElement;
    const body = document.body;

    if (showImagePreview) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    } else {
      html.style.overflow = "auto";
      body.style.overflow = "auto";
      body.style.touchAction = "auto";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      html.style.overflow = "auto";
      body.style.overflow = "auto";
      body.style.touchAction = "auto";
    };
  }, [showImagePreview]);

  /* ================= Helpers ================= */
  const getImageUrl = (path: string) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    if (path.startsWith("data:")) return path;

    const apiBase = import.meta.env.VITE_API_BASE_URL;
    return apiBase ? `${apiBase.replace("/api", "")}${path}` : path;
  };

  /* ================= Add-on logic ================= */
  const handleAddAddOn = () => {
    if (!selectedAddOnId) return;
    const addon = addOnServices.find((a) => a.id === selectedAddOnId);
    if (!addon) return;
    const qty = addOnQty || addon.defaultQty;

    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addon.id && a.category === addOnCategory);
      if (exists) return prev.map((a) => (a.id === addon.id && a.category === addOnCategory ? { ...a, qty: a.qty + qty } : a));
      return [...prev, { ...addon, qty, category: addOnCategory }];
    });

    setSelectedAddOnId("");
    setAddOnQty(1);
  };

  const removeAddOn = (id: number, category: AddonCategory) => {
    setSelectedAddOns((prev) => prev.filter((a) => !(a.id === id && a.category === category)));
  };

  /* ================= Approve/Reject logic ================= */
  const handleApprove = async () => {
  try {
    if (!token) return;
if (!leadId) {
  alert("Lead ID missing");
  return;
}


    // 1️⃣ Save addons first
    if (selectedAddOns.length > 0) {
      const payload = {
        addons: selectedAddOns.map(a => ({
          addonServiceId: a.id,
          quantity: a.qty || 1,
          category: a.category
        }))
      };
console.log("LeadId:", leadId);
console.log("Selected addons:", selectedAddOns);
console.log("Sending addons:", payload);
      await QuotationPublicAPI.addAddOnsToLead(leadId, payload);
    }

    // 2️⃣ Then approve
    await QuotationPublicAPI.updateStatus(token, "approved");

    setSuccess("approved");
    setStatus("approved");

  } catch (err) {
    console.error(err);
    alert("Approval failed. Please try again.");
  }
};


  const handleReject = async () => {
    try {
      if (!token) return;
      await QuotationPublicAPI.updateStatus(token, "rejected");
      setSuccess("rejected");
      setStatus("rejected");
    } catch {
      alert("Rejection failed");
    }
  };

  /* ================= Totals ================= */
  const quotation = data?.quotation;
  const lead = data?.lead;
  const basePrice = Number(quotation?.price || 0);

  const packageItemsTotal = useMemo(
    () => (quotation?.items || []).reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [quotation?.items]
  );
  
  const addOnTotal = useMemo(
    () => selectedAddOns.reduce((sum, a) => sum + a.price * a.qty, 0),
    [selectedAddOns]
  );

  const grandTotal = basePrice + addOnTotal;

  if (loading) return <Centered text="Loading quotation…" />;
  if (error) return <ErrorScreen message={error} />;
  if (success) return <SuccessScreen status={success} />;

  /* ================= Render ================= */
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-4">
        <div className="bg-white shadow rounded-2xl p-4 mb-4">
          <h1 className="text-2xl font-bold">
            Quotation for{" "}
            <span className="text-blue-600">{lead?.eventType || "Your Event"}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ===== Left ===== */}
          <div className="bg-white shadow rounded-2xl p-4">
            {quotation?.imageUrl && (
              <div className="relative mb-4">
                <img
                  src={getImageUrl(quotation.imageUrl)}
                  className="w-full max-h-64 object-contain rounded-xl border"
                />
                <button
                  onClick={() => setShowImagePreview(true)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full"
                >
                  <Eye size={18} />
                </button>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <Row label="Service" value={quotation?.serviceName} />
              <Row label="Description" value={quotation?.description} />
              <Row label="Quantity" value={quotation?.quantity} />
              <Row label="Package Price" value={`₹${basePrice - packageItemsTotal}`} bold />
              
              {(quotation?.items?.length > 0 || selectedAddOns.length > 0) && (() => {
                const CATEGORY_ORDER: Record<string, number> = {
                  service: 0,
                  packages: 1,
                  // event categories (from seed.ts)
                  wedding: 2,
                  shoot: 3,
                  engagement: 4,
                  reception: 5,
                  // add-ons (all variants)
                  "add-ons": 100,
                  "add-on": 100,
                  addons: 100,
                  addon: 100,
                  // tail categories (from seed.ts)
                  "next service": 110,
                  deliverable: 120,
                  deliverables: 120,
                  complementary: 130,
                  complimentary: 130,
                };
                
                const allItems = [
                  ...(quotation?.items || []),
                  ...selectedAddOns.map(a => ({
                    name: a.name,
                    category: a.category.toUpperCase(),
                    quantity: a.qty,
                    price: a.price * a.qty
                  }))
                ];

                const sorted = allItems.sort((a: any, b: any) => {
                  const aOrder = CATEGORY_ORDER[(a.category ?? "").toLowerCase()] ?? 50;
                  const bOrder = CATEGORY_ORDER[(b.category ?? "").toLowerCase()] ?? 50;
                  return aOrder - bOrder;
                });
                return (
                  <div className="mt-4 border-t pt-3 space-y-2">
                    <h3 className="font-semibold text-gray-700 text-sm">Package Items / Add-ons</h3>
                    {sorted.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} {item.category ? `(${item.category})` : ""} {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </span>
                        <span className="font-medium text-gray-800">
                          {item.price ? `₹${item.price}` : "inc."}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ===== Right ===== */}
          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-3">Add-on Services</h2>

            <div className="flex gap-2 flex-col sm:flex-row">
              <select
                value={selectedAddOnId}
                onChange={(e) => setSelectedAddOnId(Number(e.target.value))}
                className="border rounded-xl px-3 py-2 w-full"
              >
                <option value="">-- Select Add-on --</option>
                {addOnServices.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.unitLabel}) - ₹{a.price}
                  </option>
                ))}
              </select>

              <select
                value={addOnCategory}
                onChange={(e) => setAddOnCategory(e.target.value as AddonCategory)}
                className="border rounded-xl px-3 py-2 w-full sm:w-48"
              >
                {ADDON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={addOnQty}
                onChange={(e) => setAddOnQty(Number(e.target.value))}
                className="border rounded-xl px-3 py-2 w-full sm:w-24"
              />

              <button
                onClick={handleAddAddOn}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold"
              >
                Add
              </button>
            </div>

            {selectedAddOns.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedAddOns.map((a, idx) => (
                  <div
                    key={`${a.id}-${a.category}-${idx}`}
                    className="flex justify-between items-center border rounded-xl p-3 bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{a.name}</p>
                      <p className="text-xs text-blue-600 font-medium">{a.category}</p>
                      <p className="text-sm">
                        ₹{a.price} × {a.qty} = ₹{a.price * a.qty}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAddOn(a.id, a.category)}
                      className="text-red-600 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t pt-3">
              <Row label="Add-on Total" value={`₹${addOnTotal}`} />
              <div className="flex justify-between font-bold text-lg text-green-700 bg-green-50 p-3 rounded-xl">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {status === "pending" && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleApprove}
                  className="bg-green-600 text-white w-full py-2 rounded-xl"
                >
                  {selectedAddOns.length > 0 ? "Approve with Add-ons" : "Approve"}
                </button>

                <button
                  onClick={handleReject}
                  className="bg-red-600 text-white w-full py-2 rounded-xl"
                >
                  Reject
                </button>

                <button
                  onClick={() => setShowIssueModal(true)}
                  className="border border-gray-300 w-full py-2 rounded-xl font-medium"
                >
                  Raise an Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showIssueModal && (
        <RaiseIssueModal
          token={token!}
          onClose={() => {
            setShowIssueModal(false);
            setStatus("rejected");
            setSuccess("rejected");
          }}
        />
      )}

      {/* ===== Full-screen Image Preview ===== */}
      {showImagePreview && quotation?.imageUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <img
            src={getImageUrl(quotation.imageUrl)}
            className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
          />
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 text-black"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= Helpers ================= */
const Row = ({ label, value, bold }: { label: string; value: any; bold?: boolean }) => (
  <div className="flex justify-between border-b pb-2">
    <span className="text-gray-500">{label}</span>
    <span className={bold ? "font-bold" : "font-medium"}>{value || "-"}</span>
  </div>
);

const SuccessScreen = ({ status }: { status: "approved" | "rejected" }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-white p-8 rounded-2xl shadow text-center">
      <h1 className="text-2xl font-semibold">
        {status === "approved" ? "Quotation Approved" : "Quotation Rejected"}
      </h1>
      <p className="mt-2">Our team will contact you shortly.</p>
    </div>
  </div>
);

const ErrorScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="bg-white p-8 rounded-2xl shadow text-center">
      <h1 className="text-xl font-semibold">Link Invalid</h1>
      <p className="mt-2">{message}</p>
    </div>
  </div>
);

const Centered = ({ text }: { text: string }) => (
  <div className="min-h-screen flex items-center justify-center text-lg">{text}</div>
);

export default PublicQuotationView;
