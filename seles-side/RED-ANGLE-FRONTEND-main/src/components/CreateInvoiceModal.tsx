// src/components/CreateInvoiceModal.tsx
import React, { useEffect, useState } from "react";
import { X, Plus, Trash2, Minus, Plus as PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { InvoiceDetail } from "../types/invoice";
import type { PreviewInvoice } from "./InvoicePreviewModal";



export interface CreatedItem {
  id: string;          // stringified packageId from backend
  description: string; // packageTitle
  qty: number;
  category?: string;
}

export interface PackageOption {
  id: number;
  packageTitle: string;
}

export interface AddonOption {
  id: number;
  name: string;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;

  onSubmit: (data: {
    packages: CreatedItem[];
    addons: CreatedItem[];
    items: CreatedItem[];
  }) => Promise<{ id: number } | null>;

  packages?: PackageOption[];
  addons?: AddonOption[];   // ✅ ADD THIS
  initialItems?: CreatedItem[];
}





const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  packages = [],
  addons = [],
  initialItems,
}) => {


  const [selectedId, setSelectedId] = useState<string>("");
  const [packagesState, setPackagesState] = useState<CreatedItem[]>([]);
  const [addonsState, setAddonsState] = useState<CreatedItem[]>([]);
  const [itemsState, setItemsState] = useState<CreatedItem[]>([]);
  const [selectedAddonId, setSelectedAddonId] = useState<string>("");




  useEffect(() => {
    if (!isOpen) {
      setPackagesState([]);
      setAddonsState([]);
      setItemsState([]);
      return;
    }

    if (initialItems) {
      setPackagesState(initialItems.filter(i => i.category === "SERVICE"));
      setAddonsState(initialItems.filter(i => i.category === "ADD-ONS"));
      setItemsState(
        initialItems.filter(
          i =>
            i.category !== "SERVICE" &&
            i.category !== "ADD-ONS"
        )
      );
    }
  }, [isOpen, initialItems]);


  const addSelectedAddon = () => {
    if (!selectedAddonId) return;

    if (addonsState.some(a => a.id === `addon-${selectedAddonId}`)) {
      setSelectedAddonId("");
      return;
    }

    const addon = addons?.find(a => String(a.id) === selectedAddonId);
    if (!addon) return;

    setAddonsState(prev => [
      ...prev,
      {
        id: `addon-${addon.id}`,
        description: addon.name,
        qty: 1,
        category: "ADD-ONS"
      }
    ]);

    setSelectedAddonId("");
  };



  const addSelected = () => {
    if (!selectedId) return;

    // avoid duplicates
    if (packagesState.some((it) => it.id === `pkg-${selectedId}`)) {
      setSelectedId("");
      return;
    }

    const pkg = packages.find((p) => String(p.id) === selectedId);
    if (!pkg) {
      setSelectedId("");
      return;
    }

    setPackagesState((prev) => [
      ...prev,
      {
        id: `pkg-${pkg.id}`,
        description: pkg.packageTitle,
        qty: 1,
      },
    ]);
    setSelectedId("");
  };

  const removeItem = (id: string) => {
    setPackagesState(prev => prev.map(it => it.id === id ? { ...it, qty: 0 } : it));
    setAddonsState(prev => prev.map(it => it.id === id ? { ...it, qty: 0 } : it));
    setItemsState(prev => prev.map(it => it.id === id ? { ...it, qty: 0 } : it));
  };


  const inc = (id: string) => {
    setPackagesState(prev =>
      prev.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it)
    );

    setAddonsState(prev =>
      prev.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it)
    );

    setItemsState(prev =>
      prev.map(it => it.id === id ? { ...it, qty: it.qty + 1 } : it)
    );
  };


  const dec = (id: string) => {
    setPackagesState(prev =>
      prev.map(it =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
      )
    );

    setAddonsState(prev =>
      prev.map(it =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
      )
    );

    setItemsState(prev =>
      prev.map(it =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
      )
    );
  };



  const handleSubmit = async () => {
    const activePackages = packagesState.filter(p => p.qty > 0);
    if (activePackages.length === 0) {
      toast.error("Please add at least one package");
      return;
    }

    try {
      const createdInvoice = await onSubmit({
        packages: activePackages,
        addons: addonsState.filter(a => a.qty > 0),
        items: itemsState,
      });

      if (createdInvoice) {
        toast.success("Invoice saved!");
        onClose();
      } else {
        toast.error("Failed to save invoice");
      }
    } catch {
      toast.error("Failed to save invoice");
    }
  };





  if (!isOpen) return null;
  const normalizeCategory = (cat?: string) => {
    if (!cat) return "SERVICE";

    const c = cat.toUpperCase();

    if (c.includes("SERVICE")) return "SERVICE";
    if (c.includes("PACKAGE")) return "SERVICE";
    if (c.includes("WEDDING")) return "WEDDING";
    if (c.includes("ENGAGEMENT")) return "ENGAGEMENT";
    if (c.includes("RECEPTION")) return "RECEPTION";
    if (c.includes("RITUAL")) return "RITUALS";
    if (c.includes("SHOOT")) return "SHOOT";
    if (c.includes("DELIVERABLE")) return "DELIVERABLES";
    if (c.includes("COMPLIMENT") || c.includes("COMPLEMENT")) return "EXTRA_COMPLEMENTARY";
    if (c.includes("ADDON") || c === "ADD-ONS") return "ADD-ONS";

    // fallback — keep original category
    return cat.toUpperCase();
  };


  function transformInvoiceToPreview(data: InvoiceDetail): PreviewInvoice {
    return {
      invoiceId: data.invoiceId,
      token: data.token,
      name: `${data.lead?.firstName ?? ""} ${data.lead?.lastName ?? ""}`,
      contact: data.lead?.contactNumber,
      billingDate: data.billingDate,
      eventName: data.lead?.eventType,
      totalAmount: data.totalPrice,
      paid: data.paid,
      discount: data.discount,

      itemsByCategory: data.itemsByCategory ?? {},

      addons: data.leadAddons?.map(a => ({
        id: a.addonServiceId,
        quantity: a.quantity,
        addonService: {
          name: a.addonService?.name || ""
        }
      })) ?? []

    };
  }

  const allItems = [...packagesState, ...addonsState, ...itemsState];

  console.log("Submitting addons:", addonsState);

  const groupedItems = allItems.reduce((acc: any, item) => {
    if (item.qty <= 0) return acc;
    const category = normalizeCategory(item.category);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});




  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: "calc(100vh - 3.5rem)",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            Create Invoice - Add Packages
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Package
          </label>
          <div className="flex gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select package...</option>
              {packages.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.packageTitle}
                </option>
              ))}
            </select>
            <button
              onClick={addSelected}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Add-on
          </label>

          <div className="flex gap-2">
            <select
              value={selectedAddonId}
              onChange={(e) => setSelectedAddonId(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select add-on...</option>
              {addons?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <button
              onClick={addSelectedAddon}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>


          {packagesState.length > 0 && (

            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, catItems]) => (
                <div key={category} className="space-y-2">

                  {/* Section Title */}
                  <div className="text-sm font-semibold text-gray-700 border-b pb-1">
                    {category}
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2">
                    {(catItems as CreatedItem[]).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-800">
                            {it.description}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dec(it.id)}
                              className="p-1 rounded border hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <div className="px-3 py-1 bg-white border rounded text-sm w-12 text-center">
                              {it.qty}
                            </div>

                            <button
                              onClick={() => inc(it.id)}
                              className="p-1 rounded border hover:bg-gray-100"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(it.id)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}


          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-[#6938ef] to-[#5a2dd4] text-white rounded-lg text-sm"
            >
              Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
