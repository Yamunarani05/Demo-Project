const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:6000/Redangle-Preproduction' });

pool.query(`
  SELECT id, project_id, project_type, project_name, employee_id, 
         reference_link, submit_selection, 
         LEFT(admin_notes, 200) AS admin_notes_preview
  FROM assigned_projects 
  WHERE project_id ILIKE '%RAS%'
  ORDER BY id DESC 
  LIMIT 10
`).then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}).catch(e => {
  console.error(e.message);
  pool.end();
});
