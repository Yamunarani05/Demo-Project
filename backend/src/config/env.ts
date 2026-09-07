import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lumina_db',
  JWT_SECRET: process.env.JWT_SECRET || 'lumina_production_jwt_super_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_lumina12345',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'lumina_razorpay_secret_67890',
  EMAIL_FROM: process.env.EMAIL_FROM || 'LUMINA Photography Management <noreply@lumina.io>',
};
