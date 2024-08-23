import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from "~/env.mjs";

interface GlobalWithPool {
  pgPool?: Pool;
}

declare const global: GlobalWithPool;

class Database {
  private pool: Pool;

  constructor() {
    this.pool = global.pgPool || new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      max: 20, // Set maximum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if a connection cannot be established
    });

    if (env.NODE_ENV !== "production") {
      global.pgPool = this.pool;
    }

    // Add error handler to prevent pool crashes
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      const res = await client.query<T>(text, params);
      const duration = Date.now() - start;
      if (env.NODE_ENV === "development") {
        console.log('Executed query', { text, duration, rows: res.rowCount });
      }
      return res;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

const db = new Database();
export default db;