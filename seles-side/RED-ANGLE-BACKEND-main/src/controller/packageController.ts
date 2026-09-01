import { Request, Response } from "express";
import prisma from "../config/prisma";

class PackageController {

  async getAll(req: Request, res: Response) {
    try {
      const packages = await prisma.packageServices.findMany({
        include: { items: true },
        orderBy: { id: "asc" }
      });

      res.json({
        success: true,
        data: packages
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { packageTitle, packageType, price, items } = req.body;

      // get image from multer
      const imageUrl = req.file
        ? `/uploads/packages/${req.file.filename}`
        : null;

      const parsedItems = items ? (typeof items === "string" ? JSON.parse(items) : items) : [];

      const pkg = await prisma.packageServices.create({
        data: {
          packageTitle,
          packageType,
          price: Number(price),
          imageUrl,
          items: {
            create: parsedItems
              .filter((item: any) => item.name && item.name.trim() !== "")
              .map((item: any) => ({
                name: item.name,
                quantity: Number(item.quantity),
                price: Number(item.price || 0),
                category: item.category || "WEDDING"
              }))
          }
        },
        include: { items: true }
      });

      res.status(201).json({
        success: true,
        data: pkg,
      });
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { packageTitle, packageType, price, imageUrl, items } = req.body;

      const parsedItems = items ? (typeof items === "string" ? JSON.parse(items) : items) : [];

      // Determine final imageUrl
      let finalImageUrl = imageUrl;
      if (req.file) {
        finalImageUrl = `/uploads/packages/${req.file.filename}`;
      }

      const pkg = await prisma.packageServices.update({
        where: { id },
        data: {
          packageTitle,
          packageType,
          price: Number(price),
          imageUrl: finalImageUrl,
          items: {
            deleteMany: {},
            create: parsedItems
              .filter((item: any) => item.name && item.name.trim() !== "")
              .map((item: any) => ({
                name: item.name,
                quantity: Number(item.quantity),
                price: Number(item.price || 0),
                category: item.category || "WEDDING"
              }))
          }
        },
        include: { items: true }
      });

      res.json({
        success: true,
        data: pkg
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      await prisma.packageServices.delete({
        where: { id }
      });

      res.json({
        success: true
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }

}

export default new PackageController();
