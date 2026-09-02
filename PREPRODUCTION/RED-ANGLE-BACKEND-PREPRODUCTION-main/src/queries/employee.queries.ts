import { pool } from "../config/db";
import { ensureEventUploadColumnsQuery } from "./eventDetails.query";
import { ensureAssignTeamColumnsQuery } from "./assignTeam.query";
import { ensureEventRuntimeSessionsQuery } from "./eventRuntime.query";

// Safely convert EMP-XXX or numeric string to integer, throws if invalid
const toNumericEmployeeId = (employeeId: number | string): number => {
    const numericId = typeof employeeId === 'string' && employeeId.startsWith('EMP-')
        ? parseInt(employeeId.replace('EMP-', ''), 10)
        : Number(employeeId);
    if (isNaN(numericId) || numericId <= 0) {
        throw new Error(`Invalid employee ID: ${employeeId}`);
    }
    return numericId;
};

const getEmployeeCodeVariants = (employeeId: number | string): string[] => {
    const raw = String(employeeId ?? "").trim();
    const digits = raw.replace(/\D/g, "");
    const variants = new Set<string>();

    if (raw) variants.add(raw);

    if (digits) {
        const numeric = Number(digits);
        variants.add(digits);
        variants.add(String(numeric));
        variants.add(`EMP-${digits}`);
        variants.add(`EMP-${numeric}`);
        variants.add(`EMP-${String(numeric).padStart(2, "0")}`);
        variants.add(`EMP-${String(numeric).padStart(3, "0")}`);
    }

    return Array.from(variants).filter(Boolean);
};

const getNumericEmployeeIdOrNull = (employeeId: number | string): number | null => {
    const digits = String(employeeId ?? "").replace(/\D/g, "");
    if (!digits) return null;

    const numeric = Number(digits);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const ensureAssignmentAcceptanceColumnsQuery = async () => {
    await ensureAssignTeamColumnsQuery();
    await pool.query(`
        ALTER TABLE assign_teams
        ADD COLUMN IF NOT EXISTS accepted_assignments JSONB DEFAULT '[]'::jsonb
    `);
};

const roleAssignmentsLateral = `
    CROSS JOIN LATERAL (
        VALUES
            (
                'photography',
                'Pre-production Photography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Photographer',
                at.photographer = ANY($1::text[]),
                COALESCE(pps.drive_link, ed.drive_link),
                COALESCE(pps.upload_notes, ed.upload_notes),
                CASE WHEN COALESCE(pps.drive_link, ed.drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                COALESCE(pps.photo_reupload_remarks, ed.photo_reupload_remarks),
                NULL::text
            ),
            (
                'event-photography',
                COALESCE(at.event_photographer_label, 'Event Photography'),
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Photographer',
                at.event_photographer = ANY($1::text[]),
                ed.drive_link,
                ed.upload_notes,
                CASE WHEN COALESCE(ed.drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.photo_reupload_remarks,
                NULL::text
            ),
            (
                'videography',
                'Pre-production Videography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Videographer',
                at.videographer = ANY($1::text[]),
                COALESCE(pps.video_drive_link, ed.video_drive_link),
                COALESCE(pps.video_upload_notes, ed.video_upload_notes),
                CASE WHEN COALESCE(pps.video_drive_link, ed.video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                COALESCE(pps.video_reupload_remarks, ed.video_reupload_remarks),
                NULL::text
            ),
            (
                'event-videography',
                COALESCE(at.event_videographer_label, 'Event Videography'),
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Videographer',
                at.event_videographer = ANY($1::text[]),
                ed.video_drive_link,
                ed.video_upload_notes,
                CASE WHEN COALESCE(ed.video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.video_reupload_remarks,
                NULL::text
            ),
            (
                'drone-coverage',
                'Pre-production Drone Coverage',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Drone',
                at.drone = ANY($1::text[]),
                COALESCE(ed.drone_photo_drive_link, ed.drone_video_drive_link),
                COALESCE(ed.drone_upload_notes, ed.drone_video_upload_notes),
                CASE
                    WHEN COALESCE(ed.drone_photo_drive_link, '') != '' OR COALESCE(ed.drone_video_drive_link, '') != '' THEN 'Submitted'
                    ELSE NULL
                END,
                ed.drone_reupload_remarks,
                NULL::text
            ),
            (
                'event-drone-coverage',
                COALESCE(at.event_drone_label, 'Event Drone Coverage'),
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Drone',
                at.event_drone = ANY($1::text[]),
                COALESCE(ed.drone_photo_drive_link, ed.drone_video_drive_link),
                COALESCE(ed.drone_upload_notes, ed.drone_video_upload_notes),
                CASE
                    WHEN COALESCE(ed.drone_photo_drive_link, '') != '' OR COALESCE(ed.drone_video_drive_link, '') != '' THEN 'Submitted'
                    ELSE NULL
                END,
                ed.drone_reupload_remarks,
                NULL::text
            ),
            (
                'save-the-date-post',
                'Save the Date Post',
                'Pre-production Phase 2',
                'CRM Editing Team',
                'Pre-production -> Phase 2 Editing -> Save the Date Post',
                at.save_the_date = ANY($1::text[]),
                ed.save_the_date_drive_link,
                ed.save_the_date_upload_notes,
                COALESCE(
                    ed.save_the_date_submission_status,
                    CASE WHEN COALESCE(ed.save_the_date_drive_link, '') != '' THEN 'Submitted' ELSE NULL END
                ),
                ed.save_the_date_reupload_remarks,
                (SELECT admin_notes FROM assigned_projects ap WHERE ap.project_id = CONCAT('CRM-', COALESCE(el.lead_serial_number, el.external_id::text, at.external_lead_id)) AND ap.project_type = 'Save the Date' LIMIT 1)
            ),
            (
                'save-the-video',
                'Save the Video',
                'Pre-production Phase 2',
                'CRM Editing Team',
                'Pre-production -> Phase 2 Editing -> Save the Video',
                at.save_the_video = ANY($1::text[]),
                ed.save_the_video_drive_link,
                ed.save_the_video_upload_notes,
                COALESCE(
                    ed.save_the_video_submission_status,
                    CASE WHEN COALESCE(ed.save_the_video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END
                ),
                ed.save_the_video_reupload_remarks,
                (SELECT admin_notes FROM assigned_projects ap WHERE ap.project_id = CONCAT('CRM-', COALESCE(el.lead_serial_number, el.external_id::text, at.external_lead_id)) AND ap.project_type = 'Save the Video' LIMIT 1)
            ),
            (
                'retouch',
                'Retouch',
                'Pre-production Phase 2',
                'CRM Editing Team',
                'Pre-production -> Phase 2 Editing -> Retouch',
                at.retouch = ANY($1::text[]),
                ed.retouch_drive_link,
                ed.retouch_upload_notes,
                COALESCE(
                    ed.retouch_submission_status,
                    CASE WHEN COALESCE(ed.retouch_drive_link, '') != '' THEN 'Submitted' ELSE NULL END
                ),
                ed.retouch_reupload_remarks,
                (SELECT admin_notes FROM assigned_projects ap WHERE ap.project_id = CONCAT('CRM-', COALESCE(el.lead_serial_number, el.external_id::text, at.external_lead_id)) AND ap.project_type = 'Retouching' LIMIT 1)
            ),
            (
                'secondary-photography',
                'Pre-production Secondary Photography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Secondary Photographer',
                COALESCE(at.secondary_photographer::text, '[]')::jsonb ?| $1::text[],
                ed.secondary_photo_drive_link,
                ed.secondary_photo_upload_notes,
                CASE WHEN COALESCE(ed.secondary_photo_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.secondary_photo_reupload_remarks,
                NULL::text
            ),
            (
                'event-secondary-photography',
                COALESCE(at.event_secondary_photographer_label, 'Event Secondary Photography'),
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Secondary Photographer',
                COALESCE(at.event_secondary_photographer::text, '[]')::jsonb ?| $1::text[],
                ed.secondary_photo_drive_link,
                ed.secondary_photo_upload_notes,
                CASE WHEN COALESCE(ed.secondary_photo_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.secondary_photo_reupload_remarks,
                NULL::text
            ),
            (
                'secondary-videography',
                'Pre-production Secondary Videography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Secondary Videographer',
                COALESCE(at.secondary_videographer::text, '[]')::jsonb ?| $1::text[],
                ed.secondary_video_drive_link,
                ed.secondary_video_upload_notes,
                CASE WHEN COALESCE(ed.secondary_video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.secondary_video_reupload_remarks,
                NULL::text
            ),
            (
                'event-secondary-videography',
                COALESCE(at.event_secondary_videographer_label, 'Event Secondary Videography'),
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Secondary Videographer',
                COALESCE(at.event_secondary_videographer::text, '[]')::jsonb ?| $1::text[],
                ed.secondary_video_drive_link,
                ed.secondary_video_upload_notes,
                CASE WHEN COALESCE(ed.secondary_video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.secondary_video_reupload_remarks,
                NULL::text
            ),
            (
                'secondary-drone-coverage',
                'Pre-production Secondary Drone Coverage',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Secondary Drone',
                COALESCE(at.secondary_drone::text, '[]')::jsonb ?| $1::text[],
                COALESCE(ed.drone_photo_drive_link, ed.drone_video_drive_link),
                COALESCE(ed.drone_upload_notes, ed.drone_video_upload_notes),
                CASE
                    WHEN COALESCE(ed.drone_photo_drive_link, '') != '' OR COALESCE(ed.drone_video_drive_link, '') != '' THEN 'Submitted'
                    ELSE NULL
                END,
                NULL,
                NULL::text
            ),
            (
                'event-secondary-drone-coverage',
                'Event Secondary Drone Coverage',
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Secondary Drone',
                COALESCE(at.event_secondary_drone::text, '[]')::jsonb ?| $1::text[],
                COALESCE(ed.drone_photo_drive_link, ed.drone_video_drive_link),
                COALESCE(ed.drone_upload_notes, ed.drone_video_upload_notes),
                CASE
                    WHEN COALESCE(ed.drone_photo_drive_link, '') != '' OR COALESCE(ed.drone_video_drive_link, '') != '' THEN 'Submitted'
                    ELSE NULL
                END,
                NULL,
                NULL::text
            ),
            (
                COALESCE(
                    (
                        SELECT 'additional-staff' || CASE
                            WHEN split_part(staff_entry, '::', 2) != ''
                            THEN '-' || regexp_replace(lower(split_part(staff_entry, '::', 2)), '[^a-z0-9]+', '-', 'g')
                            ELSE ''
                        END
                        FROM jsonb_array_elements_text(COALESCE(at.additional_staff, '[]'::jsonb)) AS staff_entry
                        WHERE staff_entry LIKE ANY (
                            SELECT v || '::%' FROM unnest($1::text[]) AS v
                        )
                        LIMIT 1
                    ),
                    'additional-staff'
                ),
                COALESCE(
                    (
                        SELECT 'Pre-production Additional Staff - ' || split_part(staff_entry, '::', 2)
                        FROM jsonb_array_elements_text(COALESCE(at.additional_staff, '[]'::jsonb)) AS staff_entry
                        WHERE staff_entry LIKE ANY (
                            SELECT v || '::%' FROM unnest($1::text[]) AS v
                        )
                        LIMIT 1
                    ),
                    'Pre-production Additional Staff'
                ),
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Additional Staff',
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(at.additional_staff, '[]'::jsonb)) AS staff_entry
                    WHERE staff_entry LIKE ANY (
                        SELECT v || '::%' FROM unnest($1::text[]) AS v
                    )
                ),
                NULL,
                NULL,
                NULL,
                NULL,
                NULL::text
            ),
            (
                COALESCE(
                    (
                        SELECT 'event-additional-staff' || CASE
                            WHEN split_part(staff_entry, '::', 2) != ''
                            THEN '-' || regexp_replace(lower(split_part(staff_entry, '::', 2)), '[^a-z0-9]+', '-', 'g')
                            ELSE ''
                        END
                        FROM jsonb_array_elements_text(COALESCE(at.event_additional_staff, '[]'::jsonb)) AS staff_entry
                        WHERE staff_entry LIKE ANY (
                            SELECT v || '::%' FROM unnest($1::text[]) AS v
                        )
                        LIMIT 1
                    ),
                    'event-additional-staff'
                ),
                COALESCE(
                    (
                        SELECT 'Event Additional Staff - ' || split_part(staff_entry, '::', 2)
                        FROM jsonb_array_elements_text(COALESCE(at.event_additional_staff, '[]'::jsonb)) AS staff_entry
                        WHERE staff_entry LIKE ANY (
                            SELECT v || '::%' FROM unnest($1::text[]) AS v
                        )
                        LIMIT 1
                    ),
                    'Event Additional Staff'
                ),
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Additional Staff',
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(at.event_additional_staff, '[]'::jsonb)) AS staff_entry
                    WHERE staff_entry LIKE ANY (
                        SELECT v || '::%' FROM unnest($1::text[]) AS v
                    )
                ),
                NULL,
                NULL,
                NULL,
                NULL,
                NULL::text
            )
    ) AS role_assignment(task_key, task_name, flow_stage, request_source, stage_path, is_assigned, upload_link, upload_notes, status, reupload_remarks, assigned_projects_admin_notes)
`;

// Dashboard: stats + recent projects for an employee
export const getEmployeeDashboardQuery = async (employeeId: number | string) => {
    await ensureEventUploadColumnsQuery();
    await ensureAssignmentAcceptanceColumnsQuery();
    const empCodes = getEmployeeCodeVariants(employeeId);
    const numericEmployeeId = getNumericEmployeeIdOrNull(employeeId);

    let preStatsRaw = { rows: [{ total_assigned: "0", pending: "0", submitted: "0" }] };
    let preRecentRaw = { rows: [] as any[] };

    try {
        preStatsRaw = await pool.query(
            `SELECT
          COUNT(*) AS total_assigned,
          COUNT(*) FILTER (
            WHERE NOT (
              $2::int IS NOT NULL
              AND COALESCE(at.accepted_assignments::text, '[]')::jsonb @> jsonb_build_array($2::text || ':' || role_assignment.task_key)
            )
          ) AS pending,
          COUNT(*) FILTER (WHERE COALESCE(role_assignment.status, '') = 'Submitted') AS submitted
        FROM assign_teams at
        LEFT JOIN external_leads el
            ON at.external_lead_id = el.external_id::text
            OR at.external_lead_id = el.lead_serial_number
        LEFT JOIN event_details ed
            ON ed.external_lead_id = at.external_lead_id
            OR ed.external_lead_id = el.external_id::text
            OR ed.external_lead_id = el.lead_serial_number
        LEFT JOIN pre_production_shoots pps
            ON pps.external_lead_id = at.external_lead_id
            OR pps.external_lead_id = el.external_id::text
            OR pps.external_lead_id = el.lead_serial_number
        ${roleAssignmentsLateral}
        WHERE role_assignment.is_assigned`,
            [empCodes, numericEmployeeId]
        );

        preRecentRaw = await pool.query(
            `SELECT
                CONCAT(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+', '-', 'g')) AS lead_employee_id,
                COALESCE(el.external_id::text, at.external_lead_id) AS lead_id,
                COALESCE(
                    el.lead_serial_number,
                    CASE WHEN el.external_id IS NOT NULL THEN CONCAT('EXT-', el.external_id::text) END,
                    at.external_lead_id
                ) AS lead_code,
                COALESCE(el.lead_name, ed.client_name, at.external_lead_id) AS name,
                COALESCE(el.event_type, ed.event_type) AS type,
                role_assignment.task_key,
                role_assignment.task_name,
                role_assignment.flow_stage,
                role_assignment.request_source,
                role_assignment.stage_path,
                COALESCE(ed.priority_level, el.priority) AS priority,
                CASE WHEN role_assignment.flow_stage = 'Event' THEN at.event_assignment_date ELSE at.event_date END AS deadline,
                at.created_at
            FROM assign_teams at
            LEFT JOIN external_leads el
                ON at.external_lead_id = el.external_id::text
                OR at.external_lead_id = el.lead_serial_number
            LEFT JOIN event_details ed
                ON ed.external_lead_id = at.external_lead_id
                OR ed.external_lead_id = el.external_id::text
                OR ed.external_lead_id = el.lead_serial_number
            LEFT JOIN pre_production_shoots pps
                ON pps.external_lead_id = at.external_lead_id
                OR pps.external_lead_id = el.external_id::text
                OR pps.external_lead_id = el.lead_serial_number
            ${roleAssignmentsLateral}
            WHERE role_assignment.is_assigned
            ORDER BY at.created_at DESC
            LIMIT 5`,
            [empCodes]
        );
    } catch (err) {
        console.error("Failed to fetch PreProduction data for dashboard:", err);
    }

    // Merge Stats
    const total_assigned = (parseInt(preStatsRaw.rows[0].total_assigned) || 0);
    const pending = (parseInt(preStatsRaw.rows[0].pending) || 0);
    const submitted = (parseInt(preStatsRaw.rows[0].submitted) || 0);

    // Merge and sort recent projects - REMOVED MERGE
    const recentProjects = preRecentRaw.rows;

    return {
        stats: {
            assigned: total_assigned,
            pending: pending,
            submitted: submitted,
            approved: 0,
        },
        recentProjects,
    };
};

// Assigned Projects: all leads assigned to employee
export const getAssignedProjectsQuery = async (employeeId: number | string) => {
    await ensureEventUploadColumnsQuery();
    await ensureAssignmentAcceptanceColumnsQuery();
    await ensureEventRuntimeSessionsQuery();
    const empCodes = getEmployeeCodeVariants(employeeId);
    const numericEmployeeId = getNumericEmployeeIdOrNull(employeeId);
    let preProjects = { rows: [] as any[] };

    try {
        preProjects = await pool.query(
            `SELECT
                CONCAT(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+', '-', 'g')) AS lead_employee_id,
                COALESCE(el.external_id::text, at.external_lead_id) AS lead_id,
                COALESCE(
                    el.lead_serial_number,
                    CASE WHEN el.external_id IS NOT NULL THEN CONCAT('EXT-', el.external_id::text) END,
                    at.external_lead_id
                ) AS lead_code,
                COALESCE(el.lead_name, ed.client_name, at.external_lead_id) AS name,
                COALESCE(el.event_type, ed.event_type) AS type,
                role_assignment.task_key,
                role_assignment.task_name,
                role_assignment.flow_stage,
                role_assignment.request_source,
                role_assignment.stage_path,
                COALESCE(ed.priority_level, el.priority) AS priority,
                CASE WHEN role_assignment.flow_stage = 'Event' THEN at.event_assignment_date ELSE at.event_date END AS deadline,
                CASE WHEN role_assignment.flow_stage = 'Event' THEN COALESCE(at.event_assignment_location, ed.event_location, el.location) ELSE COALESCE(at.location, ed.event_location, el.location) END AS description,
                (
                    $2::int IS NOT NULL
                    AND COALESCE(at.accepted_assignments::text, '[]')::jsonb @> jsonb_build_array($2::text || ':' || role_assignment.task_key)
                ) AS accepted,
                role_assignment.upload_link,
                role_assignment.upload_notes,
                role_assignment.status,
                role_assignment.reupload_remarks,
                COALESCE(role_assignment.assigned_projects_admin_notes, role_assignment.reupload_remarks) AS admin_notes,
                ap.reference_link,
                ap.submit_selection,
                COALESCE(
                    (
                        SELECT CASE 
                            WHEN bool_or(ers.status = 'started') THEN 'started'
                            WHEN bool_or(ers.status = 'paused') THEN 'paused'
                            WHEN count(*) > 0 AND bool_and(ers.status = 'ended') THEN 'ended'
                            ELSE ed.event_status
                        END
                        FROM event_runtime_sessions ers
                        WHERE ers.external_lead_id = COALESCE(el.external_id::text, el.lead_serial_number, at.external_lead_id)
                          AND ers.phase = CASE 
                              WHEN role_assignment.flow_stage ILIKE '%Pre-production%' THEN 'pre_production'
                              ELSE 'event'
                          END
                    ), 
                    ed.event_status, 
                    'not_started'
                ) AS event_status,
                ed.event_started_at,
                ed.event_paused_at,
                ed.event_ended_at,
                at.created_at
            FROM assign_teams at
            LEFT JOIN external_leads el
                ON at.external_lead_id = el.external_id::text
                OR at.external_lead_id = el.lead_serial_number
            LEFT JOIN event_details ed
                ON ed.external_lead_id = at.external_lead_id
                OR ed.external_lead_id = el.external_id::text
                OR ed.external_lead_id = el.lead_serial_number
            LEFT JOIN pre_production_shoots pps
                ON pps.external_lead_id = at.external_lead_id
                OR pps.external_lead_id = el.external_id::text
                OR pps.external_lead_id = el.lead_serial_number
            ${roleAssignmentsLateral}
            LEFT JOIN LATERAL (
                SELECT * FROM assigned_projects ap2
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
            WHERE role_assignment.is_assigned
            ORDER BY at.created_at DESC`,
            [empCodes, numericEmployeeId]
        );
    } catch (err) {
        console.error("Failed to fetch PreProduction projects:", err);
        throw err;
    }

    return preProjects.rows;
};

export const getMyWorkQuery = async (employeeId: number | string) => {
    await ensureEventUploadColumnsQuery();
    await ensureAssignmentAcceptanceColumnsQuery();
    const empCodes = getEmployeeCodeVariants(employeeId);
    const numericEmployeeId = getNumericEmployeeIdOrNull(employeeId);
    let preWork = { rows: [] as any[] };

    try {
        preWork = await pool.query(
            `SELECT
                CONCAT(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+', '-', 'g')) AS lead_employee_id,
                COALESCE(el.external_id::text, at.external_lead_id) AS lead_id,
                COALESCE(
                    el.lead_serial_number,
                    CASE WHEN el.external_id IS NOT NULL THEN CONCAT('EXT-', el.external_id::text) END,
                    at.external_lead_id
                ) AS lead_code,
                COALESCE(el.lead_name, ed.client_name, at.external_lead_id) AS client,
                COALESCE(el.event_type, ed.event_type) AS type,
                role_assignment.task_key,
                role_assignment.task_name AS name,
                role_assignment.flow_stage,
                role_assignment.request_source,
                role_assignment.stage_path,
                COALESCE(ed.priority_level, el.priority) AS priority,
                CASE WHEN role_assignment.flow_stage = 'Event' THEN at.event_assignment_date ELSE at.event_date END AS deadline,
                NULL AS estimated_duration,
                CASE WHEN role_assignment.flow_stage = 'Event' THEN COALESCE(at.event_assignment_location, ed.event_location, el.location) ELSE COALESCE(at.location, ed.event_location, el.location) END AS description,
                (
                    $2::int IS NOT NULL
                    AND COALESCE(at.accepted_assignments::text, '[]')::jsonb @> jsonb_build_array($2::text || ':' || role_assignment.task_key)
                ) AS accepted,
                role_assignment.upload_link,
                role_assignment.upload_notes,
                role_assignment.status,
                role_assignment.reupload_remarks,
                COALESCE(role_assignment.assigned_projects_admin_notes, role_assignment.reupload_remarks) AS admin_notes,
                ap.reference_link,
                ap.submit_selection,
                at.created_at,
                el.invoice_data
            FROM assign_teams at
            LEFT JOIN external_leads el
                ON at.external_lead_id = el.external_id::text
                OR at.external_lead_id = el.lead_serial_number
            LEFT JOIN event_details ed
                ON ed.external_lead_id = at.external_lead_id
                OR ed.external_lead_id = el.external_id::text
                OR ed.external_lead_id = el.lead_serial_number
            LEFT JOIN pre_production_shoots pps
                ON pps.external_lead_id = at.external_lead_id
                OR pps.external_lead_id = el.external_id::text
                OR pps.external_lead_id = el.lead_serial_number
            ${roleAssignmentsLateral}
            LEFT JOIN LATERAL (
                SELECT * FROM assigned_projects ap2
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
            WHERE role_assignment.is_assigned
            ORDER BY at.created_at DESC NULLS LAST, COALESCE(at.event_assignment_date, at.event_date) DESC NULLS LAST`,
            [empCodes, numericEmployeeId]
        );
    } catch (err) {
        console.error("Failed to fetch PreProduction work:", err);
        throw err;
    }

    return preWork.rows;
};

// Attendance: records + stats for an employee
export const getAttendanceQuery = async (employeeId: number | string) => {
    const numericId = toNumericEmployeeId(employeeId);
    const recordsResult = await pool.query(
        `SELECT
      attendance_id,
      date,
      check_in,
      check_out,
      status
    FROM employees_attendance
    WHERE employee_id = $1
    ORDER BY date DESC`,
        [numericId]
    );

    const statsResult = await pool.query(
        `SELECT
      COUNT(*) AS total_days,
      COUNT(*) FILTER (WHERE status = 'Present') AS present,
      COUNT(*) FILTER (WHERE status = 'Absent') AS absent
    FROM employees_attendance
    WHERE employee_id = $1`,
        [numericId]
    );

    const stats = statsResult.rows[0];
    const totalDays = parseInt(stats.total_days) || 0;
    const present = parseInt(stats.present) || 0;
    const absent = parseInt(stats.absent) || 0;
    const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    return {
        records: recordsResult.rows,
        stats: {
            totalDays,
            present,
            absent,
            percentage,
        },
    };
};

// Leave Requests: history for an employee
export const getLeaveRequestsQuery = async (employeeId: number | string) => {
    const empStr = String(employeeId);
    const empCode = empStr.startsWith('EMP-') ? empStr : `EMP-${empStr}`;
    const result = await pool.query(
        `SELECT
      leave_request_id,
      leave_type,
      from_date,
      to_date,
      no_of_days,
      status,
      reason,
      created_at
    FROM employee_leave_requests
    WHERE employee_id = $1
    ORDER BY created_at DESC`,
        [empCode]
    );
    return result.rows;
};

// Submit a new leave request
export const createLeaveRequestQuery = async (
    employeeId: number | string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    reason: string
) => {
    const empStr = String(employeeId);
    const empCode = empStr.startsWith('EMP-') ? empStr : `EMP-${empStr}`;
    const result = await pool.query(
        `INSERT INTO employee_leave_requests
      (employee_id, leave_type, from_date, to_date, no_of_days, status, reason, created_at)
    VALUES
      ($1, $2, $3, $4, ($4::date - $3::date + 1), 'Pending', $5, NOW())
    RETURNING *`,
        [empCode, leaveType, fromDate, toDate, reason]
    );
    return result.rows[0];
};

// Get today's attendance record for an employee
export const getTodayAttendanceQuery = async (employeeId: number | string) => {
    const numericId = toNumericEmployeeId(employeeId);
    const result = await pool.query(
        `SELECT attendance_id, date, check_in, check_out, status
         FROM employees_attendance
         WHERE employee_id = $1 AND date = CURRENT_DATE`,
        [numericId]
    );
    return result.rows[0] || null;
};

// Punch In: insert today's record with check_in time
export const punchInQuery = async (employeeId: number | string) => {
    const numericId = toNumericEmployeeId(employeeId);
    // Check if already punched in today
    const existing = await getTodayAttendanceQuery(employeeId);
    if (existing && existing.check_in) {
        // Already punched in — return existing record instead of erroring
        return existing;
    }
    if (existing) {
        // Row exists but no check_in — update it
        const result = await pool.query(
            `UPDATE employees_attendance
             SET check_in = NOW()
             WHERE attendance_id = $1
             RETURNING *`,
            [existing.attendance_id]
        );
        return result.rows[0];
    }
    // No record for today — insert new one
    try {
        const result = await pool.query(
            `INSERT INTO employees_attendance (employee_id, date, check_in, status)
             VALUES ($1, CURRENT_DATE, NOW(), 'Present')
             RETURNING *`,
            [numericId]
        );
        return result.rows[0];
    } catch (err: any) {
        // If 'Present' doesn't match enum, try other casings
        if (err.message?.includes('invalid input value for enum')) {
            const result = await pool.query(
                `INSERT INTO employees_attendance (employee_id, date, check_in, status)
                 VALUES ($1, CURRENT_DATE, NOW(), 'present')
                 RETURNING *`,
                [numericId]
            );
            return result.rows[0];
        }
        throw err;
    }
};

// Punch Out: update today's record with check_out time
export const punchOutQuery = async (employeeId: number | string) => {
    const numericId = toNumericEmployeeId(employeeId);
    const existing = await getTodayAttendanceQuery(employeeId);
    if (!existing || !existing.check_in) {
        throw new Error('You must punch in before punching out');
    }
    if (existing.check_out) {
        throw new Error('Already punched out today');
    }
    const result = await pool.query(
        `UPDATE employees_attendance
         SET check_out = NOW()
         WHERE employee_id = $1 AND date = CURRENT_DATE
         RETURNING *`,
        [numericId]
    );
    return result.rows[0];
};
