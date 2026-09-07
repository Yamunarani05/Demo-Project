export const buildWhatsappLink = (contactNumber?: string | null) => {
  if (!contactNumber) return null;

  let phone = contactNumber.replace(/\D/g, "");

  if (phone.startsWith("91") && phone.length === 12) {
    phone = phone.slice(2);
  }

  return `https://wa.me/91${phone}`;
};
