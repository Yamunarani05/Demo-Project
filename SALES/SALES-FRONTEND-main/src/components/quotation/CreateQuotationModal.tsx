import { useEffect, useState } from "react";
import api from "../../api/api";

/* ---------- TYPES ---------- */

interface ComboType {
  id: number;
  comboName: string;
}

interface Props {
  leadId: number;
  onClose: () => void;
  onSuccess: () => void;
}

/* ---------- CONSTANTS ---------- */

const TERMS_OPTIONS = [
  { label: "Advance", value: 1 },
  { label: "On the Spot 80% on Event Day", value: 2 },
  { label: "On the Spot 40%", value: 3 },
  { label: "Remaining 20%", value: 4 },
];

/* ---------- COMPONENT ---------- */

const CreateQuotationModal = ({ leadId, onClose, onSuccess }: Props) => {
  const [combos, setCombos] = useState<ComboType[]>([]);
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role"); // ✅ role-based control

  const [form, setForm] = useState({
    serviceName: "",
    serviceProvided: "",
    quantity: 1,
    comboId: "",
    terms: "",
    price: "",
    description: "",
  });

  /* ---------- FETCH COMBOS ---------- */

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await api.get("/quotations/combos");
        setCombos(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch combos", err);
      }
    };

    fetchCombos();
  }, []);

  /* ---------- FORM HANDLING ---------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const isValid =
    form.serviceName.trim().length > 0 &&
    Number(form.price) > 0 &&
    form.terms !== "" &&
    form.comboId !== "";

  /* ---------- CREATE QUOTATION ---------- */

  const createQuotation = async () => {
    if (!isValid) return;

    try {
      setLoading(true);

      // 1️⃣ Create quotation (ALLOWED for employee)
      await api.post("/quotations", {
        serviceName: form.serviceName.trim(),
        serviceProvided: form.serviceProvided || null,
        quantity: Number(form.quantity),
        terms: Number(form.terms),
        price: Number(form.price),
        description: form.description || null,
        comboId: Number(form.comboId),
      });

      // 2️⃣ Attach quotation to lead ONLY if role is allowed
      if (role !== "employee") {
        await api.put(`/quotations/leads/${leadId}`, {
          currentStage: "Quotation",
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Quotation creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[900px] rounded-2xl p-8">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Create Quotation</h2>
            <p className="text-sm text-gray-400">
              {new Date().toDateString()}
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Package Name"
            name="serviceName"
            value={form.serviceName}
            onChange={handleChange}
          />

          <Input
            label="Service Provided"
            name="serviceProvided"
            value={form.serviceProvided}
            onChange={handleChange}
          />

          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min={1}
            value={form.quantity}
            onChange={handleChange}
          />

          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Event Type
            </label>
            <select
              name="comboId"
              value={form.comboId}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">Select event</option>
              {combos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.comboName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Payment Terms
            </label>
            <select
              name="terms"
              value={form.terms}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">Select terms</option>
              {TERMS_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Budget"
            name="price"
            type="number"
            min={0}
            value={form.price}
            onChange={handleChange}
          />

          <div className="col-span-2">
            <label className="text-sm text-gray-500 mb-1 block">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 h-28"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={createQuotation}
            disabled={!isValid || loading}
            className={`px-8 py-3 rounded-xl text-white ${isValid
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Creating..." : "Create Quotation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationModal;

/* ---------- INPUT ---------- */

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-sm text-gray-500 mb-1 block">{label}</label>
    <input {...props} className="w-full border rounded-lg px-4 py-3" />
  </div>
);
