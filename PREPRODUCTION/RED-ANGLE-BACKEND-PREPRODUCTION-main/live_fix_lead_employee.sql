CREATE TABLE IF NOT EXISTS public.lead_employee (
    lead_employee_id text,
    lead_id text,
    task_name text,
    flow_stage text,
    priority character varying(50),
    deadline date,
    created_at timestamp without time zone,
    employee_id integer,
    employee_first_name character varying(100),
    employee_last_name character varying(100),
    status character varying(50),
    invoice_data jsonb
);
