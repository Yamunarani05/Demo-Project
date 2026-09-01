export function buildInvoiceViewModel(invoice: any) {
  const itemsByCategory: Record<string, any[]> = {};

  // PACKAGES
  (invoice.packageInvoices || []).forEach((pi: any) => {
    if (!itemsByCategory["PACKAGES"]) itemsByCategory["PACKAGES"] = [];

    itemsByCategory["PACKAGES"].push({
      name: pi.package?.packageTitle,
      quantity: pi.unit,
      price: Number(pi.package?.price || 0)
    });

    // Package items (Wedding, Shoot, etc.)
    (pi.package?.items || []).forEach((item: any) => {
      const category = (item.category || "SERVICE").toUpperCase();

      if (!itemsByCategory[category]) itemsByCategory[category] = [];

      // prevent duplicates from overlapping packages
      const exists = itemsByCategory[category].find(
        (i) => i.name === item.name
      );

      if (!exists) {
        itemsByCategory[category].push({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price || 0)
        });
      }
    });
  });

  // ADDONS
  if (invoice.addons?.length) {
    itemsByCategory["ADD-ONS"] = invoice.addons.map((addon: any) => {
      const baseName = addon.addonService?.name || "";
      const category = addon.category ? addon.category.toUpperCase() : "";
      const displayName = category ? `${baseName} (${category})` : baseName;
      return {
        name: displayName,
        quantity: addon.quantity,
        price: Number(addon.price || 0)
      };
    });
  }

  // INVOICE ITEMS (Overrides + Extra Items)
  (invoice.invoiceItems || []).forEach((item: any) => {
    let originalCategory = (item.category || "SERVICE").toUpperCase();
    let category = originalCategory;
    let name = item.name;

    // Treat extra items as Add-ons unless they are deliverables or complimentary
    if (!["DELIVERABLE", "DELIVERABLES", "COMPLIMENTARY", "EXTRA_COMPLEMENTARY"].includes(originalCategory)) {
      category = "ADD-ONS";
      if (originalCategory !== "SERVICE" && originalCategory !== "ADD-ONS") {
        name = `${item.name} (${originalCategory})`;
      }
    }

    if (!itemsByCategory[category]) itemsByCategory[category] = [];

    const existingItem = itemsByCategory[category].find(
      (i: any) => i.name === name || i.name === item.name
    );

    if (existingItem) {
      // OVERRIDE the quantity from the package default
      existingItem.quantity = item.quantity;
    } else {
      // NEW custom item
      itemsByCategory[category].push({
        name: name,
        quantity: item.quantity,
        price: Number(item.price || 0)
      });
    }
  });

  // Filter out any items that have quantity <= 0 (handles deletions)
  for (const cat in itemsByCategory) {
    itemsByCategory[cat] = itemsByCategory[cat].filter((i: any) => i.quantity > 0);
  }

  return itemsByCategory;
}
