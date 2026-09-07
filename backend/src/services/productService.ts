import { query, isDbConnected } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { memoryStore, PackageRecord } from '../models/db';

export const productService = {
  async getProducts(studioId = 'studio_1', category?: string) {
    if (isDbConnected) {
      const conditions: string[] = ['studio_id = $1'];
      const values: any[] = [studioId];

      if (category && category !== 'all') {
        conditions.push('category = $2');
        values.push(category);
      }

      const res = await query(
        `SELECT * FROM packages WHERE ${conditions.join(' AND ')} ORDER BY price ASC`,
        values
      );
      return res.rows;
    } else {
      let packages = memoryStore.packages.filter(p => p.studioId === studioId);
      if (category && category !== 'all') {
        packages = packages.filter(p => p.category === category);
      }
      return packages;
    }
  },

  async getProductById(id: string) {
    if (isDbConnected) {
      const res = await query('SELECT * FROM packages WHERE id = $1', [id]);
      if (res.rows.length === 0) throw new AppError('Product not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      const p = memoryStore.packages.find(pkg => pkg.id === id);
      if (!p) throw new AppError('Product not found', 404, 'NOT_FOUND');
      return p;
    }
  },

  async createProduct(data: any) {
    const id = data.id || `pkg_${Date.now()}`;
    const studioId = data.studioId || 'studio_1';

    if (isDbConnected) {
      const res = await query(
        `INSERT INTO packages (
           id, studio_id, name, category, description, price, duration,
           photographers_count, edited_photos_count, album, video, addons, availability, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active')
         RETURNING *`,
        [
          id, studioId, data.name, data.category || 'Wedding', data.description || '',
          Number(data.price) || 50000, data.duration || '1 Day',
          Number(data.photographersCount) || 2, Number(data.editedPhotosCount) || 100,
          data.album || 'Standard Album', data.video || 'Cinematic Film',
          JSON.stringify(data.addons || []), data.availability || 'Available'
        ]
      );
      return res.rows[0];
    } else {
      const newPkg: PackageRecord = {
        id,
        studioId,
        name: data.name,
        category: data.category || 'Wedding',
        description: data.description || '',
        price: Number(data.price) || 50000,
        duration: data.duration || '1 Day',
        photographersCount: Number(data.photographersCount) || 2,
        editedPhotosCount: Number(data.editedPhotosCount) || 100,
        album: data.album || 'Standard Album',
        video: data.video || 'Cinematic Film',
        addons: data.addons || [],
        availability: data.availability || 'Available',
        status: 'active',
      };
      memoryStore.packages.push(newPkg);
      return newPkg;
    }
  },

  async updateProduct(id: string, data: any) {
    if (isDbConnected) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const allowed = ['name', 'category', 'description', 'price', 'duration', 'photographers_count', 'edited_photos_count', 'album', 'video', 'addons', 'availability', 'status'];
      for (const [key, val] of Object.entries(data)) {
        const col = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (allowed.includes(col)) {
          fields.push(`${col} = $${idx++}`);
          values.push(col === 'addons' && typeof val !== 'string' ? JSON.stringify(val) : val);
        }
      }

      if (fields.length === 0) return this.getProductById(id);

      values.push(id);
      const sql = `UPDATE packages SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await query(sql, values);
      if (res.rows.length === 0) throw new AppError('Product not found', 404, 'NOT_FOUND');
      return res.rows[0];
    } else {
      const idx = memoryStore.packages.findIndex(p => p.id === id);
      if (idx === -1) throw new AppError('Product not found', 404, 'NOT_FOUND');
      memoryStore.packages[idx] = { ...memoryStore.packages[idx], ...data };
      return memoryStore.packages[idx];
    }
  },

  async deleteProduct(id: string) {
    if (isDbConnected) {
      const res = await query('DELETE FROM packages WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) throw new AppError('Product not found', 404, 'NOT_FOUND');
      return { id };
    } else {
      const idx = memoryStore.packages.findIndex(p => p.id === id);
      if (idx === -1) throw new AppError('Product not found', 404, 'NOT_FOUND');
      memoryStore.packages.splice(idx, 1);
      return { id };
    }
  }
};
