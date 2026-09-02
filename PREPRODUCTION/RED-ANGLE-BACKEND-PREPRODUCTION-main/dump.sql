--
-- PostgreSQL database dump
--

\restrict HKpMth9R8iQ1XCxT2AdZ5NB2fo0HRcjCpHY8hshXmLeap6tgPAhgX1L3xlf0VRp

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approved_drive_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approved_drive_links (
    id integer NOT NULL,
    project_id character varying(100) NOT NULL,
    project_name character varying(255),
    project_type character varying(100) NOT NULL,
    employee_id character varying(100),
    upload_link text NOT NULL,
    admin_notes text,
    approved_by character varying(100),
    sent_to_client boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: approved_drive_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approved_drive_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approved_drive_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approved_drive_links_id_seq OWNED BY public.approved_drive_links.id;


--
-- Name: assign_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assign_teams (
    id integer NOT NULL,
    external_lead_id character varying(100) NOT NULL,
    photographer character varying(100),
    videographer character varying(100),
    drone character varying(100),
    save_the_date character varying(100),
    save_the_video character varying(100),
    retouch character varying(100),
    assistant character varying(100),
    editor character varying(100),
    secondary_photographer jsonb DEFAULT '[]'::jsonb,
    secondary_videographer jsonb DEFAULT '[]'::jsonb,
    secondary_drone jsonb DEFAULT '[]'::jsonb,
    event_photographer character varying(100),
    event_videographer character varying(100),
    event_drone character varying(100),
    event_secondary_photographer jsonb DEFAULT '[]'::jsonb,
    event_secondary_videographer jsonb DEFAULT '[]'::jsonb,
    event_secondary_drone jsonb DEFAULT '[]'::jsonb,
    event_additional_staff jsonb DEFAULT '[]'::jsonb,
    event_assignment_date date,
    event_assignment_time time without time zone,
    event_assignment_location text,
    additional_staff jsonb DEFAULT '[]'::jsonb,
    event_date date,
    event_time time without time zone,
    location text,
    accepted_by_employees jsonb DEFAULT '[]'::jsonb,
    accepted_assignments jsonb DEFAULT '[]'::jsonb,
    shoot_locations jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    accepted boolean DEFAULT false,
    file_path text,
    event_traditional_photographer character varying(255),
    event_candid_photographer character varying(255),
    event_traditional_videographer character varying(255),
    event_candid_videographer character varying(255),
    event_photographer_label character varying(255),
    event_videographer_label character varying(255),
    event_drone_label character varying(255),
    event_secondary_photographer_label character varying(255),
    event_secondary_videographer_label character varying(255),
    event_secondary_drone_label character varying(255)
);


--
-- Name: assign_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assign_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assign_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assign_teams_id_seq OWNED BY public.assign_teams.id;


--
-- Name: assigned_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assigned_projects (
    id integer NOT NULL,
    project_id character varying(100) NOT NULL,
    project_name character varying(255) NOT NULL,
    project_type character varying(100),
    employee_id character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    upload_link text,
    admin_notes text,
    reference_link text,
    submit_selection text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    upload_notes text,
    task_count integer
);


--
-- Name: assigned_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assigned_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assigned_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assigned_projects_id_seq OWNED BY public.assigned_projects.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    employee_id character varying(50) NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    login_time time without time zone,
    logout_time time without time zone,
    status character varying(20) DEFAULT 'Present'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: client_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_deliveries (
    id integer NOT NULL,
    lead_id integer NOT NULL,
    delivery_type character varying(50) NOT NULL,
    drive_link text,
    video_drive_link text,
    drone_photo_drive_link text,
    drone_video_drive_link text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    query_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    magazine_drive_link character varying(500),
    frame_drive_link character varying(500),
    approved_links json
);


--
-- Name: client_deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_deliveries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_deliveries_id_seq OWNED BY public.client_deliveries.id;


--
-- Name: creative_confirmations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creative_confirmations (
    id integer NOT NULL,
    external_lead_id character varying(100) NOT NULL,
    costume_type character varying(255),
    color_preferences jsonb DEFAULT '[]'::jsonb,
    costume_requirements text,
    event_theme character varying(255),
    mood_description text,
    reference_images jsonb DEFAULT '[]'::jsonb,
    base64_images jsonb DEFAULT '[]'::jsonb,
    location_name character varying(255),
    location_type character varying(100),
    google_map_link text,
    client_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: creative_confirmations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.creative_confirmations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: creative_confirmations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.creative_confirmations_id_seq OWNED BY public.creative_confirmations.id;


--
-- Name: creative_plannings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.creative_plannings (
    id integer NOT NULL,
    external_lead_id character varying(100) NOT NULL,
    event_list jsonb,
    equipment_required jsonb,
    lighting_setup jsonb,
    props_required jsonb,
    special_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: creative_plannings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.creative_plannings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: creative_plannings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.creative_plannings_id_seq OWNED BY public.creative_plannings.id;


--
-- Name: crm_final_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_final_approvals (
    id integer NOT NULL,
    project_id character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    checked_items integer[] DEFAULT '{}'::integer[],
    rework_notes text,
    review_status character varying(50) DEFAULT 'pending_review'::character varying,
    change_source character varying(20),
    change_notes text,
    assigned_to character varying(255),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: crm_final_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.crm_final_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: crm_final_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.crm_final_approvals_id_seq OWNED BY public.crm_final_approvals.id;


--
-- Name: employee_leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_leave_requests (
    leave_request_id integer NOT NULL,
    employee_id character varying(50) NOT NULL,
    leave_type character varying(50) NOT NULL,
    from_date date NOT NULL,
    to_date date NOT NULL,
    no_of_days integer,
    status character varying(20) DEFAULT 'Pending'::character varying,
    reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: employee_leave_requests_leave_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_leave_requests_leave_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_leave_requests_leave_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_leave_requests_leave_request_id_seq OWNED BY public.employee_leave_requests.leave_request_id;


--
-- Name: employee_work_runtime_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_work_runtime_sessions (
    id integer NOT NULL,
    assigned_project_id integer NOT NULL,
    project_id character varying(100) NOT NULL,
    employee_id character varying(100) NOT NULL,
    project_type character varying(100),
    work_date date NOT NULL,
    status character varying(20) DEFAULT 'not_started'::character varying NOT NULL,
    started_at timestamp without time zone,
    paused_at timestamp without time zone,
    ended_at timestamp without time zone,
    accumulated_seconds integer DEFAULT 0 NOT NULL,
    started_by character varying(100),
    ended_by character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: employee_work_runtime_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_work_runtime_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_work_runtime_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_work_runtime_sessions_id_seq OWNED BY public.employee_work_runtime_sessions.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    employee_id character varying(50),
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    contact_number character varying(50),
    dob date,
    address text,
    work_location character varying(255),
    role character varying(500),
    roles text[] DEFAULT '{}'::text[],
    experience character varying(100),
    date_of_join date,
    description text,
    created_by character varying(100),
    profile_image text,
    identity_document text,
    status character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    employee_code character varying(100)
);


--
-- Name: employees_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees_attendance (
    attendance_id integer NOT NULL,
    employee_id integer NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    check_in timestamp without time zone,
    check_out timestamp without time zone,
    status character varying(20) DEFAULT 'Present'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: employees_attendance_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_attendance_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_attendance_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_attendance_attendance_id_seq OWNED BY public.employees_attendance.attendance_id;


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: event_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_details (
    id integer NOT NULL,
    external_lead_id character varying(100) NOT NULL,
    client_name character varying(255),
    email character varying(255),
    phone character varying(50),
    contact_person_name character varying(255),
    contact_person_number character varying(50),
    event_type character varying(255),
    event_location text,
    preferred_date date,
    preferred_time time without time zone,
    budget_range character varying(255),
    services text,
    deliverables text,
    invoice_attached text,
    meeting_type character varying(100),
    meeting_details text,
    client_requirements text,
    priority_level character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    drive_link text,
    video_drive_link text,
    drone_photo_drive_link text,
    drone_video_drive_link text,
    drone_camera_used text,
    drone_video_camera_used text,
    drone_num_images integer,
    drone_num_videos integer,
    drone_upload_notes text,
    drone_video_upload_notes text,
    save_the_date_drive_link text,
    save_the_date_upload_notes text,
    save_the_date_submission_status character varying(50),
    save_the_video_drive_link text,
    save_the_video_upload_notes text,
    save_the_video_submission_status character varying(50),
    retouch_drive_link text,
    retouch_upload_notes text,
    retouch_submission_status character varying(50),
    photo_delivery_method character varying(20),
    photo_hard_disk_delivery_date date,
    photo_hard_disk_received boolean DEFAULT false,
    photo_upload_phase character varying(30),
    video_delivery_method character varying(20),
    video_hard_disk_delivery_date date,
    video_hard_disk_received boolean DEFAULT false,
    video_upload_phase character varying(30),
    drone_delivery_method character varying(20),
    drone_hard_disk_delivery_date date,
    drone_hard_disk_received boolean DEFAULT false,
    drone_upload_phase character varying(30),
    media_status character varying(50) DEFAULT 'Pending'::character varying,
    event_status character varying(20) DEFAULT 'not_started'::character varying,
    event_started_at timestamp without time zone,
    event_paused_at timestamp without time zone,
    event_ended_at timestamp without time zone,
    event_started_by character varying(100),
    video_camera_used text,
    num_images integer DEFAULT 0,
    num_videos integer DEFAULT 0,
    upload_notes text,
    video_upload_notes text,
    camera_used character varying(255),
    cr3_other_reason text,
    first_clip_base64 text,
    last_clip_base64 text,
    video_included_file_format character varying(50),
    invitation_upload text,
    event_service_details jsonb,
    save_the_date_reupload_remarks text,
    save_the_video_reupload_remarks text,
    retouch_reupload_remarks text,
    photo_approved boolean DEFAULT false,
    video_approved boolean DEFAULT false,
    event_photo_approved boolean DEFAULT false,
    event_video_approved boolean DEFAULT false,
    drone_approved boolean DEFAULT false,
    verification_draft jsonb,
    event_verification_draft jsonb,
    photo_reupload_remarks text,
    video_reupload_remarks text,
    drone_reupload_remarks text,
    cr3_mode character varying(50),
    post_production_priority character varying(50),
    traditional_photo_drive_link text,
    candid_photo_drive_link text,
    traditional_video_drive_link text,
    candid_video_drive_link text,
    secondary_photo_drive_link text,
    secondary_photo_upload_notes text,
    secondary_video_drive_link text,
    secondary_video_upload_notes text,
    secondary_photo_approved boolean DEFAULT false,
    secondary_video_approved boolean DEFAULT false,
    secondary_photo_reupload_remarks text,
    secondary_video_reupload_remarks text,
    secondary_photo_submission_status character varying(50),
    secondary_video_submission_status character varying(50)
);


--
-- Name: event_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_details_id_seq OWNED BY public.event_details.id;


--
-- Name: event_media_clips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_media_clips (
    external_lead_id character varying(100) NOT NULL,
    photo_first_clip text,
    photo_last_clip text,
    video_first_clip text,
    video_last_clip text,
    drone_first_clip text,
    drone_last_clip text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    secondary_photo_first_clip text,
    secondary_photo_last_clip text,
    secondary_video_first_clip text,
    secondary_video_last_clip text
);


--
-- Name: event_runtime_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_runtime_sessions (
    id integer NOT NULL,
    external_lead_id character varying(100) NOT NULL,
    work_date date NOT NULL,
    status character varying(20) DEFAULT 'not_started'::character varying NOT NULL,
    started_at timestamp without time zone,
    paused_at timestamp without time zone,
    ended_at timestamp without time zone,
    accumulated_seconds integer DEFAULT 0 NOT NULL,
    started_by character varying(100),
    ended_by character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    phase character varying(32) DEFAULT 'event'::character varying NOT NULL
);


--
-- Name: event_runtime_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_runtime_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_runtime_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_runtime_sessions_id_seq OWNED BY public.event_runtime_sessions.id;


--
-- Name: external_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_leads (
    id integer NOT NULL,
    external_id character varying(100) NOT NULL,
    lead_serial_number character varying(100),
    lead_name character varying(255),
    email character varying(255),
    phone character varying(50),
    location character varying(255),
    event_type character varying(100),
    event_date date,
    priority character varying(50),
    invoice_id integer,
    discount numeric,
    invoice_total numeric,
    invoice_paid numeric,
    invoice_balance numeric,
    invoice_data jsonb,
    status character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    flow_type character varying(20),
    current_phase character varying(30) DEFAULT 'not_started'::character varying,
    phase_status character varying(20) DEFAULT 'not_started'::character varying,
    phase_owner character varying(30),
    pre_production_step character varying(20) DEFAULT 'shoot'::character varying,
    preproduction_data jsonb,
    assigned_post_prod_crm_id character varying(100)
);


--
-- Name: external_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.external_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: external_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.external_leads_id_seq OWNED BY public.external_leads.id;


--
-- Name: hard_disk_closures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hard_disk_closures (
    id integer NOT NULL,
    external_lead_id character varying(100),
    handover_disk_number character varying(100),
    handover_disk_label character varying(100),
    handover_date date,
    handover_person character varying(100),
    handover_notes text,
    receive_disk_number character varying(100),
    receive_disk_label character varying(100),
    receive_date date,
    receive_person character varying(100),
    receive_notes text,
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: hard_disk_closures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hard_disk_closures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hard_disk_closures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hard_disk_closures_id_seq OWNED BY public.hard_disk_closures.id;


--
-- Name: lead_employee; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.lead_employee AS
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


--
-- Name: lead_tracking_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_tracking_stages (
    external_lead_id character varying(100) NOT NULL,
    stage_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    detail text,
    lead_id character varying(100),
    from_role character varying(100),
    from_name character varying(255),
    target_roles text[] DEFAULT '{}'::text[],
    issue_type character varying(100),
    target_employee_id character varying(50),
    source_stage character varying(30),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    notification_id integer
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_otps (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    otp_code character varying(6) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false
);


--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_otps_id_seq OWNED BY public.password_reset_otps.id;


--
-- Name: photo_upload; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photo_upload (
    id integer NOT NULL,
    external_lead_id character varying(100),
    client_name character varying(255),
    event_type character varying(100),
    drive_link text,
    camera_used character varying(255),
    num_images integer,
    upload_notes text,
    uploaded_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: photo_upload_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.photo_upload_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: photo_upload_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.photo_upload_id_seq OWNED BY public.photo_upload.id;


--
-- Name: pixoffice_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pixoffice_entries (
    id integer NOT NULL,
    external_lead_id character varying(100),
    event_name character varying(100) NOT NULL,
    sub_category character varying(100),
    services jsonb,
    file_size character varying(50),
    storage_path character varying(255),
    qc_status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pixoffice_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pixoffice_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pixoffice_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pixoffice_entries_id_seq OWNED BY public.pixoffice_entries.id;


--
-- Name: pixstudio_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pixstudio_entries (
    id integer NOT NULL,
    external_lead_id character varying(100),
    event_name character varying(100) NOT NULL,
    sub_category character varying(100),
    services jsonb,
    file_size character varying(50),
    storage_path character varying(255),
    qc_status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: pixstudio_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pixstudio_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pixstudio_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pixstudio_entries_id_seq OWNED BY public.pixstudio_entries.id;


--
-- Name: pre_production_shoots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pre_production_shoots (
    external_lead_id character varying(100) NOT NULL,
    drive_link text,
    num_images integer DEFAULT 0,
    camera_used character varying(255),
    upload_notes text,
    photo_first_clip text,
    photo_last_clip text,
    photo_delivery_method character varying(20),
    photo_hard_disk_delivery_date date,
    photo_hard_disk_received boolean DEFAULT false,
    photo_approved boolean DEFAULT false,
    video_drive_link text,
    num_videos integer DEFAULT 0,
    video_camera_used text,
    video_upload_notes text,
    video_included_file_format character varying(50),
    video_first_clip text,
    video_last_clip text,
    video_delivery_method character varying(20),
    video_hard_disk_delivery_date date,
    video_hard_disk_received boolean DEFAULT false,
    video_approved boolean DEFAULT false,
    media_status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    photo_reupload_remarks text,
    video_reupload_remarks text,
    verification_draft jsonb
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(100),
    roles text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    employee_id integer
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: approved_drive_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approved_drive_links ALTER COLUMN id SET DEFAULT nextval('public.approved_drive_links_id_seq'::regclass);


--
-- Name: assign_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assign_teams ALTER COLUMN id SET DEFAULT nextval('public.assign_teams_id_seq'::regclass);


--
-- Name: assigned_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_projects ALTER COLUMN id SET DEFAULT nextval('public.assigned_projects_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: client_deliveries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_deliveries ALTER COLUMN id SET DEFAULT nextval('public.client_deliveries_id_seq'::regclass);


--
-- Name: creative_confirmations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_confirmations ALTER COLUMN id SET DEFAULT nextval('public.creative_confirmations_id_seq'::regclass);


--
-- Name: creative_plannings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_plannings ALTER COLUMN id SET DEFAULT nextval('public.creative_plannings_id_seq'::regclass);


--
-- Name: crm_final_approvals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_final_approvals ALTER COLUMN id SET DEFAULT nextval('public.crm_final_approvals_id_seq'::regclass);


--
-- Name: employee_leave_requests leave_request_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_requests ALTER COLUMN leave_request_id SET DEFAULT nextval('public.employee_leave_requests_leave_request_id_seq'::regclass);


--
-- Name: employee_work_runtime_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_work_runtime_sessions ALTER COLUMN id SET DEFAULT nextval('public.employee_work_runtime_sessions_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: employees_attendance attendance_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees_attendance ALTER COLUMN attendance_id SET DEFAULT nextval('public.employees_attendance_attendance_id_seq'::regclass);


--
-- Name: event_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_details ALTER COLUMN id SET DEFAULT nextval('public.event_details_id_seq'::regclass);


--
-- Name: event_runtime_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_runtime_sessions ALTER COLUMN id SET DEFAULT nextval('public.event_runtime_sessions_id_seq'::regclass);


--
-- Name: external_leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_leads ALTER COLUMN id SET DEFAULT nextval('public.external_leads_id_seq'::regclass);


--
-- Name: hard_disk_closures id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hard_disk_closures ALTER COLUMN id SET DEFAULT nextval('public.hard_disk_closures_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_otps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_otps ALTER COLUMN id SET DEFAULT nextval('public.password_reset_otps_id_seq'::regclass);


--
-- Name: photo_upload id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_upload ALTER COLUMN id SET DEFAULT nextval('public.photo_upload_id_seq'::regclass);


--
-- Name: pixoffice_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pixoffice_entries ALTER COLUMN id SET DEFAULT nextval('public.pixoffice_entries_id_seq'::regclass);


--
-- Name: pixstudio_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pixstudio_entries ALTER COLUMN id SET DEFAULT nextval('public.pixstudio_entries_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: approved_drive_links approved_drive_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approved_drive_links
    ADD CONSTRAINT approved_drive_links_pkey PRIMARY KEY (id);


--
-- Name: assign_teams assign_teams_external_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assign_teams
    ADD CONSTRAINT assign_teams_external_lead_id_key UNIQUE (external_lead_id);


--
-- Name: assign_teams assign_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assign_teams
    ADD CONSTRAINT assign_teams_pkey PRIMARY KEY (id);


--
-- Name: assigned_projects assigned_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_projects
    ADD CONSTRAINT assigned_projects_pkey PRIMARY KEY (id);


--
-- Name: assigned_projects assigned_projects_unique_assignment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_projects
    ADD CONSTRAINT assigned_projects_unique_assignment UNIQUE (project_id, employee_id, project_type);


--
-- Name: attendance attendance_employee_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: client_deliveries client_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_deliveries
    ADD CONSTRAINT client_deliveries_pkey PRIMARY KEY (id);


--
-- Name: creative_confirmations creative_confirmations_external_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_confirmations
    ADD CONSTRAINT creative_confirmations_external_lead_id_key UNIQUE (external_lead_id);


--
-- Name: creative_confirmations creative_confirmations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_confirmations
    ADD CONSTRAINT creative_confirmations_pkey PRIMARY KEY (id);


--
-- Name: creative_plannings creative_plannings_external_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_plannings
    ADD CONSTRAINT creative_plannings_external_lead_id_key UNIQUE (external_lead_id);


--
-- Name: creative_plannings creative_plannings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.creative_plannings
    ADD CONSTRAINT creative_plannings_pkey PRIMARY KEY (id);


--
-- Name: crm_final_approvals crm_final_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_final_approvals
    ADD CONSTRAINT crm_final_approvals_pkey PRIMARY KEY (id);


--
-- Name: crm_final_approvals crm_final_approvals_project_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_final_approvals
    ADD CONSTRAINT crm_final_approvals_project_id_key UNIQUE (project_id);


--
-- Name: employee_leave_requests employee_leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_leave_requests
    ADD CONSTRAINT employee_leave_requests_pkey PRIMARY KEY (leave_request_id);


--
-- Name: employee_work_runtime_sessions employee_work_runtime_session_assigned_project_id_work_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_work_runtime_sessions
    ADD CONSTRAINT employee_work_runtime_session_assigned_project_id_work_date_key UNIQUE (assigned_project_id, work_date);


--
-- Name: employee_work_runtime_sessions employee_work_runtime_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_work_runtime_sessions
    ADD CONSTRAINT employee_work_runtime_sessions_pkey PRIMARY KEY (id);


--
-- Name: employees_attendance employees_attendance_employee_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees_attendance
    ADD CONSTRAINT employees_attendance_employee_id_date_key UNIQUE (employee_id, date);


--
-- Name: employees_attendance employees_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees_attendance
    ADD CONSTRAINT employees_attendance_pkey PRIMARY KEY (attendance_id);


--
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- Name: employees employees_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_id_key UNIQUE (employee_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: event_details event_details_external_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT event_details_external_lead_id_key UNIQUE (external_lead_id);


--
-- Name: event_details event_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT event_details_pkey PRIMARY KEY (id);


--
-- Name: event_media_clips event_media_clips_external_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_media_clips
    ADD CONSTRAINT event_media_clips_external_lead_id_key UNIQUE (external_lead_id);


--
-- Name: event_runtime_sessions event_runtime_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_runtime_sessions
    ADD CONSTRAINT event_runtime_sessions_pkey PRIMARY KEY (id);


--
-- Name: external_leads external_leads_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_leads
    ADD CONSTRAINT external_leads_external_id_key UNIQUE (external_id);


--
-- Name: external_leads external_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_leads
    ADD CONSTRAINT external_leads_pkey PRIMARY KEY (id);


--
-- Name: hard_disk_closures hard_disk_closures_external_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hard_disk_closures
    ADD CONSTRAINT hard_disk_closures_external_lead_id_key UNIQUE (external_lead_id);


--
-- Name: hard_disk_closures hard_disk_closures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hard_disk_closures
    ADD CONSTRAINT hard_disk_closures_pkey PRIMARY KEY (id);


--
-- Name: lead_tracking_stages lead_tracking_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_tracking_stages
    ADD CONSTRAINT lead_tracking_stages_pkey PRIMARY KEY (external_lead_id, stage_name);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_otps password_reset_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_otps
    ADD CONSTRAINT password_reset_otps_pkey PRIMARY KEY (id);


--
-- Name: photo_upload photo_upload_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo_upload
    ADD CONSTRAINT photo_upload_pkey PRIMARY KEY (id);


--
-- Name: pixoffice_entries pixoffice_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pixoffice_entries
    ADD CONSTRAINT pixoffice_entries_pkey PRIMARY KEY (id);


--
-- Name: pixstudio_entries pixstudio_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pixstudio_entries
    ADD CONSTRAINT pixstudio_entries_pkey PRIMARY KEY (id);


--
-- Name: pre_production_shoots pre_production_shoots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pre_production_shoots
    ADD CONSTRAINT pre_production_shoots_pkey PRIMARY KEY (external_lead_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: event_runtime_sessions_lead_phase_date_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX event_runtime_sessions_lead_phase_date_uniq ON public.event_runtime_sessions USING btree (external_lead_id, phase, work_date);


--
-- Name: idx_notifications_source_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_source_stage ON public.notifications USING btree (source_stage);


--
-- Name: idx_notifications_target_employee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_target_employee ON public.notifications USING btree (target_employee_id);


--
-- Name: idx_notifications_target_roles; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_target_roles ON public.notifications USING gin (target_roles);


--
-- Name: attendance attendance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict HKpMth9R8iQ1XCxT2AdZ5NB2fo0HRcjCpHY8hshXmLeap6tgPAhgX1L3xlf0VRp

