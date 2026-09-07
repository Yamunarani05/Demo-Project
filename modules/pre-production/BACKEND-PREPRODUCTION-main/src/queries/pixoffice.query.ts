import { pool } from "../config/db";

export const createPixofficeTableQuery = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS pixoffice_entries (
        id SERIAL PRIMARY KEY,
        external_lead_id VARCHAR(100),
        event_name VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100),
        services JSONB,
        file_size VARCHAR(50),
        storage_path VARCHAR(255),
        qc_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE pixoffice_entries ALTER COLUMN external_lead_id TYPE VARCHAR(100) USING external_lead_id::text;
    `;
    await pool.query(query);
};

export const insertPixofficeEntryQuery = async (data: any) => {
    await createPixofficeTableQuery();

    const leadId = String(data.external_lead_id);

    await pool.query(
        `DELETE FROM pixoffice_entries WHERE external_lead_id::text = $1`,
        [leadId]
    );

    const query = `
      INSERT INTO pixoffice_entries (
        external_lead_id, event_name, sub_category, services, file_size, storage_path, qc_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
        data.external_lead_id,
        data.event_name,
        data.sub_category,
        JSON.stringify(data.services),
        data.file_size,
        data.storage_path,
        'Submitted'
    ];
    
    const updateEventQuery = `
      UPDATE event_details 
      SET media_status = 'QC_Pending_Pixoffice', updated_at = NOW()
      WHERE external_lead_id = $1
    `;
    await pool.query(updateEventQuery, [leadId]);

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getPixofficeStatsQuery = async () => {
    // Make sure table exists before querying stats
    await createPixofficeTableQuery();

    const pendingQuery = `SELECT COUNT(*) as cnt FROM pixoffice_entries WHERE qc_status IN ('Pending', 'Submitted')`;
    const completedQuery = `SELECT COUNT(*) as cnt FROM pixoffice_entries WHERE qc_status = 'QC Completed'`;

    const pendingResult = await pool.query(pendingQuery);
    const completedResult = await pool.query(completedQuery);

    return {
        pending: parseInt(pendingResult.rows[0].cnt, 10),
        completed: parseInt(completedResult.rows[0].cnt, 10)
    };
};

export const updatePixofficeStatusQuery = async (leadId: number | string, status: string) => {
    // Make sure table exists
    await createPixofficeTableQuery();

    const query = `
      UPDATE pixoffice_entries 
      SET qc_status = $2
      WHERE external_lead_id::text = $1::text
      RETURNING *;
    `;
    const result = await pool.query(query, [leadId, status]);
    return result.rows[0];
};
