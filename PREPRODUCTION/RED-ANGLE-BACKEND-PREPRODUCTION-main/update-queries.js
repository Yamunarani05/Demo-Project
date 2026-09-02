const fs = require('fs');

const path = 'c:\\Users\\surya\\Downloads\\v5\\pre and post production\\RED-ANGLE-BACKEND-PREPRODUCTION\\src\\queries\\employee.queries.ts';
let code = fs.readFileSync(path, 'utf8');

const newRoleAssignmentsLateral = `const roleAssignmentsLateral = \`
    CROSS JOIN LATERAL (
        VALUES
            (
                'photography',
                'Pre-production Photography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Photographer',
                at.photographer = ANY($1::text[]),
                ed.drive_link,
                ed.upload_notes,
                CASE WHEN COALESCE(ed.drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.photo_reupload_remarks,
                NULL::text
            ),
            (
                'event-photography',
                'Event Photography',
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
                ed.video_drive_link,
                ed.video_upload_notes,
                CASE WHEN COALESCE(ed.video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                ed.video_reupload_remarks,
                NULL::text
            ),
            (
                'event-videography',
                'Event Videography',
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
                'Event Drone Coverage',
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
                COALESCE(at.secondary_photographer, '[]'::jsonb) ?| $1::text[],
                ed.drive_link,
                ed.upload_notes,
                CASE WHEN COALESCE(ed.drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                NULL,
                NULL::text
            ),
            (
                'event-secondary-photography',
                'Event Secondary Photography',
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Secondary Photographer',
                COALESCE(at.event_secondary_photographer, '[]'::jsonb) ?| $1::text[],
                ed.drive_link,
                ed.upload_notes,
                CASE WHEN COALESCE(ed.drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                NULL,
                NULL::text
            ),
            (
                'secondary-videography',
                'Pre-production Secondary Videography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Secondary Videographer',
                COALESCE(at.secondary_videographer, '[]'::jsonb) ?| $1::text[],
                ed.video_drive_link,
                ed.video_upload_notes,
                CASE WHEN COALESCE(ed.video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                NULL,
                NULL::text
            ),
            (
                'event-secondary-videography',
                'Event Secondary Videography',
                'Event',
                'Event Coordinator',
                'Event -> Event Coordinator -> Secondary Videographer',
                COALESCE(at.event_secondary_videographer, '[]'::jsonb) ?| $1::text[],
                ed.video_drive_link,
                ed.video_upload_notes,
                CASE WHEN COALESCE(ed.video_drive_link, '') != '' THEN 'Submitted' ELSE NULL END,
                NULL,
                NULL::text
            ),
            (
                'secondary-drone-coverage',
                'Pre-production Secondary Drone Coverage',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Secondary Drone',
                COALESCE(at.secondary_drone, '[]'::jsonb) ?| $1::text[],
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
                COALESCE(at.event_secondary_drone, '[]'::jsonb) ?| $1::text[],
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
\`;`;

const startIndex = code.indexOf('const roleAssignmentsLateral = `');
const endIndex = code.indexOf('`;', startIndex) + 2;

code = code.substring(0, startIndex) + newRoleAssignmentsLateral + code.substring(endIndex);

fs.writeFileSync(path, code);
console.log('Updated roleAssignmentsLateral successfully.');
