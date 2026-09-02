-- Run this script on your production database to add missing columns

-- Missing columns for approved_drive_links
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS project_name character varying(255);
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS project_type character varying(100) NOT NULL;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS employee_id character varying(100);
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS upload_link text NOT NULL;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS approved_by character varying(100);
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS sent_to_client boolean DEFAULT false;
ALTER TABLE approved_drive_links ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

-- Missing columns for assign_teams
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS photographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS videographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS drone character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS save_the_date character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS save_the_video character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS retouch character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS assistant character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS editor character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS secondary_photographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS secondary_videographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS secondary_drone jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_photographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_videographer character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_drone character varying(100);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_photographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_videographer jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_drone jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_additional_staff jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_assignment_date date;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_assignment_time time without time zone;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_assignment_location text;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS additional_staff jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_time time without time zone;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS accepted_by_employees jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS accepted_assignments jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS shoot_locations jsonb DEFAULT '[]'::jsonb;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS accepted boolean DEFAULT false;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_traditional_photographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_candid_photographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_traditional_videographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_candid_videographer character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_photographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_videographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_drone_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_photographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_videographer_label character varying(255);
ALTER TABLE assign_teams ADD COLUMN IF NOT EXISTS event_secondary_drone_label character varying(255);

-- Missing columns for assigned_projects
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS project_name character varying(255) NOT NULL;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS project_type character varying(100);
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS employee_id character varying(100) NOT NULL;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS upload_link text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS reference_link text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS submit_selection text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE assigned_projects ADD COLUMN IF NOT EXISTS task_count integer;

-- Missing columns for attendance
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS date date DEFAULT CURRENT_DATE NOT NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS login_time time without time zone;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS logout_time time without time zone;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'Present'::character varying;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for client_deliveries
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS video_drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS drone_photo_drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS drone_video_drive_link text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'pending'::character varying NOT NULL;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS query_count integer DEFAULT 0 NOT NULL;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS magazine_drive_link character varying(500);
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS frame_drive_link character varying(500);
ALTER TABLE client_deliveries ADD COLUMN IF NOT EXISTS approved_links json;

-- Missing columns for creative_confirmations
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS costume_type character varying(255);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS color_preferences jsonb DEFAULT '[]'::jsonb;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS costume_requirements text;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS event_theme character varying(255);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS mood_description text;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS reference_images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS base64_images jsonb DEFAULT '[]'::jsonb;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS location_name character varying(255);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS location_type character varying(100);
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS google_map_link text;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS client_approved boolean DEFAULT false;
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE creative_confirmations ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for creative_plannings
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS event_list jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS equipment_required jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS lighting_setup jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS props_required jsonb;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS special_notes text;
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE creative_plannings ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for crm_final_approvals
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS approved_at timestamp without time zone;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS checked_items integer[] DEFAULT '{}'::integer[];
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS rework_notes text;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS review_status character varying(50) DEFAULT 'pending_review'::character varying;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS change_source character varying(20);
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS change_notes text;
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS assigned_to character varying(255);
ALTER TABLE crm_final_approvals ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for employee_leave_requests
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS leave_type character varying(50) NOT NULL;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS from_date date NOT NULL;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS to_date date NOT NULL;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS no_of_days integer;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'Pending'::character varying;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employee_leave_requests ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for employee_work_runtime_sessions
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS employee_id character varying(100) NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS project_type character varying(100);
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS work_date date NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'not_started'::character varying NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS started_at timestamp without time zone;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS paused_at timestamp without time zone;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS ended_at timestamp without time zone;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS accumulated_seconds integer DEFAULT 0 NOT NULL;
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS started_by character varying(100);
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS ended_by character varying(100);
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employee_work_runtime_sessions ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email character varying(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contact_number character varying(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS dob date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS work_location character varying(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role character varying(500);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}'::text[];
ALTER TABLE employees ADD COLUMN IF NOT EXISTS experience character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_join date;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_by character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS identity_document text;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS status character varying(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code character varying(100);

-- Missing columns for employees_attendance
ALTER TABLE employees_attendance ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE employees_attendance ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();

-- Missing columns for event_details
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS client_name character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS email character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS phone character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS contact_person_name character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS contact_person_number character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_type character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_location text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS preferred_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS preferred_time time without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS budget_range character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS services text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS deliverables text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS invoice_attached text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS meeting_type character varying(100);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS meeting_details text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS client_requirements text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS priority_level character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_camera_used text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_video_camera_used text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_num_images integer;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_num_videos integer;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_delivery_method character varying(20);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_hard_disk_delivery_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_hard_disk_received boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_upload_phase character varying(30);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_delivery_method character varying(20);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_hard_disk_delivery_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_hard_disk_received boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_upload_phase character varying(30);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_delivery_method character varying(20);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_hard_disk_delivery_date date;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_hard_disk_received boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_upload_phase character varying(30);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS media_status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_status character varying(20) DEFAULT 'not_started'::character varying;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_started_at timestamp without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_paused_at timestamp without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_ended_at timestamp without time zone;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_started_by character varying(100);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_camera_used text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS num_images integer DEFAULT 0;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS num_videos integer DEFAULT 0;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS camera_used character varying(255);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS cr3_other_reason text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS first_clip_base64 text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS last_clip_base64 text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_included_file_format character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS invitation_upload text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_service_details jsonb;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_date_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS save_the_video_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS retouch_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_photo_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_video_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS verification_draft jsonb;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS event_verification_draft jsonb;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS photo_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS video_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS drone_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS cr3_mode character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS post_production_priority character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS traditional_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS candid_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS traditional_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS candid_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_drive_link text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_upload_notes text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_approved boolean DEFAULT false;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_reupload_remarks text;
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_photo_submission_status character varying(50);
ALTER TABLE event_details ADD COLUMN IF NOT EXISTS secondary_video_submission_status character varying(50);

-- Missing columns for event_media_clips
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS photo_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS photo_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS video_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS video_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS drone_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS drone_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_photo_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_photo_last_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_video_first_clip text;
ALTER TABLE event_media_clips ADD COLUMN IF NOT EXISTS secondary_video_last_clip text;

-- Missing columns for event_runtime_sessions
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS work_date date NOT NULL;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'not_started'::character varying NOT NULL;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS started_at timestamp without time zone;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS paused_at timestamp without time zone;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS ended_at timestamp without time zone;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS accumulated_seconds integer DEFAULT 0 NOT NULL;
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS started_by character varying(100);
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS ended_by character varying(100);
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE event_runtime_sessions ADD COLUMN IF NOT EXISTS phase character varying(32) DEFAULT 'event'::character varying NOT NULL;

-- Missing columns for external_leads
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS lead_serial_number character varying(100);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS lead_name character varying(255);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS email character varying(255);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phone character varying(50);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS location character varying(255);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS event_type character varying(100);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS priority character varying(50);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_id integer;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS discount numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_total numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_paid numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_balance numeric;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS invoice_data jsonb;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS status character varying(50);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS flow_type character varying(20);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS current_phase character varying(30) DEFAULT 'not_started'::character varying;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phase_status character varying(20) DEFAULT 'not_started'::character varying;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS phase_owner character varying(30);
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS pre_production_step character varying(20) DEFAULT 'shoot'::character varying;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS preproduction_data jsonb;
ALTER TABLE external_leads ADD COLUMN IF NOT EXISTS assigned_post_prod_crm_id character varying(100);

-- Missing columns for hard_disk_closures
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_disk_number character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_disk_label character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_date date;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_person character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS handover_notes text;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_disk_number character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_disk_label character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_date date;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_person character varying(100);
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS receive_notes text;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE hard_disk_closures ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for lead_tracking_stages
ALTER TABLE lead_tracking_stages ADD COLUMN IF NOT EXISTS stage_name character varying(100) NOT NULL;
ALTER TABLE lead_tracking_stages ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

-- Missing columns for notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title character varying(255) NOT NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS detail text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS lead_id character varying(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_role character varying(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_name character varying(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_roles text[] DEFAULT '{}'::text[];
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS issue_type character varying(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_employee_id character varying(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_stage character varying(30);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();

-- Missing columns for password_reset_otps
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS otp_code character varying(6) NOT NULL;
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS expires_at timestamp without time zone NOT NULL;
ALTER TABLE password_reset_otps ADD COLUMN IF NOT EXISTS is_used boolean DEFAULT false;

-- Missing columns for photo_upload
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS client_name character varying(255);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS event_type character varying(100);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS camera_used character varying(255);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS num_images integer;
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS uploaded_by character varying(100);
ALTER TABLE photo_upload ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for pixoffice_entries
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS sub_category character varying(100);
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS services jsonb;
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS file_size character varying(50);
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS storage_path character varying(255);
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS qc_status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE pixoffice_entries ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for pixstudio_entries
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS event_name character varying(100) NOT NULL;
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS sub_category character varying(100);
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS services jsonb;
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS file_size character varying(50);
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS storage_path character varying(255);
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS qc_status character varying(50) DEFAULT 'Pending'::character varying;
ALTER TABLE pixstudio_entries ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- Missing columns for pre_production_shoots
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS drive_link text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS num_images integer DEFAULT 0;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS camera_used character varying(255);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS upload_notes text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_first_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_last_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_delivery_method character varying(20);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_hard_disk_delivery_date date;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_hard_disk_received boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_approved boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_drive_link text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS num_videos integer DEFAULT 0;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_camera_used text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_upload_notes text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_included_file_format character varying(50);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_first_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_last_clip text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_delivery_method character varying(20);
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_hard_disk_delivery_date date;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_hard_disk_received boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_approved boolean DEFAULT false;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS media_status character varying(20) DEFAULT 'Pending'::character varying;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone DEFAULT now();
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS photo_reupload_remarks text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS video_reupload_remarks text;
ALTER TABLE pre_production_shoots ADD COLUMN IF NOT EXISTS verification_draft jsonb;

-- Missing columns for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email character varying(255) NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role character varying(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles text[] DEFAULT '{}'::text[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp without time zone DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id integer;

