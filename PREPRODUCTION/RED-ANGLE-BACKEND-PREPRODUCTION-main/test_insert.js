const { Client } = require('pg');
const c = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
const projectTypeFilters = ['Save the Video', 'Save the Date Video', 'Save The Date Video', 'Save The Video'];
c.connect()
  .then(() => c.query(`INSERT INTO assigned_projects (project_id, project_name, project_type, employee_id, reference_link, submit_selection, status)
             VALUES ($1, 'Pre-production Requirements', $2, 'Unassigned', $3, $4, 'Pending')
             ON CONFLICT (project_id, employee_id, project_type) 
             DO UPDATE SET 
                 reference_link = EXCLUDED.reference_link,
                 submit_selection = EXCLUDED.submit_selection,
                 updated_at = NOW()
             RETURNING *`, ['CRM-LD-02', projectTypeFilters[0], null, null]))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => c.end());
