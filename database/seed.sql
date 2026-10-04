-- =========================================================
-- Seed Data for Complaint Management System
-- Database: PostgreSQL
-- =========================================================

-- Clear existing data
TRUNCATE TABLE statuses, complaints, departments, users RESTART IDENTITY CASCADE;

-- 1. Insert Users
INSERT INTO users (first_name, last_name, email, phone_number) VALUES
('Arneesh', 'M', 'arneesh@example.com', '9876543210'),
('Ashwin', 'S', 'ashwin@example.com', '9876543211'),
('Hemesh', 'S V', 'hemesh@example.com', '9876543212'),
('Rahul', 'K', 'rahul@example.com', '9876543213'),
('Priya', 'R', 'priya@example.com', '9876543214');

-- 2. Insert Departments
INSERT INTO departments (department_name, location, service_area) VALUES
('Electrical Department', 'Block A - Room 101', 'Electrical systems & power supply'),
('Maintenance Department', 'Block B - Room 104', 'Civil repairs & plumbing'),
('Transport Department', 'Main Gate Office', 'Bus routes & vehicle maintenance'),
('IT Department', 'Tech Park - 2nd Floor', 'Network, Wi-Fi & computer labs'),
('Hostel Department', 'Hostel Block C', 'Hostel amenities & room allocation'),
('Academic Department', 'Admin Building - Room 202', 'Course registration & exam cell');

-- 3. Insert Complaints
INSERT INTO complaints (user_id, department_id, category, description, complaint_state, created_at) VALUES
(1, 1, 'Electrical', 'Corridor lights are not working on the 2nd floor of Block A', 'Resolved', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 5, 'Hostel', 'Water supply problem in Hostel Block C, 3rd floor restrooms', 'In Progress', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(3, 3, 'Transport', 'College bus Route 12 arrives late consistently at the North stop', 'Pending', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 4, 'IT', 'Wi-Fi connection is unavailable in Computer Lab 3', 'Resolved', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 2, 'Maintenance', 'Classroom 102 ceiling fan is making loud noise', 'In Progress', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(5, 6, 'Academic', 'Library portal login credentials error for final year students', 'Pending', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 4, 'IT', 'Projector in Seminar Hall 1 HDMI port is damaged', 'Pending', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(2, 1, 'Electrical', 'AC unit leaking water in the Central Library reading room', 'In Progress', CURRENT_TIMESTAMP - INTERVAL '6 hours');

-- 4. Insert Status History Records
INSERT INTO statuses (complaint_id, status, resolved_date, remarks, resolution_time) VALUES
-- Complaint 1: Resolved
(1, 'Pending', NULL, 'Complaint registered by student', NULL),
(1, 'In Progress', NULL, 'Electrician assigned to inspect corridor wiring', NULL),
(1, 'Resolved', '2026-10-01', 'Electrical issue repaired successfully. Replaced blown fuse and bulb.', '2 days'),

-- Complaint 2: In Progress
(2, 'Pending', NULL, 'Complaint registered by student', NULL),
(2, 'In Progress', NULL, 'Plumber dispatched to check water pump pressure', NULL),

-- Complaint 3: Pending
(3, 'Pending', NULL, 'Complaint registered by student. Forwarded to transport manager.', NULL),

-- Complaint 4: Resolved
(4, 'Pending', NULL, 'Complaint registered by student', NULL),
(4, 'In Progress', NULL, 'Network administrator inspecting router AP-03', NULL),
(4, 'Resolved', '2026-10-03', 'Access point rebooted and firmware updated. Wi-Fi restored.', '1 day'),

-- Complaint 5: In Progress
(5, 'Pending', NULL, 'Complaint registered by student', NULL),
(5, 'In Progress', NULL, 'Maintenance worker ordered replacement bearing for fan', NULL),

-- Complaint 6: Pending
(6, 'Pending', NULL, 'Complaint registered by student. Queued for IT admin review.', NULL),

-- Complaint 7: Pending
(7, 'Pending', NULL, 'Complaint registered by student. Inspection scheduled.', NULL),

-- Complaint 8: In Progress
(8, 'Pending', NULL, 'Complaint registered by student', NULL),
(8, 'In Progress', NULL, 'HVAC technician checking drainage pipe of AC unit', NULL);
