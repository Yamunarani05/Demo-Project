import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';
import { sendSuccess } from '../utils/response';
import { validateRequired } from '../validations';

export const productController = {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const studioId = String(req.query.studioId || 'studio_1');
      const category = req.query.category ? String(req.query.category) : undefined;
      const products = await productService.getProducts(studioId, category);
      return sendSuccess(res, products, 'Products fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, product, 'Product fetched successfully');
    } catch (err) {
      next(err);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequired(req.body, ['name', 'price']);
      const product = await productService.createProduct(req.body);
      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      return sendSuccess(res, updated, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await productService.deleteProduct(req.params.id);
      return sendSuccess(res, deleted, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
