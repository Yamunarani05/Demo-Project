import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

// Initialize PostgreSQL Connection Pool
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export let isDbConnected = false;

pool.on('error', (err: Error) => {
  console.error('⚠️ Unexpected error on idle PostgreSQL client', err);
});

/**
 * Execute parameterized query against PostgreSQL
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development' && duration > 500) {
      console.log(`[SLOWER QUERY] ${duration}ms: ${text.substring(0, 100)}...`);
    }
    return res;
  } catch (err: any) {
    console.error(`[DB QUERY ERROR] Query failed: ${text.substring(0, 150)}`, err?.message || err);
    throw err;
  }
}

/**
 * Acquire dedicated client from pool (for manual transaction control)
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Execute callback inside an atomic transaction (BEGIN ... COMMIT, with ROLLBACK on error)
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Test PostgreSQL connectivity and probe database health
 */
export async function testConnection(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    isDbConnected = true;
    console.log(`✅ PostgreSQL connected successfully to [${res.rows[0].db}] at ${res.rows[0].now}`);
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn(`⚠️ PostgreSQL connection warning: ${err?.message || err}`);
    console.warn(`👉 To activate full PostgreSQL persistence: createdb lumina_db && npm run migrate && npm run seed`);
    return false;
  }
}
