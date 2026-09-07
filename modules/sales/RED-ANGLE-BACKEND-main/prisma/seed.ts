// // import { PrismaClient } from '@prisma/client';
// // import "dotenv/config";
// // const prisma = new PrismaClient();

// // async function main() {
// //   console.log('Start seeding...');
// //   const packageServices = [
// //     {
// //       packageId: 1,
// //       packageTitle: 'Basic Photography Package',
// //       packageType: 'Photography',
// //       price: 15000.00,
// //     },
// //     {
// //       packageId: 2,
// //       packageTitle: 'Premium Photography Package',
// //       packageType: 'Photography',
// //       price: 35000.00,
// //     },
// //     {
// //       packageId: 3,
// //       packageTitle: 'Luxury Photography Package',
// //       packageType: 'Photography',
// //       price: 75000.00,
// //     },
// //     {
// //       packageId: 4,
// //       packageTitle: 'Basic Videography Package',
// //       packageType: 'Videography',
// //       price: 25000.00,
// //     },
// //     {
// //       packageId: 5,
// //       packageTitle: 'Premium Videography Package',
// //       packageType: 'Videography',
// //       price: 50000.00,
// //     },
// //     {
// //       packageId: 6,
// //       packageTitle: 'Cinematic Videography Package',
// //       packageType: 'Videography',
// //       price: 100000.00,
// //     },
// //     {
// //       packageId: 7,
// //       packageTitle: 'Basic Photo + Video Combo',
// //       packageType: 'Combo',
// //       price: 35000.00,
// //     },
// //     {
// //       packageId: 8,
// //       packageTitle: 'Premium Photo + Video Combo',
// //       packageType: 'Combo',
// //       price: 75000.00,
// //     },
// //     {
// //       packageId: 9,
// //       packageTitle: 'Complete Wedding Coverage',
// //       packageType: 'Combo',
// //       price: 150000.00,
// //     },
// //     {
// //       packageId: 10,
// //       packageTitle: 'Drone Photography Package',
// //       packageType: 'Aerial',
// //       price: 20000.00,
// //     },
// //     {
// //       packageId: 11,
// //       packageTitle: 'Pre-Wedding Shoot',
// //       packageType: 'Photography',
// //       price: 30000.00,
// //     },
// //     {
// //       packageId: 12,
// //       packageTitle: 'Engagement Photography',
// //       packageType: 'Photography',
// //       price: 18000.00,
// //     },
// //     {
// //       packageId: 13,
// //       packageTitle: 'Corporate Event Package',
// //       packageType: 'Photography',
// //       price: 40000.00,
// //     },
// //     {
// //       packageId: 14,
// //       packageTitle: 'Birthday Party Package',
// //       packageType: 'Combo',
// //       price: 25000.00,
// //     },
// //     {
// //       packageId: 15,
// //       packageTitle: 'Anniversary Photo Shoot',
// //       packageType: 'Photography',
// //       price: 15000.00,
// //     },
// //     {
// //       packageId: 16,
// //       packageTitle: 'Professional Photoshoot',
// //       packageType: 'Photography',
// //       price: 12000.00,
// //     },
// //     {
// //       packageId: 17,
// //       packageTitle: 'Product Photography',
// //       packageType: 'Photography',
// //       price: 10000.00,
// //     },
// //     {
// //       packageId: 18,
// //       packageTitle: 'Real Estate Photography',
// //       packageType: 'Photography',
// //       price: 8000.00,
// //     },
// //     {
// //       packageId: 19,
// //       packageTitle: 'Fashion Photoshoot',
// //       packageType: 'Photography',
// //       price: 45000.00,
// //     },
// //     {
// //       packageId: 20,
// //       packageTitle: 'Documentary Videography',
// //       packageType: 'Videography',
// //       price: 60000.00,
// //     },
// //   ];

// //   for (const pkg of packageServices) {
// //     const created = await prisma.packageServices.upsert({
// //       where: { id: pkg.packageId },
// //       update: {},
// //       create: {
// //         id: pkg.packageId,
// //         packageTitle: pkg.packageTitle,
// //         packageType: pkg.packageType,
// //         price: pkg.price,
// //       },
// //     });
// //     console.log(`Upserted package service: ${created.packageTitle}`);
// //   }

// //   // Seed Combo Events
// //   const comboEvents = [
// //     {
// //       id: 1,
// //       comboName: 'Photo + Video Essentials',
// //       description: 'Core coverage for events with both photography and videography.',
// //     },
// //     {
// //       id: 2,
// //       comboName: 'Premium Wedding Story',
// //       description: 'Extended hours, creative edits, and premium deliverables.',
// //     },
// //     {
// //       id: 3,
// //       comboName: 'Corporate Highlight',
// //       description: 'Coverage tailored for corporate launches and conferences.',
// //     },
// //   ];

// //   for (const combo of comboEvents) {
// //     const created = await prisma.comboEvent.upsert({
// //       where: { id: combo.id },
// //       update: {},
// //       create: {
// //         id: combo.id,
// //         comboName: combo.comboName,
// //         description: combo.description,
// //       },
// //     });
// //     console.log(`Upserted combo: ${created.comboName}`);
// //   }

// //   console.log('Seeding finished.');
// // }

// // main()
// //   .then(async () => {
// //     await prisma.$disconnect();
// //   })
// //   .catch(async (e) => {
// //     console.error(e);
// //     await prisma.$disconnect();

// //   });
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   const packages = [
//     {
//       id: 1,
//       packageTitle: "Basic Quotation - Wedding & Reception",
//       packageType: "Wedding",
//       price: 54000,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0001.jpg",
//     },
//     {
//       id: 2,
//       packageTitle: "Standard Quotation - Wedding & Reception",
//       packageType: "Wedding",
//       price: 89000,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0002.jpg",
//     },
//     {
//       id: 3,
//       packageTitle: "Premium Quotation - Wedding & Reception",
//       packageType: "Wedding",
//       price: 160000,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0003.jpg",
//     },
//     {
//       id: 4,
//       packageTitle: "RedAngle Elite Basic - Wedding & Reception",
//       packageType: "Wedding",
//       price: 69000,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0004.jpg",
//     },
//     {
//       id: 5,
//       packageTitle: "RedAngle Elite Standard - Wedding & Reception",
//       packageType: "Wedding",
//       price: 106000,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0005.jpg",
//     },
//     {
//       id: 6,
//       packageTitle: "RedAngle Elite Premium - Wedding & Reception",
//       packageType: "Wedding",
//       price: 180000,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0006.jpg",
//     },
//     {
//       id: 7,
//       packageTitle: "Add-On Services",
//       packageType: "Addon",
//       price: 0,
//       imageUrl: "/uploads/packages/2025 RED ANGLE_page-0007.jpg",
//     },
//   ];

//   for (const pkg of packages) {
//     await prisma.packageServices.upsert({
//       where: { id: pkg.id },
//       update: pkg,
//       create: pkg,
//     });
//   }

//   console.log("✅ Wedding packages seeded");
// }
// async function seedElitePremiumItems() {
//  const packageServiceId = 6; // RedAngle Elite Premium

//   const items = [
//     /* ==========================
//        WEDDING & RECEPTION
//     ========================== */
//     { name: "Traditional Photography", price: 12000, quantity: 1, category: "WEDDING" },
//     { name: "Traditional Videography", price: 12000, quantity: 1, category: "WEDDING" },
//     { name: "Candid Photography", price: 17000, quantity: 1, category: "WEDDING" },
//     { name: "Candid Videography", price: 23000, quantity: 1, category: "WEDDING" },
//     { name: "Drone Coverage", price: 12000, quantity: 1, category: "WEDDING" },

//     /* ==========================
//        PRE / POST WEDDING
//     ========================== */
//     { name: "Cinematic Photography", quantity: 1, category: "SHOOT" },
//     { name: "Cinematic Videography", quantity: 1, category: "SHOOT" },

//     /* ==========================
//        DELIVERABLES
//     ========================== */
//     {
//       name: "Premium Canvera Album",
//       quantity: 2,
//       category: "DELIVERABLE",
//     },
//     {
//       name: "Selected Photos (50 Sheets / 250 Photos)",
//       quantity: 1,
//       category: "DELIVERABLE",
//     },
//     {
//       name: "Wedding & Reception Traditional Video Output",
//       quantity: 2,
//       category: "DELIVERABLE",
//     },
//     {
//       name: "Cinematic Highlights Video (3–5 Minutes)",
//       quantity: 1,
//       category: "DELIVERABLE",
//     },
//     { name: "E-Album", quantity: 2, category: "DELIVERABLE" },
//     { name: "Miniature Album", quantity: 2, category: "DELIVERABLE" },

//     /* ==========================
//        COMPLIMENTARY
//     ========================== */
//     {
//       name: "Outdoor Canvera Magazine Album",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//     {
//       name: "Cinematic Save The Date Video (1–2 Minutes)",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//     { name: "AI Photo Frame", quantity: 1, category: "COMPLEMENTARY" },
//     {
//       name: "WhatsApp Photo Booth",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//     {
//       name: "Retouched Photos",
//       quantity: 20,
//       category: "COMPLEMENTARY",
//     },
//     { name: "Raw Footage", quantity: 1, category: "COMPLEMENTARY" },
//     {
//       name: "Google Drive Access (Final Output)",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//     {
//       name: "Pixs Office Support (Photo Selection)",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//   ];

//   for (const item of items) {
//     await prisma.packageServiceItem.create({
//       data: {
//         packageServiceId,
//         ...item,
//       },
//     });
//   }

// async function seedEliteStandardItems() {
//   const packageServiceId = 5; // RedAngle Elite Standard

//   const items = [
//     /* ==========================
//        WEDDING & RECEPTION
//     ========================== */
//     { name: "Traditional Photography", price: 12000, quantity: 1, category: "WEDDING" },
//     { name: "Traditional Videography", price: 12000, quantity: 1, category: "WEDDING" },
//     { name: "Candid Photography", price: 17000, quantity: 1, category: "WEDDING" },

//     /* ==========================
//        PRE / POST WEDDING
//     ========================== */
//     { name: "Cinematic Photography", quantity: 1, category: "SHOOT" },

//     /* ==========================
//        DELIVERABLES
//     ========================== */
//     {
//       name: "Premium Canvera Album",
//       quantity: 2,
//       category: "DELIVERABLE",
//     },
//     {
//       name: "Selected Photos (40 Sheets / 200 Photos)",
//       quantity: 1,
//       category: "DELIVERABLE",
//     },
//     {
//       name: "Wedding & Reception Traditional Video Output",
//       quantity: 2,
//       category: "DELIVERABLE",
//     },
//     { name: "E-Album", quantity: 2, category: "DELIVERABLE" },
//     { name: "Miniature Album", quantity: 2, category: "DELIVERABLE" },

//     /* ==========================
//        COMPLIMENTARY
//     ========================== */
//     { name: "A2 Photo Frame", quantity: 1, category: "COMPLEMENTARY" },
//     {
//       name: "Retouched Photos",
//       quantity: 15,
//       category: "COMPLEMENTARY",
//     },
//     { name: "Raw Footage", quantity: 1, category: "COMPLEMENTARY" },
//     {
//       name: "Google Drive Access (Final Output)",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//     {
//       name: "Pixs Office Support (Photo Selection)",
//       quantity: 1,
//       category: "COMPLEMENTARY",
//     },
//   ];

//   for (const item of items) {
//     await prisma.packageServiceItem.create({
//       data: {
//         packageServiceId,
//         ...item,
//       },
//     });
//   }

//   console.log("✅ Elite Standard package items seeded");
// }

//   const addons = [
//     { name: "Traditional Photo", price: 12000 },
//     { name: "Traditional Video", price: 12000 },
//     { name: "Candid Photo", price: 17000 },
//     { name: "Candid Video", price: 23000 },
//     { name: "Drone", price: 12000, price: 12000 },

//     { name: "LED TV 42 Inch", price: 10000, defaultQty: 2 },
//     { name: "LED TV 50 Inch", price: 12000, defaultQty: 2 },
//     { name: "LED Wall 8x6 Feet", price: 15000 },
//     { name: "LED Wall 12x8 Feet", price: 20000 },

//     { name: "360° Video Booth", price: 18000 },
//     { name: "Photo Booth with Print", price: 18000 },
//     { name: "Mirror Booth with Print", price: 18000 },

//     { name: "Mixer Setup", price: 12000 },
//     { name: "Live Streaming (4 Hours)", price: 12000 },

//     { name: "Regular Magazine Album (25 Sheet)", price: 15000 },
//     { name: "Canvera Magazine Album (25 Sheet)", price: 18000 },
//     { name: "Synthetic Additional Sheet", price: 350 },
//     { name: "Canvera Additional Sheet", price: 550 },
//   ];

//   for (const addon of addons) {
//     await prisma.addonService.upsert({
//       where: { name: addon.name },
//       update: {
//         price: addon.price,
//         defaultQty: addon.defaultQty ?? 1,
//       },
//       create: {
//         name: addon.name,
//         price: addon.price,
//         defaultQty: addon.defaultQty ?? 1,
//       },
//     });
//   }


//   console.log("✅ Elite Premium package items seeded");
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());

import { PrismaClient, PackageServiceCategory, UserRole, LeadStage, QuotationApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

/* --------------------------------------------------
  GENERIC SEED HELPER
-------------------------------------------------- */
async function seedPackage(
  pkg: {
    id: number;
    title: string;
    type: string;
    price: number;
    image: string | null;
  },
  items: {
    name: string;
    category: PackageServiceCategory;
    quantity?: number;
  }[]
) {
  let imageUrl = pkg.image;

  if (imageUrl && imageUrl.startsWith("/default_uploads")) {
    const filePath = path.join(process.cwd(), imageUrl);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).substring(1) || "jpeg";
      const mimeType = ext === "jpg" ? "jpeg" : ext;
      const base64Data = fs.readFileSync(filePath, { encoding: "base64" });
      imageUrl = `data:image/${mimeType};base64,${base64Data}`;
    } else {
      console.warn(`Warning: Image not found at ${filePath}`);
    }
  }

  await prisma.packageServices.upsert({
    where: { id: pkg.id },
    update: {
      packageTitle: pkg.title,
      packageType: pkg.type,
      price: pkg.price,
      imageUrl: imageUrl,
    },
    create: {
      id: pkg.id,
      packageTitle: pkg.title,
      packageType: pkg.type,
      price: pkg.price,
      imageUrl: imageUrl,
    },
  });

  await prisma.packageServiceItem.deleteMany({
    where: { packageServiceId: pkg.id },
  });

  await prisma.packageServiceItem.createMany({
    data: items.map((i) => ({
      packageServiceId: pkg.id,
      name: i.name,
      quantity: i.quantity ?? 1,
      category: i.category,
    })),
  });

  console.log(`✅ Seeded: ${pkg.title}`);
}

/* --------------------------------------------------
  MAIN
-------------------------------------------------- */
async function main() {


  /* ===========================
     REGULAR BASIC – ₹54,000
     (NO SHOOT)
  =========================== */
  await seedPackage(
    {
      id: 1,
      title: "Basic Quotation - Wedding & Reception",
      type: "Wedding",
      price: 54000,
      image: "/default_uploads/quotations/basic_page-0001.jpg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },

      { name: "Basic Synthetic Album 300 Selected Photos (40 Sheets)", category: "DELIVERABLE", quantity: 2 },
      { name: " Wedding & Reception Traditional Video Final Output in Google Drive Access", category: "DELIVERABLE", quantity: 3 },

      { name: "Raw Footage", category: "COMPLEMENTARY" },
      { name: "Colour Grade Photos", category: "COMPLEMENTARY", quantity: 10 },
      { name: "Google Drive Access (For Final Video’s Output)", category: "COMPLEMENTARY" },
      { name: "Pixs Office Support (For Photo Selection) - Valid for 150 Days from the date of Link Shared", category: "COMPLEMENTARY" },
    ]
  );

  /* ===========================
     REGULAR STANDARD – ₹89,000
     (HAS SHOOT)
  =========================== */
  await seedPackage(
    {
      id: 2,
      title: "Standard Quotation - Wedding & Reception",
      type: "Wedding",
      price: 89000,
      image: "/default_uploads/quotations/standard_page-0001.jpg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Photography (Wedding & Reception)", category: "WEDDING" },



      { name: "Standard Synthetic Each Album 200 Selected Photos (35 Sheets)", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Traditional Video Final Output in Google Drive Acess", category: "DELIVERABLE", quantity: 3 },


      { name: "PRE OR POST SHOOT(Candid Photography)", category: "COMPLEMENTARY" },
      { name: "A3 Photo Frame", category: "COMPLEMENTARY" },
      { name: "Raw Footage ", category: "COMPLEMENTARY" },
      { name: "Retouched Photos", category: "COMPLEMENTARY", quantity: 15 },
      { name: "Google Drive Access (For Final Video’s Output)", category: "COMPLEMENTARY" },
      { name: "Pixs Office Support (For Photo Selection) -Valid for 150 Days from the date of Link Shared", category: "COMPLEMENTARY" },
    ]
  );

  /* ===========================
     REGULAR PREMIUM – ₹1,60,000
     (HAS SHOOT)
  =========================== */
  await seedPackage(
    {
      id: 3,
      title: "Premium Quotation - Wedding & Reception",
      type: "Wedding",
      price: 160000,
      image: "/default_uploads/quotations/premium_page-0001.jpg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Drone (Wedding & Reception)", category: "WEDDING" },



      { name: "Premium Synthetic Each Album 250 Selected Photos (45 Sheets)", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Traditional Video Final Output in Google Drive Access", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Cinematic Highlights (3 to 5 min)", category: "DELIVERABLE", quantity: 1 },

      { name: "PRE OR POST SHOOT( Candid Photography & Candid Videography)", category: "COMPLEMENTARY" },
      { name: "A2 Photo Frame", category: "COMPLEMENTARY" },
      { name: "Cinematic Save The Date Video (1 to 2 min)", category: "COMPLEMENTARY" },
      { name: "Outdoor Magazine Album 40 Selected Photos 25 Sheets", category: "COMPLEMENTARY" },
      { name: "Raw Footage", category: "COMPLEMENTARY" },
      { name: "Retouched Photos", category: "COMPLEMENTARY" },
      { name: "Google Drive Access (For Final Video’s Output)", category: "COMPLEMENTARY" },
      { name: "Pixs Office Support (For Photo Selection) - Valid for 150 Days from the date of Link Shared", category: "COMPLEMENTARY" },
    ]
  );

  /* ===========================
     ELITE BASIC – ₹69,000
     (NO SHOOT)
  =========================== */
  await seedPackage(
    {
      id: 4,
      title: "Demo Elite Basic - Wedding & Reception",
      type: "Wedding",
      price: 69000,
      image: "/default_uploads/quotations/elite_basic_page-0001.jpg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },

      { name: "Standard Canvera Each Album 350 Selected Photos (50 Sheets)", category: "DELIVERABLE" },
      { name: "Wedding & Reception Traditional Video Final Output in Google Drive Access (2) ", category: "DELIVERABLE", quantity: 2 },
      { name: "E - Album", category: "DELIVERABLE", quantity: 1 },
      { name: "Miniature Album", category: "DELIVERABLE" },


      { name: "Colour grade photos", category: "COMPLEMENTARY", quantity: 10 },
      { name: "Raw footage", category: "COMPLEMENTARY" },
      { name: "Google Drive Access (For Final Video’s Output)", category: "COMPLEMENTARY" },
      { name: "Pixs Office Support (For Photo Selection) - Valid for 150 Days from the date of Link Shared", category: "COMPLEMENTARY" },
    ]
  );

  /* ===========================
     ELITE STANDARD – ₹1,06,000
  =========================== */
  await seedPackage(
    {
      id: 5,
      title: "Demo Elite Standard - Wedding & Reception",
      type: "Wedding",
      price: 106000,
      image: "/default_uploads/quotations/elite_standard_page-0001.jpg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Photography (Wedding & Reception)", category: "WEDDING" },


      { name: "Premium Canvera Each Album 200 Selected Photos (40 Sheets)", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Traditional Video Final Output in Google Drive Access", category: "DELIVERABLE", quantity: 2 },
      { name: "E - Album", category: "DELIVERABLE", quantity: 2 },
      { name: "Miniature Album", category: "DELIVERABLE", quantity: 2 },

      { name: "PRE OR POST WEDDING(Candid Photography)", category: "COMPLEMENTARY" },
      { name: "A2 Photo Frame", category: "COMPLEMENTARY" },
      { name: "Retouched Photos", category: "COMPLEMENTARY", quantity: 15 },
      { name: "Raw Footage", category: "COMPLEMENTARY" },
      { name: "Google Drive Access (For Final Video’s Output)", category: "COMPLEMENTARY" },
      { name: "Pixs Office Support (For Photo Selecion) - Valid for 150 Days from the date of Link Shared", category: "COMPLEMENTARY" },
    ]
  );

  /* ===========================
     ELITE PREMIUM – ₹1,80,000
  =========================== */
  await seedPackage(
    {
      id: 6,
      title: "Demo Elite Premium - Wedding & Reception",
      type: "Wedding",
      price: 180000,
      image: "/default_uploads/quotations/elite_premium_page-0001.jpg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Videography (Wedding & Recepiton)", category: "WEDDING" },
      { name: "Drone (Wedding & Reception)", category: "WEDDING" },

      { name: "Premium Canvera Each Album 250 Selected Photos (50 Sheets)", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Traditional Video Final Output in Google Drive Access", category: "DELIVERABLE", quantity: 2 },
      { name: "Cinematic Highlights (3 to 5min) ", category: "DELIVERABLE", quantity: 1 },
      { name: "E - Album", category: "DELIVERABLE", quantity: 2 },
      { name: "Miniature Album", category: "DELIVERABLE", quantity: 2 },

      { name: "PRE OR POST WEDDING(Cinematic Photography & Cinematic Videography)", category: "COMPLEMENTARY" },
      { name: "Outdoor Canvera Magazine Album 40 Selected Photos 25 Sheets", category: "COMPLEMENTARY" },
      { name: "Cinematic Save The Date Video (1 to 2min)", category: "COMPLEMENTARY" },
      { name: "A1 Photo Frame", category: "COMPLEMENTARY" },
      { name: "Retouched Photos", category: "COMPLEMENTARY" },
      { name: "Raw Footage", category: "COMPLEMENTARY" },
      { name: "Google Drive Access (For Final Video’s Output)", category: "COMPLEMENTARY" },
      { name: "Pixs Office Support (For Photo Selection) - Valid for 150 Days from the date of Link Shared", category: "COMPLEMENTARY" },
    ]
  );
  await seedPackage(
    {
      id: 7,
      title: "Demo-Single Session Basic Quotation",
      type: "Single Session",
      price: 19000,
      image: "/default_uploads/quotations/singlesession-basic.jpeg",
    },
    [
      { name: "Traditional Photography ", category: "SINGLE_SESSION" },

      { name: "Basic Synthetic Album 100 Selected Photos(20-Sheets)", category: "DELIVERABLE", quantity: 1 },
      { name: "Raw Footage", category: "DELIVERABLE" },
      { name: "Pix Office Support(For Photo Selection)", category: "DELIVERABLE", quantity: 1 },
    ]
  );

  await seedPackage(
    {
      id: 8,
      title: "Demo-Single Session Elite Quotation",
      type: "Single Session",
      price: 80000,
      image: "/default_uploads/quotations/singlesection-elite.jpeg",
    },
    [
      { name: "Traditional Photography", category: "SINGLE_SESSION" },
      { name: "Traditional Videography", category: "SINGLE_SESSION" },
      { name: "Candid Photography", category: "SINGLE_SESSION" },
      { name: "Candid Videography", category: "SINGLE_SESSION" },
      { name: "Drone", category: "SINGLE_SESSION" },

      { name: "Elite Synthetic Album 250 Selected Photos(45-sheets)", category: "DELIVERABLE", quantity: 1 },
      { name: "Traditional Video Output in Google Drive Access", category: "DELIVERABLE", quantity: 1 },
      { name: "Cinematic Video Output 3 to 5 min", category: "DELIVERABLE", quantity: 1 },
      { name: "Raw Footage", category: "DELIVERABLE", },
      { name: "Pixs Office Support(For Photo Selection)", category: "DELIVERABLE", },
    ]
  );

  await seedPackage(
    {
      id: 9,
      title: "Demo-Single Session Premium Quotation",
      type: "Single Session",
      price: 45000,
      image: "/default_uploads/quotations/singlesection-premium.jpeg",
    },
    [
      { name: "Traditional Photography", category: "SINGLE_SESSION" },
      { name: "Traditional Videography", category: "SINGLE_SESSION" },
      { name: "Candid Photography", category: "SINGLE_SESSION" },

      { name: "Premium Synthetic Album 200 Selected Photos(35-sheets)", category: "DELIVERABLE", quantity: 1 },
      { name: "Traditional Video Output in Google Drive Access", category: "DELIVERABLE", quantity: 1 },
      { name: "Raw Footage", category: "DELIVERABLE", },
      { name: "Pixs Office Support(For Photo Selection)", category: "DELIVERABLE", },
    ]
  );

  await seedPackage(
    {
      id: 10,
      title: "Demo-Single Session Standard Quotation",
      type: "Single Session",
      price: 29000,
      image: "/default_uploads/quotations/singlesection-standard.jpeg",
    },
    [
      { name: "Traditional Photography", category: "SINGLE_SESSION" },
      { name: "Traditional Videography", category: "SINGLE_SESSION" },

      { name: "Standard Synthetic Album 150 Selected Photos(25-sheets)", category: "DELIVERABLE", quantity: 1 },
      { name: "Traditional Video Output in Google Drive Access", category: "DELIVERABLE", quantity: 1 },
      { name: "Raw Footage", category: "DELIVERABLE", },
      { name: "Pixs Office Support(For Photo Selection)", category: "DELIVERABLE", },
    ]
  );


  await seedPackage(
    {
      id: 11,
      title: "MARVELOUS PACKAGE DESCRIPTION",
      type: "Wedding",
      price: 199000,
      image: "/default_uploads/quotations/marvalous_quotation.jpeg",
    },
    [
      { name: "Traditional Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Traditional Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Photography (Wedding & Reception)", category: "WEDDING" },
      { name: "Candid Videography (Wedding & Reception)", category: "WEDDING" },
      { name: "Drone (Wedding & Reception)", category: "WEDDING" },



      { name: "Premium canvera per album 250 selected photos 50 sheets (2)", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Traditional Video Output in Google Drive Access(2)", category: "DELIVERABLE", quantity: 2 },
      { name: "Wedding & Reception Cinematic Highlights (3 to 5 min)", category: "DELIVERABLE", quantity: 1 },
      { name: "E-Album(2)", category: "DELIVERABLE", quantity: 2 },
      { name: "Miniature Album (2)", category: "DELIVERABLE", quantity: 2 },



      { name: "PRE OR POST SHOOT( Candid Photography & Candid Videography)", category: "COMPLEMENTARY" },
      { name: "Outdoor canvera magazine album 40 selected photos 25 sheets (1)", category: "COMPLEMENTARY" },
      { name: "Cinematic save the date video (1 to 2 min)", category: "COMPLEMENTARY" },
      { name: "Outdoor Magazine Album 40 Selected Photos 25 Sheets", category: "COMPLEMENTARY" },
      { name: "A1 photo frame", category: "COMPLEMENTARY", quantity: 1 },
      { name: "A2 photo frame", category: "COMPLEMENTARY", quantity: 1 },
      { name: "Insta reel (20 to 30 sec)", category: "COMPLEMENTARY", quantity: 1 },
      { name: "Retouched photos", category: "COMPLEMENTARY", quantity: 20 },
      { name: "Google drive access (for final video's output) valid for 15 days from the date of link shared", category: "COMPLEMENTARY" },
      { name: "Pix office support (for photo selection) valid for 150 days from the date of link shared", category: "COMPLEMENTARY" },
      { name: "Raw footage has been handed over in your hard disk (including pre wedding pics & all video clips)", category: "COMPLEMENTARY" },
    ]
  );

  /* ===========================
     ADD-ON SERVICES (ID = 7)
  =========================== */
  const addons = [
    { name: "Traditional Photo", price: 12000 },
    { name: "Traditional Video", price: 12000 },
    { name: "Candid Photo", price: 17000 },
    { name: "Candid Video", price: 23000 },
    { name: "Drone", price: 12000 },
    { name: "LED TV 42 Inch", price: 10000, defaultQty: 2 },
    { name: "LED TV 50 Inch", price: 12000, defaultQty: 2 },
    { name: "LED Wall 8x6 Feet", price: 15000 },
    { name: "LED Wall 12x8 Feet", price: 20000 },
    { name: "360° Video Booth", price: 18000 },
    { name: "Photo Booth with Print", price: 18000 },
    { name: "Mirror Booth with Print", price: 18000 },
    { name: "Mixer Setup", price: 12000 },
    { name: "Live Streaming (4 Hours)", price: 12000 },
    { name: "Regular Magazine Album (25 Sheet)", price: 15000 },
    { name: "Canvera Magazine Album (25 Sheet)", price: 18000 },
    { name: "Synthetic Additional Sheet", price: 350 },
    { name: "Canvera Additional Sheet", price: 550 },
  ];

  for (const addon of addons) {
    await prisma.addonService.upsert({
      where: { name: addon.name },
      update: {
        price: addon.price,
        defaultQty: addon.defaultQty ?? 1,
      },
      create: {
        name: addon.name,
        price: addon.price,
        defaultQty: addon.defaultQty ?? 1,
        unitLabel: "Unit",
      },
    });
  }

  // Fix PostgreSQL sequence for packageServices to prevent unique constraint failures
  try {
    await prisma.$executeRawUnsafe(`SELECT setval('"packageServices_id_seq"', COALESCE((SELECT MAX(id) + 1 FROM "packageServices"), 1), false);`);
    console.log("Fixed sequence for packageServices.");
  } catch (err) {
    console.warn("Could not reset sequence, it might be a different DB engine.", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());