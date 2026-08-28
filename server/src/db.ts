import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
let pool: Pool | null = null;
let useDatabase = false;

// Resilient in-memory fallback stores
export interface ContactRecord {
  id: string | number;
  name: string;
  email: string;
  company?: string;
  message: string;
  created_at: string;
}

export interface DemoRequestRecord {
  id: string | number;
  name: string;
  email: string;
  company?: string;
  team_size?: string;
  plan_interest?: string;
  notes?: string;
  created_at: string;
}

export interface NewsletterRecord {
  id: string | number;
  email: string;
  subscribed_at: string;
}

const memoryStore = {
  contacts: [] as ContactRecord[],
  demoRequests: [] as DemoRequestRecord[],
  newsletterSubscribers: [] as NewsletterRecord[],
};

export async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await pool.connect();
      console.log('Connected to PostgreSQL successfully.');

      // Initialize database schema tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS demo_requests (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          team_size VARCHAR(50),
          plan_interest VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      client.release();
      useDatabase = true;
      console.log('PostgreSQL database tables verified and ready.');
    } catch (err: any) {
      console.warn('⚠️ PostgreSQL connection failed or not available. Running in resilient memory-store mode.', err?.message || err);
      useDatabase = false;
    }
  } else {
    console.log('ℹ️ No DATABASE_URL provided. Running with active local memory-store.');
    useDatabase = false;
  }
}

// Database helper functions with automatic fallback
export async function saveContact(data: Omit<ContactRecord, 'id' | 'created_at'>): Promise<ContactRecord> {
  const timestamp = new Date().toISOString();

  if (useDatabase && pool) {
    try {
      const res = await pool.query(
        `INSERT INTO contacts (name, email, company, message) VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.name, data.email, data.company || null, data.message]
      );
      return res.rows[0];
    } catch (error) {
      console.error('PostgreSQL insert error, saving to memory fallback:', error);
    }
  }

  const record: ContactRecord = {
    id: `cont_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    email: data.email,
    company: data.company,
    message: data.message,
    created_at: timestamp,
  };
  memoryStore.contacts.push(record);
  return record;
}

export async function saveDemoRequest(data: Omit<DemoRequestRecord, 'id' | 'created_at'>): Promise<DemoRequestRecord> {
  const timestamp = new Date().toISOString();

  if (useDatabase && pool) {
    try {
      const res = await pool.query(
        `INSERT INTO demo_requests (name, email, company, team_size, plan_interest, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.name, data.email, data.company || null, data.team_size || null, data.plan_interest || 'Studio', data.notes || null]
      );
      return res.rows[0];
    } catch (error) {
      console.error('PostgreSQL insert error, saving to memory fallback:', error);
    }
  }

  const record: DemoRequestRecord = {
    id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    email: data.email,
    company: data.company,
    team_size: data.team_size,
    plan_interest: data.plan_interest || 'Studio',
    notes: data.notes,
    created_at: timestamp,
  };
  memoryStore.demoRequests.push(record);
  return record;
}

export async function saveNewsletterSubscriber(email: string): Promise<NewsletterRecord> {
  const timestamp = new Date().toISOString();

  if (useDatabase && pool) {
    try {
      const res = await pool.query(
        `INSERT INTO newsletter_subscribers (email) VALUES ($1) 
         ON CONFLICT (email) DO UPDATE SET subscribed_at = CURRENT_TIMESTAMP 
         RETURNING *`,
        [email]
      );
      return res.rows[0];
    } catch (error) {
      console.error('PostgreSQL insert error, saving to memory fallback:', error);
    }
  }

  const existing = memoryStore.newsletterSubscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.subscribed_at = timestamp;
    return existing;
  }

  const record: NewsletterRecord = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    subscribed_at: timestamp,
  };
  memoryStore.newsletterSubscribers.push(record);
  return record;
}

export function getDatabaseStatus() {
  return {
    isPostgresConnected: useDatabase,
    memoryCounts: {
      contacts: memoryStore.contacts.length,
      demoRequests: memoryStore.demoRequests.length,
      newsletterSubscribers: memoryStore.newsletterSubscribers.length,
    }
  };
}
