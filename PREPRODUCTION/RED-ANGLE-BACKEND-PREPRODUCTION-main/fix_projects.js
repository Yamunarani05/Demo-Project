const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:6000/Redangle-Preproduction' });

async function fixDemo3() {
  try {
    // Save the Date
    await pool.query(`
      UPDATE assigned_projects 
      SET reference_link = (SELECT reference_link FROM assigned_projects WHERE project_id = 'CRM-RAS-01' AND project_type = 'Save the Date Post' AND employee_id = 'Unassigned' LIMIT 1),
          submit_selection = (SELECT submit_selection FROM assigned_projects WHERE project_id = 'CRM-RAS-01' AND project_type = 'Save the Date Post' AND employee_id = 'Unassigned' LIMIT 1)
      WHERE project_id = 'CRM-RAS-01' AND project_type = 'Save the Date' AND employee_id = 'EMP-04'
    `);
    
    // Save the Video
    await pool.query(`
      UPDATE assigned_projects 
      SET reference_link = (SELECT reference_link FROM assigned_projects WHERE project_id = 'CRM-RAS-01' AND project_type = 'Save the Date Video' AND employee_id = 'Unassigned' LIMIT 1),
          submit_selection = (SELECT submit_selection FROM assigned_projects WHERE project_id = 'CRM-RAS-01' AND project_type = 'Save the Date Video' AND employee_id = 'Unassigned' LIMIT 1)
      WHERE project_id = 'CRM-RAS-01' AND project_type = 'Save the Video' AND employee_id = 'EMP-04'
    `);
    
    // Retouching
    await pool.query(`
      UPDATE assigned_projects 
      SET reference_link = (SELECT reference_link FROM assigned_projects WHERE project_id = 'CRM-RAS-01' AND project_type = 'Outdoor Retouch' AND employee_id = 'Unassigned' LIMIT 1),
          submit_selection = (SELECT submit_selection FROM assigned_projects WHERE project_id = 'CRM-RAS-01' AND project_type = 'Outdoor Retouch' AND employee_id = 'Unassigned' LIMIT 1)
      WHERE project_id = 'CRM-RAS-01' AND project_type = 'Retouching' AND employee_id = 'EMP-04'
    `);

    // Clean up old fallback rows
    await pool.query(`
      DELETE FROM assigned_projects 
      WHERE project_id = 'CRM-RAS-01' 
        AND project_type IN ('Save the Date Post', 'Save the Date Video', 'Outdoor Retouch') 
        AND employee_id = 'Unassigned'
    `);
    
    console.log("Fixed DEMO 3 assigned projects");
  } catch(e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
}

fixDemo3();
