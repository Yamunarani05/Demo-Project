CREATE OR REPLACE VIEW public.lead_employee AS
 SELECT concat(at.id, '-', regexp_replace(lower(role_assignment.task_name), '[^a-z0-9]+'::text, '-'::text, 'g'::text)) AS lead_employee_id,
    COALESCE((el.external_id)::text, (at.external_lead_id)::text) AS lead_id,
    role_assignment.task_name,
    role_assignment.flow_stage,
    COALESCE(ed.priority_level, el.priority) AS priority,
        CASE
            WHEN (role_assignment.flow_stage = 'Event'::text) THEN at.event_assignment_date
            ELSE at.event_date
        END AS deadline,
    at.created_at,
    (regexp_replace((role_assignment.employee_id)::text, '\D'::text, ''::text, 'g'::text))::integer AS employee_id,
    emp.first_name AS employee_first_name,
    emp.last_name AS employee_last_name,
    ap.status,
    el.invoice_data
   FROM (((((public.assign_teams at
     LEFT JOIN public.external_leads el ON ((((at.external_lead_id)::text = (el.external_id)::text) OR ((at.external_lead_id)::text = (el.lead_serial_number)::text))))
     LEFT JOIN public.event_details ed ON ((((ed.external_lead_id)::text = (at.external_lead_id)::text) OR ((ed.external_lead_id)::text = (el.external_id)::text) OR ((ed.external_lead_id)::text = (el.lead_serial_number)::text))))
     CROSS JOIN LATERAL ( VALUES ('Pre-production Photography'::text,'Pre-production'::text,at.photographer), ((COALESCE(at.event_photographer_label, 'Event Photography'::character varying))::text,'Event'::text,at.event_photographer), ('Pre-production Videography'::text,'Pre-production'::text,at.videographer), ((COALESCE(at.event_videographer_label, 'Event Videography'::character varying))::text,'Event'::text,at.event_videographer), ('Pre-production Drone Coverage'::text,'Pre-production'::text,at.drone), ((COALESCE(at.event_drone_label, 'Event Drone Coverage'::character varying))::text,'Event'::text,at.event_drone), ('Save the Date Post'::text,'Pre-production Phase 2'::text,at.save_the_date), ('Save the Video'::text,'Pre-production Phase 2'::text,at.save_the_video), ('Retouch'::text,'Pre-production Phase 2'::text,at.retouch), ((COALESCE(at.event_secondary_photographer_label, 'Secondary Photography'::character varying))::text,'Event'::text,
                CASE
                    WHEN (jsonb_array_length(COALESCE(at.event_secondary_photographer, '[]'::jsonb)) > 0) THEN (at.event_secondary_photographer ->> 0)
                    ELSE NULL::text
                END), ((COALESCE(at.event_secondary_videographer_label, 'Secondary Videography'::character varying))::text,'Event'::text,
                CASE
                    WHEN (jsonb_array_length(COALESCE(at.event_secondary_videographer, '[]'::jsonb)) > 0) THEN (at.event_secondary_videographer ->> 0)
                    ELSE NULL::text
                END)) role_assignment(task_name, flow_stage, employee_id))
     LEFT JOIN public.employees emp ON (((emp.employee_id)::text = (role_assignment.employee_id)::text)))
     LEFT JOIN LATERAL ( SELECT ap2.status
           FROM public.assigned_projects ap2
          WHERE (((ap2.project_id)::text = concat('CRM-', COALESCE(el.lead_serial_number, ((el.external_id)::text)::character varying, at.external_lead_id))) AND (((role_assignment.task_name = 'Save the Date Post'::text) AND ((ap2.project_type)::text = ANY ((ARRAY['Save the Date Post'::character varying, 'Save the Date'::character varying, 'Save The Date Post'::character varying, 'Save The Date'::character varying])::text[]))) OR ((role_assignment.task_name = 'Save the Video'::text) AND ((ap2.project_type)::text = ANY ((ARRAY['Save the Date Video'::character varying, 'Save the Video'::character varying, 'Save The Date Video'::character varying, 'Save The Video'::character varying])::text[]))) OR ((role_assignment.task_name = 'Retouch'::text) AND ((ap2.project_type)::text = ANY ((ARRAY['Outdoor Retouch'::character varying, 'Retouch'::character varying, 'Retouching'::character varying])::text[])))))
          ORDER BY
                CASE
                    WHEN ((ap2.submit_selection IS NOT NULL) OR (ap2.reference_link IS NOT NULL)) THEN 1
                    ELSE 0
                END DESC, ap2.created_at DESC
         LIMIT 1) ap ON (true))
  WHERE ((role_assignment.employee_id IS NOT NULL) AND ((role_assignment.employee_id)::text <> ''::text));
