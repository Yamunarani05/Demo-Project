CREATE OR REPLACE VIEW lead_employee AS
SELECT 
    CONCAT(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+', '-', 'g')) AS lead_employee_id,
    COALESCE(el.external_id::text, at.external_lead_id) AS lead_id,
    role_assignment.task_name,
    role_assignment.flow_stage,
    COALESCE(ed.priority_level, el.priority) AS priority,
    CASE WHEN role_assignment.flow_stage = 'Event' THEN at.event_assignment_date ELSE at.event_date END AS deadline,
    at.created_at,
    CAST(REGEXP_REPLACE(role_assignment.employee_id, '\D', '', 'g') AS INTEGER) AS employee_id,
    emp.first_name AS employee_first_name,
    emp.last_name AS employee_last_name,
    ap.status,
    el.invoice_data
FROM assign_teams at
LEFT JOIN external_leads el ON at.external_lead_id = el.external_id::text OR at.external_lead_id = el.lead_serial_number
LEFT JOIN event_details ed ON ed.external_lead_id = at.external_lead_id OR ed.external_lead_id = el.external_id::text OR ed.external_lead_id = el.lead_serial_number
CROSS JOIN LATERAL (
    VALUES
        ('Pre-production Photography', 'Pre-production', at.photographer),
        (COALESCE(at.event_photographer_label, 'Event Photography')::text, 'Event', at.event_photographer),
        ('Pre-production Videography', 'Pre-production', at.videographer),
        (COALESCE(at.event_videographer_label, 'Event Videography')::text, 'Event', at.event_videographer),
        ('Pre-production Drone Coverage', 'Pre-production', at.drone),
        (COALESCE(at.event_drone_label, 'Event Drone Coverage')::text, 'Event', at.event_drone),
        ('Save the Date Post', 'Pre-production Phase 2', at.save_the_date),
        ('Save the Video', 'Pre-production Phase 2', at.save_the_video),
        ('Retouch', 'Pre-production Phase 2', at.retouch),
        (COALESCE(at.event_secondary_photographer_label, 'Secondary Photography')::text, 'Event', 
         CASE WHEN jsonb_array_length(COALESCE(at.event_secondary_photographer, '[]'::jsonb)) > 0 THEN at.event_secondary_photographer->>0 ELSE NULL END),
        (COALESCE(at.event_secondary_videographer_label, 'Secondary Videography')::text, 'Event', 
         CASE WHEN jsonb_array_length(COALESCE(at.event_secondary_videographer, '[]'::jsonb)) > 0 THEN at.event_secondary_videographer->>0 ELSE NULL END)
) AS role_assignment(task_name, flow_stage, employee_id)
LEFT JOIN employees emp ON emp.employee_id = role_assignment.employee_id
LEFT JOIN LATERAL (
    SELECT ap2.status FROM assigned_projects ap2
    WHERE ap2.project_id = CONCAT('CRM-', COALESCE(el.lead_serial_number, el.external_id::text, at.external_lead_id))
    AND (
        (role_assignment.task_name = 'Save the Date Post' AND ap2.project_type IN ('Save the Date Post', 'Save the Date', 'Save The Date Post', 'Save The Date')) OR
        (role_assignment.task_name = 'Save the Video' AND ap2.project_type IN ('Save the Date Video', 'Save the Video', 'Save The Date Video', 'Save The Video')) OR
        (role_assignment.task_name = 'Retouch' AND ap2.project_type IN ('Outdoor Retouch', 'Retouch', 'Retouching'))
    )
    ORDER BY 
        CASE WHEN ap2.submit_selection IS NOT NULL OR ap2.reference_link IS NOT NULL THEN 1 ELSE 0 END DESC,
        ap2.created_at DESC
    LIMIT 1
) ap ON true
WHERE role_assignment.employee_id IS NOT NULL AND role_assignment.employee_id != '';
