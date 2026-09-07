const { Client } = require('pg');
const c = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
const projectTypeFilters = ['Save the Video', 'Save the Date Video', 'Save The Date Video', 'Save The Video'];
const projectIdCandidates = ['2', 'CRM-2', 'LD-02', 'LD-2'];
const appendText = 'test';
c.connect()
  .then(() => c.query(`UPDATE assigned_projects
         SET admin_notes = TRIM(SPLIT_PART(COALESCE(admin_notes, ''), '=== Client Pre-production Details ===', 1)) || $1,
             reference_link = $4,
             submit_selection = $5,
             updated_at = NOW()
         WHERE project_type = ANY($2::text[])
           AND project_id = ANY($3::text[])
         RETURNING *`, [appendText, projectTypeFilters, projectIdCandidates, null, null]))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => c.end());
