const fs = require('fs');

const queries = fs.readFileSync('src/queries/employee.queries.ts', 'utf-8');
const lateralMatch = queries.match(/const roleAssignmentsLateral = `([\s\S]*?)`;/);

if (lateralMatch) {
    console.log('Found LATERAL');
    let lateralStr = lateralMatch[1];
    
    // Remove the $1 condition checking
    lateralStr = lateralStr.replace(/at\.\w+ = ANY\(\$1::text\[\]\)/g, 'true');
    lateralStr = lateralStr.replace(/COALESCE\(at\.[\w_]+::text, '\[\]'\)::jsonb \?\| \$1::text\[\]/g, 'true');

    const viewSql = `
CREATE OR REPLACE VIEW lead_employee AS
SELECT 
    CONCAT(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+', '-', 'g')) AS lead_employee_id,
    COALESCE(el.external_id::text, at.external_lead_id) AS lead_id,
    role_assignment.task_name,
    role_assignment.flow_stage,
    COALESCE(ed.priority_level, el.priority) AS priority,
    CASE WHEN role_assignment.flow_stage = 'Event' THEN at.event_assignment_date ELSE at.event_date END AS deadline,
    at.created_at,
    role_assignment.employee_id
FROM assign_teams at
LEFT JOIN external_leads el ON at.external_lead_id = el.external_id::text OR at.external_lead_id = el.lead_serial_number
LEFT JOIN event_details ed ON ed.external_lead_id = at.external_lead_id OR ed.external_lead_id = el.external_id::text OR ed.external_lead_id = el.lead_serial_number
${lateralStr} role_assignment
WHERE role_assignment.employee_id IS NOT NULL;
`;

    fs.writeFileSync('scratch/create_view.sql', viewSql);
    console.log('Created scratch/create_view.sql');
}
