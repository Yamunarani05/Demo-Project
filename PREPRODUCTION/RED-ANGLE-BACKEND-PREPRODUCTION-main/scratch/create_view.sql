
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

    CROSS JOIN LATERAL (
        VALUES
            (
                'photography',
                'Pre-production Photography',
                'Pre-production',
                'Pre-production Coordinator',
                'Pre-production -> Pre-production Coordinator -> Photographer',
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
                true,
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
 role_assignment
WHERE role_assignment.employee_id IS NOT NULL;
