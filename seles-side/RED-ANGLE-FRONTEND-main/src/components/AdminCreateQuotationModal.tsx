// src/components/AdminCreateQuotationModal.tsx
import { useState } from "react";
import { X } from "lucide-react";
import type {
  CreateQuotationForm,
  InvoicePackage,
} from "../api/quotations.api";
import toast from "react-hot-toast";

interface CreateQuotationModalProps {
  onClose: () => void;
  onSave?: (
    formData: CreateQuotationForm & { imageUrl?: string },
    imageFile?: File | null,
    items?: { name: string; category: string; quantity: number; price?: number | "" }[]
  ) => void;

  invoicePackages: InvoicePackage[];
  initialPackageId?: number | null;
}

const AdminCreateQuotationModal = ({
  onClose,
  onSave,
  invoicePackages,
  initialPackageId = null,
}: CreateQuotationModalProps) => {
  /* ---------- INITIAL PACKAGE ---------- */

  const initialPackage = initialPackageId
    ? invoicePackages.find((p) => p.id === initialPackageId) || null
    : null;

  /* ---------- IMAGE URL RESOLVER ---------- */

  const [items, setItems] = useState<{ name: string, category: string, quantity: number, price?: number | "" }[]>([
    { name: "", category: "", quantity: 1, price: "" }
  ]);


  const resolveImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("data:")) return imageUrl;

    const normalizedUrl = imageUrl.replace(/\\/g, "/");
    const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:9000";
    return `${base.replace(/\/$/, "")}/${normalizedUrl.replace(/^\/+/, "")}`;
  };

  /* ---------- STATE ---------- */

  const [formData, setFormData] = useState<CreateQuotationForm>({
    packageId: initialPackage ? initialPackage.id : null,
    packageName: initialPackage ? initialPackage.packageTitle : "",
    serviceProvided: initialPackage ? initialPackage.packageTitle : "",
    email: "",
    quantity: "",
    contactNumber: "",
    address: "",
    eventType: "",
    paymentTerms: "",
    budget: initialPackage ? String(initialPackage.price) : "",
    eventDate: "",
    assignee: "",
    description: "",
  });
  const RequiredStar = () => (
    <span className="text-red-500 ml-1">*</span>
  );


  const TERMS_OPTIONS = [
    { label: "Advance", value: 1 },
    { label: "On the Spot 80% on Event Day", value: 2 },
    { label: "On the Spot 40%", value: 3 },
    { label: "Remaining 20%", value: 4 },
  ];

  // ✅ IMAGE STATE (AUTO FROM PACKAGE)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPackage?.imageUrl
      ? resolveImageUrl(initialPackage.imageUrl)
      : null
  );

  const [selectedPackageImageUrl, setSelectedPackageImageUrl] =
    useState<string | null>(
      initialPackage?.imageUrl ?? null
    );

  /* ---------- HANDLERS ---------- */
  const [errors, setErrors] = useState<{
    packageId?: string;
    paymentTerms?: string;
    description?: string;
    image?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!formData.packageId) {
      newErrors.packageId = "Package is required";
    }

    if (!formData.paymentTerms) {
      newErrors.paymentTerms = "Payment terms are required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!imageFile && !selectedPackageImageUrl) {
      newErrors.image = "Quotation image is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      toast.error("Please fill all required fields");

      return;
    }

    setErrors({});

    const pkgPrice = formData.packageId
      ? Number(invoicePackages.find((p) => p.id === formData.packageId)?.price || 0)
      : 0;
    const itemsTotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const computedBudget = pkgPrice + itemsTotal;

    if (onSave) {
      const payload = {
        ...formData,
        budget: String(computedBudget),
        quantity: formData.quantity || "1",
        imageUrl:
          imageFile === null
            ? selectedPackageImageUrl ?? undefined
            : undefined,
        email: "",
        contactNumber: "",
        address: "",
        eventType: "",
        eventDate: "",
        assignee: "",
      };

      onSave(payload, imageFile, items);


      toast.success("Quotation created successfully");
    }

    onClose();
  };



  const handleChange = (
    field: keyof CreateQuotationForm,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePackageSelect = (value: string) => {
    if (!value) {
      setFormData((prev) => ({
        ...prev,
        packageId: null,
        packageName: "",
        serviceProvided: "",
        budget: "",
      }));
      setImagePreview(null);
      setImageFile(null);
      setSelectedPackageImageUrl(null);
      return;
    }

    const pkgId = Number(value);
    const pkg = invoicePackages.find((p) => p.id === pkgId);
    if (!pkg) return;

    setFormData((prev) => ({
      ...prev,
      packageId: pkg.id,
      packageName: pkg.packageTitle,
      serviceProvided: pkg.packageTitle,
      budget: String(pkg.price),
    }));

    // ✅ AUTO LOAD PACKAGE IMAGE
    setSelectedPackageImageUrl(pkg.imageUrl ?? null);
    setImagePreview(
      pkg.imageUrl ? resolveImageUrl(pkg.imageUrl) : null
    );
    setImageFile(null);
  };

  const handleImageChange = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };



  const pkgPrice = formData.packageId
    ? Number(invoicePackages.find((p) => p.id === formData.packageId)?.price || 0)
    : 0;
  const itemsTotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const displayBudget = pkgPrice + itemsTotal;

  /* ================= UI ================= */

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-4 py-3 flex justify-between">
          <h2 className="text-base font-bold">Create Quotation</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* LEFT */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">
                  Package <RequiredStar />
                </label>

                <select
                  value={formData.packageId ?? ""}
                  onChange={(e) =>
                    handlePackageSelect(e.target.value)
                  }
                  className="w-full border p-2 rounded text-xs"
                >
                  <option value="">Select package</option>
                  {invoicePackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.packageTitle} - ₹{pkg.price}
                    </option>
                  ))}
                </select>
                {errors.packageId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.packageId}
                  </p>
                )}

              </div>

              <div>
                <label className="text-xs font-medium">
                  Payment Terms <RequiredStar />
                </label>

                <select
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    handleChange("paymentTerms", e.target.value)
                  }
                  className="w-full border p-2 rounded text-xs"

                >
                  <option value="">Select terms</option>
                  {TERMS_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.paymentTerms && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.paymentTerms}
                  </p>
                )}

              </div>

              <div>
                <label className="text-xs font-medium">
                  Description <RequiredStar />
                </label>

                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  className="w-full border p-2 rounded text-xs"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Package Items</label>

              {items.map((item, index) => (
                <div key={index} className="flex gap-2 mt-2">

                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].name = e.target.value;
                      setItems(updated);
                    }}
                    className="border p-2 rounded text-xs w-full"
                  />

                  <select
                    value={item.category}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].category = e.target.value;
                      setItems(updated);
                    }}
                    className="border p-2 rounded text-xs"
                  >
                    <option value="">Category</option>
                    <option value="WEDDING">Wedding</option>
                    <option value="RECEPTION">Reception</option>
                    <option value="ENGAGEMENT">Engagement</option>
                    <option value="RITUALS">Rituals</option>
                    <option value="EXTRA_COMPLEMENTARY">Extra Complementary</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].quantity = Number(e.target.value);
                      setItems(updated);
                    }}
                    className="border p-2 rounded text-xs w-16"
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={item.price === "" ? "" : item.price}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[index].price = e.target.value === "" ? "" : Number(e.target.value);
                      setItems(updated);
                    }}
                    className="border p-2 rounded text-xs w-24"
                  />

                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none px-1"
                    title="Remove item"
                  >
                    ×
                  </button>

                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setItems([...items, { name: "", category: "", quantity: 1, price: "" }])
                }
                className="text-sm text-purple-600 mt-2"
              >
                + Add Item
              </button>
            </div>


            {/* RIGHT */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium">
                  Service Provided <RequiredStar />
                </label>

                <input
                  value={formData.serviceProvided}
                  readOnly
                  className="w-full border p-2 rounded text-xs bg-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Budget <RequiredStar />
                </label>

                <input
                  value={displayBudget}
                  readOnly
                  className="w-full border p-2 rounded text-xs bg-gray-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Quotation Image <RequiredStar />
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0])
                  }
                  className="text-xs"
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-24 w-full object-cover rounded"
                  />
                )}
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 border-t pt-4">
            <button
              type="submit"
              className="bg-violet-600 text-white px-4 py-2 rounded"
            >
              Create Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateQuotationModal;
