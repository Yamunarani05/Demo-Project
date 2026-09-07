/**
 * Demo API Network Interceptor
 * Intercepts all outgoing HTTP requests when running in Demo Mode
 * and returns isolated, mock demo responses.
 * Guarantees that inner modules never read or write to real production server data.
 */

import axios from 'axios';
import {
    getDemoWorkflowState,
    INITIAL_DEMO_CLIENTS,
    INITIAL_DEMO_EVENTS,
    INITIAL_DEMO_OFFLOADS,
    INITIAL_DEMO_POST_TASKS
} from './demoDataSeeder';

export function setupDemoApiInterceptor(): void {
    axios.interceptors.request.use(async (config) => {
        // Never intercept real Admin routes under /admin
        if (window.location.pathname.startsWith('/admin')) {
            return config;
        }

        const isDemo = localStorage.getItem('is_demo_mode') === 'true' || localStorage.getItem('demo_sandbox_active') === 'true';
        if (!isDemo) return config;

        const url = config.url || '';

        let mockData: any = { success: true, message: 'Demo operation completed in isolated sandbox mode.' };

        if (url.includes('/employees')) {
            const storedEmps = localStorage.getItem('demo_employees_data');
            let empList: any[] = [];
            if (storedEmps) {
                try { empList = JSON.parse(storedEmps); } catch (e) { empList = []; }
            }
            if (!Array.isArray(empList) || empList.length === 0) {
                empList = [
                    { employee_id: 'EMP-001', id: 'EMP-001', first_name: 'Rajesh', last_name: 'Kumar', name: 'Rajesh Kumar', role: 'Photographer', roles: ['Photographer'], email: 'photographer@demo.com', contact_number: '+91 9876543210', phone: '+91 9876543210', status: 'Active' },
                    { employee_id: 'EMP-002', id: 'EMP-002', first_name: 'Amitabh', last_name: 'Sen', name: 'Amitabh Sen', role: 'Videographer', roles: ['Videographer'], email: 'videographer@demo.com', contact_number: '+91 9876543211', phone: '+91 9876543211', status: 'Active' },
                    { employee_id: 'EMP-003', id: 'EMP-003', first_name: 'Karan', last_name: 'Joshi', name: 'Karan Joshi', role: 'Drone Operator', roles: ['Drone Operator'], email: 'drone@demo.com', contact_number: '+91 9876543212', phone: '+91 9876543212', status: 'Active' },
                    { employee_id: 'EMP-004', id: 'EMP-004', first_name: 'Simran', last_name: 'Kaur', name: 'Simran Kaur', role: 'Event Coordinator', roles: ['Event Coordinator'], email: 'event-coordinator@demo.com', contact_number: '+91 9876543213', phone: '+91 9876543213', status: 'Active' },
                    { employee_id: 'EMP-005', id: 'EMP-005', first_name: 'Aarav', last_name: 'Mehta', name: 'Aarav Mehta', role: 'Pre-production CRM', roles: ['Pre-production CRM'], email: 'pre-production-crm@demo.com', contact_number: '+91 9876543214', phone: '+91 9876543214', status: 'Active' },
                    { employee_id: 'EMP-006', id: 'EMP-006', first_name: 'Rohan', last_name: 'Malhotra', name: 'Rohan Malhotra', role: 'Post-production CRM', roles: ['Post-production CRM'], email: 'post-production-crm@demo.com', contact_number: '+91 9876543215', phone: '+91 9876543215', status: 'Active' },
                    { employee_id: 'EMP-007', id: 'EMP-007', first_name: 'Kunal', last_name: 'Kapoor', name: 'Kunal Kapoor', role: 'Candid Video Editor', roles: ['Candid Video Editor'], email: 'candid-video-editor@demo.com', contact_number: '+91 9876543216', phone: '+91 9876543216', status: 'Active' },
                    { employee_id: 'EMP-008', id: 'EMP-008', first_name: 'Ritu', last_name: 'Varma', name: 'Ritu Varma', role: 'Retouch Editor', roles: ['Retouch Editor'], email: 'retouch-editor@demo.com', contact_number: '+91 9876543217', phone: '+91 9876543217', status: 'Active' },
                    { employee_id: 'EMP-009', id: 'EMP-009', first_name: 'Vikram', last_name: 'Patel', name: 'Vikram Patel', role: 'Data Manager', roles: ['Data Manager'], email: 'data-manager@demo.com', contact_number: '+91 9876543218', phone: '+91 9876543218', status: 'Active' },
                    { employee_id: 'EMP-010', id: 'EMP-010', first_name: 'Priya', last_name: 'Verma', name: 'Priya Verma', role: 'Operational Manager', roles: ['Operational Manager'], email: 'operational-manager@demo.com', contact_number: '+91 9876543219', phone: '+91 9876543219', status: 'Active' }
                ];
                localStorage.setItem('demo_employees_data', JSON.stringify(empList));
            }
            mockData = {
                success: true,
                data: empList
            };
        } else if (url.includes('/externalLeads') || url.includes('/crm/leads') || url.includes('/clients')) {
            const demoClients = JSON.parse(localStorage.getItem('demo_clients_data') || JSON.stringify(INITIAL_DEMO_CLIENTS));
            mockData = { success: true, data: demoClients };
        } else if (url.includes('/assign-team')) {
            mockData = {
                success: true,
                data: {
                    photographer: 'Rajesh Kumar (Demo)',
                    videographer: 'Amitabh Sen (Demo)',
                    drone: 'Karan Joshi (Demo)',
                    coordinator: 'Simran Kaur (Demo)'
                }
            };
        } else if (url.includes('/notifications')) {
            mockData = {
                success: true,
                data: [
                    { id: 'NOTIF-001', title: 'Demo Event Assigned', message: 'Ananya & Vikram Wedding shoot assigned to your crew.', is_read: false, created_at: new Date().toISOString() },
                    { id: 'NOTIF-002', title: 'RAW Data Verification', message: 'Card SD-RED-042 verified by Data Manager.', is_read: false, created_at: new Date().toISOString() }
                ]
            };
        } else if (url.includes('/stage') || url.includes('/phase-info') || url.includes('/stage-tracking') || url.includes('/tracker')) {
            mockData = {
                success: true,
                data: getDemoWorkflowState()
            };
        } else if (url.includes('/data-manager') || url.includes('/offloads')) {
            const demoOffloads = JSON.parse(localStorage.getItem('demo_offloads_data') || JSON.stringify(INITIAL_DEMO_OFFLOADS));
            mockData = { success: true, data: demoOffloads };
        } else if (url.includes('/employee-projects')) {
            const demoTasks = JSON.parse(localStorage.getItem('demo_post_tasks_data') || JSON.stringify(INITIAL_DEMO_POST_TASKS));
            mockData = { success: true, data: demoTasks };
        } else if (url.includes('/events')) {
            const demoEvents = JSON.parse(localStorage.getItem('demo_events_data') || JSON.stringify(INITIAL_DEMO_EVENTS));
            mockData = { success: true, data: demoEvents };
        }

        // Return mock Axios response adapter to completely bypass live network calls in Demo Mode
        config.adapter = async () => ({
            data: mockData,
            status: 200,
            statusText: 'OK (Isolated Demo Mode)',
            headers: {},
            config
        });

        return config;
    });
}
