import { useState } from "react";
import { X } from "lucide-react";

import type { InvoicePackage } from "../api/quotations.api";

interface Props {
  initialData?: InvoicePackage | null;   // ADD THIS
  onClose: () => void;
  onSave: (data: any) => void;
}
type PackageItem = {
  name: string;
  category: string;
  quantity: number;
  price: number;
};



export default function AdminCreatePackageModal({
  initialData,
  onClose,
  onSave,
}: Props)
 {
  const [packageTitle, setPackageTitle] = useState(initialData?.packageTitle || "");
const [packageType, setPackageType] = useState(initialData?.packageType || "");
const [price, setPrice] = useState(initialData?.price?.toString() || "");

  const [imageFile, setImageFile] = useState<File | null>(null);

 const [items, setItems] = useState<PackageItem[]>(
   initialData?.items && initialData.items.length > 0
     ? initialData.items.map((item: any) => ({
         name: item.name,
         category: item.category,
         quantity: item.quantity,
         price: Number(item.price || 0)
       }))
     : [{ name: "", category: "WEDDING", quantity: 1, price: 0 }]
 );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { name: "", category: "WEDDING", quantity: 1, price: 0 }]);
  };

  const updateItem = (
  index: number,
  field: keyof PackageItem,
  value: string | number
) => {
  const updated = [...items];
  updated[index][field] = value as never;
  setItems(updated);
};


  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = () => {
    onSave({
      packageTitle,
      packageType,
      price,
      imageFile,
      items
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-[600px]">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">
  {initialData ? "Edit Package" : "Create Package"}
</h2>

          <X onClick={onClose} className="cursor-pointer" />
        </div>

        {/* Package Fields */}
        <input
          placeholder="Package Title"
          value={packageTitle}
          onChange={(e) => setPackageTitle(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          placeholder="Package Type"
          value={packageType}
          onChange={(e) => setPackageType(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        {/* Items */}
        <h3 className="font-semibold mb-2">Package Items</h3>

        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              className="border p-2 w-full"
            />

            <select
              value={item.category}
              onChange={(e) => updateItem(index, "category", e.target.value)}
              className="border p-2"
            >
              <option value="WEDDING">Wedding</option>
              <option value="RECEPTION">Reception</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="RITUALS">Rituals</option>
              <option value="EXTRA_COMPLEMENTARY">Extra Complementary</option>
            </select>

            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
              className="border p-2 w-20"
              placeholder="Qty"
            />

            <input
              type="number"
              value={item.price === 0 ? "" : item.price}
              onChange={(e) => updateItem(index, "price", Number(e.target.value))}
              className="border p-2 w-28"
              placeholder="Price (₹)"
            />

            <button onClick={() => removeItem(index)}>❌</button>
          </div>
        ))}

        


        <button onClick={addItem} className="text-purple-600 mb-4">
          + Add Item
        </button>
        <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  }}
  className="border p-2 w-full mb-4"
/>

        <button
          onClick={handleSubmit}
          className="bg-purple-600 text-white px-4 py-2 rounded w-full"
        >
          Save Package
        </button>
      </div>
    </div>
  );
}
