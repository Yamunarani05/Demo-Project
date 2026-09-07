-- ==============================================================================
-- LUMINA Photography Management SaaS - Seed Data
-- 001_seed_data.sql
-- Default Demo Password for all seeded users: 123456789
-- ==============================================================================

-- 1. STUDIOS
INSERT INTO studios (id, name, slug, tagline, logo, cover_image, email, phone, city, state, status, plan, amount, trial_status, trial_start_date, trial_end_date, payment_status, registration_date)
VALUES
('studio_1', 'Studio Aurora', 'studio-aurora', 'Artistic & Cinematic Wedding Storytellers', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80', 'priya@studioaurora.in', '+91 98401 11223', 'Bangalore', 'Karnataka', 'active', 'Studio Pro', 2850000, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '5 days', 'PAYMENT_PENDING', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('studio_2', 'Pixel Stories Productions', 'pixel-stories', 'Luxury Destination Weddings & Royal Shoots', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80', 'hello@pixelstories.in', '+91 98200 67890', 'Mumbai', 'Maharashtra', 'active', 'Enterprise', 3420000, 'CONVERTED', CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP - INTERVAL '38 days', 'PAYMENT_SUCCESS', CURRENT_TIMESTAMP - INTERVAL '45 days'),
('studio_3', 'Lens Studio & Co.', 'lens-studio', 'Timeless South Indian Wedding Photographers', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80', 'connect@lensstudio.co', '+91 98480 11223', 'Hyderabad', 'Telangana', 'active', 'Studio Pro', 3150000, 'CONVERTED', CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP - INTERVAL '53 days', 'PAYMENT_SUCCESS', CURRENT_TIMESTAMP - INTERVAL '60 days'),
('studio_4', 'Royal Knot Cinematography', 'royal-knot', 'Grand Heritage & Palace Weddings', 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&auto=format&fit=crop&q=80', 'bookings@royalknot.in', '+91 99100 44556', 'Jaipur', 'Rajasthan', 'active', 'Enterprise', 4100000, 'CONVERTED', CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP - INTERVAL '83 days', 'PAYMENT_SUCCESS', CURRENT_TIMESTAMP - INTERVAL '90 days'),
('studio_5', 'Vibrant Moments Photography', 'vibrant-moments', 'Natural Light, Backwater & Candid Experts', 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&auto=format&fit=crop&q=80', 'info@vibrantmoments.com', '+91 94470 55667', 'Kochi', 'Kerala', 'active', 'Starter', 1450000, 'ACTIVE', CURRENT_TIMESTAMP - INTERVAL '1 days', CURRENT_TIMESTAMP + INTERVAL '6 days', 'PENDING', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('studio_6', 'Aura Visuals', 'aura-visuals', 'Hills & Nature Pre-Wedding Specialist', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&auto=format&fit=crop&q=80', 'team@auravisuals.in', '+91 98940 77889', 'Coimbatore', 'Tamil Nadu', 'pending', 'Starter', 620000, 'PENDING', NULL, NULL, 'PENDING', CURRENT_TIMESTAMP - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS (bcrypt hash of '123456789' is $2a$10$7vN5iW6m1v1nO8x1m9vM2u1J8rRkH4U8eX6v5g9s2l1k0j9h8g7f)
INSERT INTO users (id, studio_id, name, email, password_hash, phone, role, avatar, status)
VALUES
('usr_super_admin', NULL, 'Rajesh Malhotra', 'master@greatmaster.io', '$2a$10$eE0m93D6j8aC0x2W9rLg.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa', '+91 98000 00001', 'great_master', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'active'),
('usr_studio_aurora', 'studio_1', 'Priya Sharma', 'priya@studioaurora.in', '$2a$10$eE0m93D6j8aC0x2W9rLg.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa', '+91 98401 11223', 'studio_admin', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'active'),
('usr_studio_pixel', 'studio_2', 'Aakash Mehta', 'admin@pixelstories.in', '$2a$10$eE0m93D6j8aC0x2W9rLg.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa', '+91 98200 67890', 'studio_admin', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'active'),
('usr_sales_krishna', 'studio_1', 'Krishna S', 'krishna@lumina.io', '$2a$10$eE0m93D6j8aC0x2W9rLg.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa', '+91 93618 80503', 'sales', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'active'),
('usr_photographer_karthik', 'studio_1', 'Karthik Rajan', 'karthik@dreamframes.in', '$2a$10$eE0m93D6j8aC0x2W9rLg.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa', '+91 98402 33445', 'photographer', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'active'),
('usr_client_arun', 'studio_1', 'Arun & Priya', 'arun.priya@gmail.com', '$2a$10$eE0m93D6j8aC0x2W9rLg.u8bJ1vK0rP7wS3jE2vM5nB4vC3xZ1yAa', '+91 98840 98765', 'client', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. CLIENTS
INSERT INTO clients (id, studio_id, serial_number, name, couple_name, email, phone, address, city, event_type, shoot_type, event_date, location, package, budget, paid_amount, status, notes)
VALUES
('client_1', 'studio_1', 'CL-01', 'Arun & Priya', 'Arun & Priya', 'arun.priya@gmail.com', '+91 98840 98765', 'Indiranagar 100ft Rd', 'Bangalore', 'Destination Wedding', 'Both', CURRENT_DATE + INTERVAL '45 days', 'Palace Grounds, Bangalore', 'Royal Heritage Package', 250000, 150000, 'active', 'Couple wants vintage warm aesthetic with 4K drone highlights.'),
('client_2', 'studio_1', 'CL-02', 'Vikram & Ananya', 'Vikram & Ananya', 'vikram.ananya@outlook.com', '+91 97120 54321', 'Koramangala 4th Block', 'Bangalore', 'Pre-Wedding Shoot', 'Pre-Wedding', CURRENT_DATE + INTERVAL '12 days', 'Nandi Hills & Grover Vineyards', 'Cinematic Sunset Package', 95000, 50000, 'active', 'Early morning sunrise shoot at sunrise viewpoint.'),
('client_3', 'studio_2', 'CL-03', 'Rahul & Meena', 'Rahul & Meena', 'rahul.meena@gmail.com', '+91 98201 11224', 'Bandra West', 'Mumbai', 'Royal Heritage Wedding', 'Both', CURRENT_DATE + INTERVAL '60 days', 'Taj Lands End, Mumbai', 'Imperial Grand Wedding', 450000, 200000, 'active', '3-day grand wedding with Sangeet and reception.')
ON CONFLICT (id) DO NOTHING;

-- 4. PROJECTS
INSERT INTO projects (id, studio_id, client_id, project_name, project_type, event_date, location, theme, description, status, budget, advance_paid, balance_due, photographer_name, cinematographer_name, progress_percent, photo_count, selected_photo_count, edited_photo_count)
VALUES
('proj_1', 'studio_1', 'client_1', 'Arun & Priya — Royal Heritage Wedding', 'Wedding', CURRENT_DATE + INTERVAL '45 days', 'Palace Grounds, Bangalore', 'Royal Vintage Gold', 'Full 3-day wedding coverage with drone cinematography.', 'PLANNING', 250000, 150000, 100000, 'Karthik Rajan', 'Vijay Anand', 35, 1200, 450, 120),
('proj_2', 'studio_1', 'client_2', 'Vikram & Ananya — Sunset Hills Pre-Wedding', 'Pre-Wedding', CURRENT_DATE + INTERVAL '12 days', 'Nandi Hills', 'Golden Hour Romantic', 'Stylized candid couple shoot at vineyard and sunrise peak.', 'CONFIRMED', 95000, 50000, 45000, 'Karthik Rajan', 'Vijay Anand', 20, 600, 200, 50),
('proj_3', 'studio_2', 'client_3', 'Rahul & Meena — Destination Extravaganza', 'Wedding', CURRENT_DATE + INTERVAL '60 days', 'Taj Lands End, Mumbai', 'Luxury Coastal Floral', 'Beachside luxury destination wedding coverage.', 'SHOOTING', 450000, 200000, 250000, 'Rohan Deshmukh', 'Anita Sharma', 55, 3400, 800, 250)
ON CONFLICT (id) DO NOTHING;

-- 5. LEADS (Sales & Client Workspace)
INSERT INTO leads (id, lead_code, studio_id, client_name, phone, email, event_type, event_date, location, source, estimated_budget, interested_package, status, priority, assigned_sales_person, notes)
VALUES
('lead_1', 'LD-01', 'studio_1', 'Aditi Verma', '+91 98450 12345', 'aditi.verma@gmail.com', 'Destination Wedding', CURRENT_DATE + INTERVAL '75 days', 'Udaipur, Rajasthan', 'Instagram Ad', 350000, 'Royal Heritage Collection', 'To Do', 'High', 'Krishna S', 'Wants 3-day luxury palace shoot with drone film.'),
('lead_2', 'LD-02', 'studio_1', 'Rohan & Sneha', '+91 97400 67890', 'rohan.sneha@yahoo.com', 'Pre-Wedding', CURRENT_DATE + INTERVAL '30 days', 'Kabini Forest Resort', 'Referral', 120000, 'Wilderness Cinematic', 'In Review', 'Medium', 'Krishna S', 'Interested in wildlife and misty forest sunrise frames.'),
('lead_3', 'LD-03', 'studio_1', 'Gaurav Singhania', '+91 99000 44556', 'gaurav.s@singhania.com', 'Engagement & Reception', CURRENT_DATE + INTERVAL '20 days', 'Leela Palace, Bangalore', 'Google Search', 180000, 'Contemporary Elegance', 'Done', 'High', 'Priya Sharma', 'Quotation approved. Deposit received.')
ON CONFLICT (id) DO NOTHING;

-- 6. PACKAGES
INSERT INTO packages (id, studio_id, name, category, description, price, duration, photographers_count, edited_photos_count, album, video, addons, availability, status)
VALUES
('pkg_1', 'studio_1', 'Classic Pre-Wedding', 'Pre-Wedding', 'Romantic 1-day couple session at 2 picturesque locations with 4K teaser video.', 45000, '1 Day (6 Hours)', 1, 40, 'Premium 20-Page Linen Book', '2-Min 4K Cinematic Teaser', '["Drone Aerials", "Smoke Bombs", "Outfit Styling"]'::jsonb, 'Available', 'active'),
('pkg_2', 'studio_1', 'Royal Heritage Wedding', 'Wedding', 'Comprehensive 2-day multi-camera traditional and candid wedding coverage.', 185000, '2 Days', 3, 250, 'Handcrafted Leather Bound 50-Page Album', '15-Min Cinematic Highlight Film + Teaser', '["Same-Day Edit", "Live Drone Streaming", "Parent Mini Albums"]'::jsonb, 'Available', 'active'),
('pkg_3', 'studio_1', 'Imperial Grand Wedding', 'Wedding', 'The ultimate luxury wedding experience featuring a full cinema crew and heirloom albums.', 350000, '3 Days', 5, 500, 'Two 60-Page Acrylic Glass Albums', '30-Min Feature Film + 3-Min Instagram Reel', '["Director Cut", "Vanity Van Styling", "VR 360 Capture"]'::jsonb, 'Available', 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. QUOTATIONS
INSERT INTO quotations (id, quotation_number, studio_id, lead_id, client_name, client_contact, client_email, event_type, event_date, location, package_name, package_price, addons, discount_percent, discount_amount, tax_percent, tax_amount, final_amount, valid_until, status)
VALUES
('quot_1', 'QT-2026-001', 'studio_1', 'lead_1', 'Aditi Verma', '+91 98450 12345', 'aditi.verma@gmail.com', 'Destination Wedding', CURRENT_DATE + INTERVAL '75 days', 'Udaipur, Rajasthan', 'Royal Heritage Wedding', 185000, '[{"name":"Drone Aerials","price":15000}]'::jsonb, 5, 10000, 18.00, 34200, 224200, CURRENT_DATE + INTERVAL '14 days', 'SENT'),
('quot_2', 'QT-2026-002', 'studio_1', 'lead_3', 'Gaurav Singhania', '+91 99000 44556', 'gaurav.s@singhania.com', 'Engagement & Reception', CURRENT_DATE + INTERVAL '20 days', 'Leela Palace, Bangalore', 'Classic Pre-Wedding', 45000, '[]'::jsonb, 0, 0, 18.00, 8100, 53100, CURRENT_DATE + INTERVAL '7 days', 'ACCEPTED')
ON CONFLICT (id) DO NOTHING;

-- 8. INVOICES (Matches frontend SalesInvoice columns & statuses)
INSERT INTO invoices (id, invoice_number, studio_id, lead_id, client_name, contact_number, employee_assigned, plan, billing_date, due_date, total_amount, discount, paid_amount, balance_amount, payment_status, approval_status, notes)
VALUES
('inv_1', 'INV-166', 'studio_1', 'lead_1', 'Mohan S', '9361880503', 'Krishna S', 'Basic', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days', 65000, 5000, 65000, 0, 'Paid', 'Approved', 'Full upfront payment received via NEFT.'),
('inv_2', 'INV-165', 'studio_1', 'lead_2', 'Mohan S', '9361880503', 'Krishna S', 'Premium', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '16 days', 145000, 10000, 145000, 0, 'Paid', 'Approved', 'Premium wedding package advance cleared.'),
('inv_3', 'INV-144', 'studio_1', 'lead_3', 'Kavitha S', '9790123456', 'emp p', 'Gold Tier', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '20 days', 120000, 0, 80000, 40000, 'Partial Payment', 'Approved', 'Second milestone due upon album approval.'),
('inv_4', 'INV-107', 'studio_1', NULL, 'Hems S', '1234568761', 'Not Assigned', '—', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 35000, 0, 0, 35000, '—', 'Not Approved', 'Draft invoice pending Great Master approval.')
ON CONFLICT (id) DO NOTHING;

-- 9. PAYMENTS
INSERT INTO payments (id, studio_id, invoice_id, invoice_number, amount, currency, status, payment_method, date, notes)
VALUES
('pay_1', 'studio_1', 'inv_1', 'INV-166', 65000, 'INR', 'paid', 'Bank Transfer', CURRENT_DATE - INTERVAL '14 days', 'Transaction ref: HDFC998822'),
('pay_2', 'studio_1', 'inv_2', 'INV-165', 145000, 'INR', 'paid', 'UPI / Razorpay', CURRENT_DATE - INTERVAL '14 days', 'Razorpay pay_lumina_001'),
('pay_3', 'studio_1', 'inv_3', 'INV-144', 80000, 'INR', 'paid', 'Credit Card', CURRENT_DATE - INTERVAL '40 days', 'Initial booking advance')
ON CONFLICT (id) DO NOTHING;

-- 10. SALES APPROVALS
INSERT INTO sales_approvals (id, studio_id, lead_code, client_name, requested_by, type, amount, date, status)
VALUES
('app_1', 'studio_1', 'LD-07', 'Hems S', 'Unassigned', 'Special 10% Discount Request', 35000, CURRENT_DATE - INTERVAL '3 days', 'Pending'),
('app_2', 'studio_1', 'LD-06', 'Mohan S', 'Krishna S', 'Complimentary Photobook Add-on', 65000, CURRENT_DATE - INTERVAL '14 days', 'Approved'),
('app_3', 'studio_1', 'RAS-03', 'Kavitha S', 'emp p', 'Invoice Split Milestone (40/60)', 120000, CURRENT_DATE - INTERVAL '16 days', 'Approved')
ON CONFLICT (id) DO NOTHING;

-- 11. EMPLOYEE ATTENDANCES
INSERT INTO employee_attendances (id, studio_id, employee_name, role, date, check_in, check_out, status)
VALUES
('att_1', 'studio_1', 'Krishna S', 'Lead Manager', CURRENT_DATE, '09:15 AM', '06:30 PM', 'Present'),
('att_2', 'studio_1', 'emp p', 'Sales Executive', CURRENT_DATE, '09:45 AM', '06:45 PM', 'Late'),
('att_3', 'studio_1', 'Priya Sharma', 'Senior Client Associate', CURRENT_DATE, '09:05 AM', '06:15 PM', 'Present'),
('att_4', 'studio_1', 'Arjun Reddy', 'Cinematography Consultant', CURRENT_DATE, '09:00 AM', '06:00 PM', 'Present'),
('att_5', 'studio_1', 'Rahul Mehta', 'Field Account Manager', CURRENT_DATE, '—', '—', 'Absent')
ON CONFLICT (id) DO NOTHING;

-- 12. NOTIFICATIONS
INSERT INTO notifications (id, studio_id, user_id, recipient_role, title, message, type, is_read, link)
VALUES
('notif_1', 'studio_1', 'usr_super_admin', 'great_master', 'New Studio Registration Pending', 'Aura Visuals from Coimbatore submitted trial application.', 'info', false, '/great-master/approvals'),
('notif_2', 'studio_1', 'usr_studio_aurora', 'studio_admin', 'Invoice INV-166 Paid in Full', 'Client Mohan S cleared 65,000 INR invoice via Bank Transfer.', 'success', true, '/sales/invoice'),
('notif_3', 'studio_1', 'usr_studio_aurora', 'studio_admin', 'Upcoming Shoot in 12 Days', 'Vikram & Ananya Pre-Wedding scheduled at Nandi Hills.', 'urgent', false, '/studio/workflow')
ON CONFLICT (id) DO NOTHING;

-- 13. ACTIVITY LOGS
INSERT INTO activity_logs (id, studio_id, user_id, actor_name, actor_role, action, entity_type, entity_id, description, details)
VALUES
('act_1', 'studio_1', 'usr_super_admin', 'Rajesh Malhotra', 'Great Master', 'Platform Audit', 'Platform', 'global', 'Verified production readiness and database health.', 'All services online with 6 verified studios.'),
('act_2', 'studio_1', 'usr_studio_aurora', 'Priya Sharma', 'Studio Admin', 'Created Invoice', 'Invoice', 'INV-166', 'Generated invoice for Mohan S with 5,000 INR discount.', 'Package: Basic Photography Session'),
('act_3', 'studio_1', 'usr_sales_krishna', 'Krishna S', 'Sales Manager', 'Converted Lead', 'Lead', 'LD-03', 'Converted Gaurav Singhania to active booking.', 'Budget: 180,000 INR')
ON CONFLICT (id) DO NOTHING;
