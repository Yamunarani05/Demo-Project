import { pool } from "../config/db";

export const createPixstudioTableQuery = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS pixstudio_entries (
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
      ALTER TABLE pixstudio_entries ALTER COLUMN external_lead_id TYPE VARCHAR(100) USING external_lead_id::text;
    `;
    await pool.query(query);
};

export const insertPixstudioEntryQuery = async (data: any) => {
    await createPixstudioTableQuery();

    const leadId = String(data.external_lead_id);

    await pool.query(
        `DELETE FROM pixstudio_entries WHERE external_lead_id::text = $1`,
        [leadId]
    );

    const query = `
      INSERT INTO pixstudio_entries (
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
      SET media_status = 'QC_Pending_Pixstudio', updated_at = NOW()
      WHERE external_lead_id = $1
    `;
    await pool.query(updateEventQuery, [leadId]);

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getPixstudioStatsQuery = async () => {
    await createPixstudioTableQuery();
    
    const query = `
        SELECT qc_status, COUNT(*) as count 
        FROM pixstudio_entries 
        GROUP BY qc_status
    `;
    const result = await pool.query(query);
    
    const stats = {
        pending: 0,
        completed: 0
    };
    
    result.rows.forEach(row => {
        if (row.qc_status === 'Pending') stats.pending = parseInt(row.count);
        if (row.qc_status === 'Completed') stats.completed = parseInt(row.count);
    });
    
    return stats;
};
