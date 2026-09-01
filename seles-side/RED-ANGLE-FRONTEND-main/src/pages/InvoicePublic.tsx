import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import invoiceService from "../Services/invoiceService";
import InvoicePreviewModal from "../components/InvoicePreviewModal";

export default function InvoicePublic() {
     
  const { token } = useParams();
  
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
  const load = async () => {
    try {
      const res = await invoiceService.getInvoiceByToken(token!);
      const inv = res.data?.data ?? res.data;

      // 👇 ADD THESE LOGS HERE
      

      const snapshot = inv.invoiceSnapshot ?? inv;
const itemsByCategory = snapshot.itemsByCategory ?? {};


      const mappedInvoice = {
  invoiceId: snapshot.invoiceId,
  token: snapshot.token,
  status: snapshot.status,
  billNo: snapshot.invoiceId ? `INV${snapshot.invoiceId}` : (snapshot.billNo || snapshot.lead?.leadSerialNumber || `${snapshot.lead?.leadType ?? "LD"}-${snapshot.lead?.leadId}`),
  billingDate: snapshot.billingDate,
  name: `${snapshot.lead?.firstName ?? ""} ${snapshot.lead?.lastName ?? ""}`,
  contact: snapshot.lead?.email,
  eventDate: snapshot.lead?.eventDate,
  eventName: snapshot.lead?.eventType,
  location: snapshot.lead?.address,
  itemsByCategory,
  totalAmount: snapshot.totalPrice,
  paid: snapshot.paid ?? 0,
  discount: snapshot.discount ?? 0,
  qtyOverrides: snapshot.qtyOverrides ?? {},
  previewEvents: snapshot.previewEvents ?? [],
};


      setInvoice(mappedInvoice);
    } catch (err) {
      console.error(err);
    }
  };

  if (token) load();
}, [token]);


  if (!invoice) return <div>Loading invoice...</div>;

  return (
    <InvoicePreviewModal
  isOpen={true}
  onClose={() => {}}
  invoice={invoice}
  hideActions
/>

  );
}
